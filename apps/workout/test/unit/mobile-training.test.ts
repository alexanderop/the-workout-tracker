import { expect, it } from "vitest";
import { effectScope, ref } from "vue";
import { createWorkouts } from "../../src/features/workouts/application";
import { useWorkoutWorkspace } from "../../src/features/workouts/ui/useWorkoutWorkspace";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";
import {
  createMemoryJournal,
  createMemoryStorage,
} from "../support/memory-ports";

it("repeated logging is nonmutating and explicit undo preserves corrected values", async () => {
  const factory = createWorkoutFactory("mobile");
  const set = factory.set();
  const active = factory.activeSession({
    exercises: [factory.sessionExercise({ sets: [set] })],
  });
  const storage = createMemoryStorage(factory.snapshot({ active }));
  const { journal } = createMemoryJournal(factory.id);
  const service = createWorkouts({
    storage: storage.storage,
    journal,
    now: () => FIXED_NOW,
    id: factory.id,
  });
  const scope = effectScope();
  try {
    const workspace = scope.run(() =>
      useWorkoutWorkspace(service, journal, ref(FIXED_NOW)),
    )!;
    await workspace.training.commit(set.id);
    const logged = storage.current();
    await workspace.training.commit(set.id);
    expect(storage.current()).toEqual(logged);
    workspace.training.edit(set.id, { weight: "55" });
    await workspace.training.undoSet(set.id);
    expect(storage.current()).toEqual(logged);
    expect(workspace.training.rows.get(set.id)?.weight).toBe("55");
    await workspace.training.commit(set.id);
    expect(storage.current().active?.exercises[0]?.sets[0]).toMatchObject({
      completed: true,
      weightKg: 55,
    });
    await workspace.training.undoSet(set.id);
    expect(storage.current().active?.exercises[0]?.sets[0]).toMatchObject({
      completed: false,
      weightKg: 55,
      reps: 8,
    });
  } finally {
    scope.stop();
  }
});

it("last-log undo refuses while the logged set has unsaved input", async () => {
  const factory = createWorkoutFactory("mobile-undo");
  const set = factory.set();
  const active = factory.activeSession({
    exercises: [factory.sessionExercise({ sets: [set] })],
  });
  const storage = createMemoryStorage(factory.snapshot({ active }));
  const { journal } = createMemoryJournal(factory.id);
  const service = createWorkouts({
    storage: storage.storage,
    journal,
    now: () => FIXED_NOW,
    id: factory.id,
  });
  const scope = effectScope();
  try {
    const workspace = scope.run(() =>
      useWorkoutWorkspace(service, journal, ref(FIXED_NOW)),
    )!;
    await workspace.training.commit(set.id);
    const logged = storage.current();
    expect(workspace.training.lastLog.value?.setId).toBe(set.id);
    workspace.training.edit(set.id, { weight: "55" });
    await workspace.training.undo();
    expect(storage.current()).toEqual(logged);
    expect(workspace.training.rows.get(set.id)?.weight).toBe("55");
    expect(workspace.training.notice.value).toMatch(/before undoing/);
    workspace.training.useSaved(set.id);
    await workspace.training.undo();
    expect(storage.current().active?.exercises[0]?.sets[0]?.completed).toBe(
      false,
    );
  } finally {
    scope.stop();
  }
});
