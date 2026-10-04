import { effectScope } from "vue";
import { expect, it } from "vitest";
import {
  createWorkouts,
  type DraftJournal,
  type Workouts,
} from "../../src/features/workouts";
import { createDraftJournal } from "../../src/features/workouts/adapters/browser-drafts";
import { useTrainingSession } from "../../src/features/workouts/ui/useTrainingSession";
import { useWorkouts } from "../../src/features/workouts/ui/useWorkouts";
import { memoryDatabase } from "../support/memory-storage";
const journal = () =>
  createDraftJournal({
    storage: () => localStorage,
    id: () => crypto.randomUUID(),
  });
async function service() {
  localStorage.clear();
  const app = createWorkouts({
    storage: memoryDatabase().open(),
    now: () => 1000,
    id: () => crypto.randomUUID(),
  });
  await app.execute({ type: "start", routineId: "upper-body" }, 0);
  return app;
}
function controller(
  app: Workouts,
  drafts: DraftJournal,
  afterRun?: (
    snapshot: NonNullable<ReturnType<typeof useWorkouts>["snapshot"]["value"]>,
  ) => void,
) {
  const scope = effectScope();
  const result = scope.run(() => {
    const state = useWorkouts(app);
    const training = useTrainingSession({
      ...state,
      journal: drafts,
      run: async (command, revision) => {
        const saved = await state.run(command, revision);
        if (saved) afterRun?.(saved);
        return saved;
      },
    });
    return { state, training };
  })!;
  return { ...result, close: () => scope.stop() };
}
it("acknowledges only drafts observed before committing, keeping a newer rival edit", async () => {
  const app = await service();
  const drafts = journal();
  const rival = journal();
  const view = controller(app, drafts, (snapshot) => {
    const session = snapshot.active!;
    const set = session.exercises[0]!.sets[0]!;
    rival.write({
      sessionId: session.id,
      setId: set.id,
      weight: "75",
      reps: "8",
      revision: snapshot.revision,
      base: {
        weightKg: set.weightKg,
        reps: set.reps,
        completed: set.completed,
      },
    });
  });
  try {
    await expect.poll(() => view.training.rows.size).toBe(12);
    const row = view.training.current.value!;
    view.training.edit(row.set.id, { weight: "60" });
    await view.training.commit(row.set.id);
    expect(
      drafts.recover(view.state.snapshot.value!.active!.id, row.set.id),
    ).toMatchObject([
      { weight: "75", base: { weightKg: 60, completed: true } },
    ]);
  } finally {
    view.close();
    app.close();
  }
});
it("blocks recovered drafts after completion and undo even when cleanup failed and values match again", async () => {
  const app = await service();
  const drafts = journal();
  const view = controller(app, {
    ...drafts,
    consume() {
      throw new Error("Storage unavailable");
    },
  });
  try {
    await expect.poll(() => view.training.rows.size).toBe(12);
    const row = view.training.current.value!;
    view.training.edit(row.set.id, { weight: "0" });
    await view.training.commit(row.set.id);
    await view.training.undo();
    const reopened = controller(app, journal());
    try {
      await expect.poll(() => reopened.training.rows.size).toBe(12);
      const recovered = reopened.training.rows.get(row.set.id)!;
      expect(recovered.weight).toBe("0");
      expect(reopened.training.conflict(recovered)).toBe(true);
      await reopened.training.commit(row.set.id);
      expect(recovered.issue).toContain("changed in another tab");
      expect(recovered.set.completed).toBe(false);
      reopened.training.useSaved(row.set.id);
      expect(reopened.training.conflict(recovered)).toBe(false);
      expect(
        drafts.recover(reopened.state.snapshot.value!.active!.id, row.set.id),
      ).toEqual([]);
    } finally {
      reopened.close();
    }
  } finally {
    view.close();
    app.close();
  }
});
it("clears retired drafts without touching input from a newer session", async () => {
  const app = await service();
  const drafts = journal();
  const view = controller(app, drafts);
  try {
    await expect.poll(() => view.training.rows.size).toBe(12);
    const row = view.training.current.value!;
    const sessionId = view.state.snapshot.value!.active!.id;
    view.training.edit(row.set.id, { weight: "82.5" });
    const unrelated = drafts.write({
      sessionId: "other-session",
      setId: "other-set",
      weight: "35",
      reps: "5",
      base: { weightKg: 0, reps: 8, completed: false },
      revision: 10,
    });
    await view.training.run({
      type: "remove-set",
      sessionId,
      exerciseId: row.exercise.id,
      setId: row.set.id,
    });
    expect(drafts.recover(sessionId, row.set.id)).toEqual([]);
    const remaining = view.training.current.value!;
    view.training.edit(remaining.set.id, { weight: "60" });
    await view.training.run({ type: "discard", sessionId });
    expect(drafts.recover(sessionId, remaining.set.id)).toEqual([]);
    expect(drafts.recover("other-session", "other-set")).toEqual([unrelated]);
  } finally {
    view.close();
    app.close();
  }
});

it("keeps a live conflict blocked after another tab returns the set to its original baseline", async () => {
  const app = await service();
  const view = controller(app, journal());
  try {
    await expect.poll(() => view.training.rows.size).toBe(12);
    const row = view.training.current.value!;
    const sessionId = view.state.snapshot.value!.active!.id;
    view.training.edit(row.set.id, { weight: "70" });
    await view.state.run({
      type: "set-completed",
      sessionId,
      setId: row.set.id,
      completed: true,
    });
    await expect.poll(() => view.training.conflict(row)).toBe(true);
    await view.state.run({
      type: "set-completed",
      sessionId,
      setId: row.set.id,
      completed: false,
    });
    await expect.poll(() => row.set.completed).toBe(false);
    expect(view.training.conflict(row)).toBe(true);
    await view.training.commit(row.set.id);
    expect(row.issue).toContain("changed in another tab");
    expect(row.weight).toBe("70");
  } finally {
    view.close();
    app.close();
  }
});

it("keeps intended input only after explicitly adopting the latest saved baseline", async () => {
  const app = await service();
  const view = controller(app, journal());
  try {
    await expect.poll(() => view.training.rows.size).toBe(12);
    const row = view.training.current.value!;
    const sessionId = view.state.snapshot.value!.active!.id;
    view.training.edit(row.set.id, { weight: "70", reps: "5" });
    await view.state.run({
      type: "set-entry",
      sessionId,
      exerciseId: row.exercise.id,
      setId: row.set.id,
      weightKg: 60,
      reps: 8,
      completed: true,
    });
    await expect.poll(() => view.training.conflict(row)).toBe(true);
    expect(row.weight).toBe("70");
    expect(row.set.weightKg).toBe(60);
    view.training.keepInput(row.set.id);
    expect(view.training.conflict(row)).toBe(false);
    await view.training.commit(row.set.id);
    expect(row.set).toMatchObject({ weightKg: 70, reps: 5, completed: true });
  } finally {
    view.close();
    app.close();
  }
});
