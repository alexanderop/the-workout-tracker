import { afterEach, describe, expect, expectTypeOf, it } from "vitest";
import { effectScope, nextTick, ref, type EffectScope } from "vue";
import { createWorkouts } from "../../src/features/workouts/application";
import type { WorkoutStorage } from "../../src/features/workouts/ports";
import { useWorkoutWorkspace } from "../../src/features/workouts/ui/useWorkoutWorkspace";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";
import { createMemoryJournal, createMemoryStorage } from "../support/memory-ports";

const scopes: EffectScope[] = [];
function setup() {
  const factory = createWorkoutFactory("finish");
  const set = factory.set({ completed: true });
  const active = factory.activeSession({ exercises: [factory.sessionExercise({ sets: [set] })] });
  const storage = createMemoryStorage(factory.snapshot({ active }));
  const { journal } = createMemoryJournal(factory.id);
  const service = createWorkouts({ storage: storage.storage, journal, now: () => FIXED_NOW, id: factory.id });
  const scope = effectScope();
  scopes.push(scope);
  const workspace = scope.run(() => useWorkoutWorkspace(service, journal, ref(FIXED_NOW)))!;
  return { workspace, storage, active, set, journal };
}

const noop = () => {};

/** Two tabs share storage and the draft journal; `during` runs inside tab A's commit. */
function race() {
  const factory = createWorkoutFactory("race");
  const set = factory.set({ completed: true });
  const active = factory.activeSession({ exercises: [factory.sessionExercise({ sets: [set] })] });
  const storage = createMemoryStorage(factory.snapshot({ active }));
  const drafts = createMemoryJournal(factory.id);
  let during = noop;
  const committing: WorkoutStorage = {
    ...storage.storage,
    async compareAndSave(revision, snapshot) {
      during();
      return storage.storage.compareAndSave(revision, snapshot);
    },
  };
  const open = (target: WorkoutStorage) => {
    const service = createWorkouts({ storage: target, journal: drafts.journal, now: () => FIXED_NOW, id: factory.id });
    const scope = effectScope();
    scopes.push(scope);
    const workspace = scope.run(() => useWorkoutWorkspace(service, drafts.journal, ref(FIXED_NOW)));
    if (!workspace) throw new Error("The workspace was not created.");
    return workspace;
  };
  const tabA = open(committing);
  const tabB = open(storage.storage);
  return { tabA, tabB, storage, drafts, active, set, open, onCommit: (run: () => void) => (during = run) };
}

describe("workspace finish", () => {
  afterEach(() => {
    for (const scope of scopes.splice(0)) scope.stop();
  });

  describe.each(["workspace", "training"] as const)("%s finish boundary", (entry) => {
    it("preserves an unsaved name even when a caller skips the button guard", async () => {
      const { workspace, storage, active } = setup();
      const runner = entry === "workspace" ? workspace : workspace.training;
      workspace.workoutName.text.value = "Unsaved name";
      expect(await runner.run({ type: "finish", sessionId: active.id })).toBeNull();
      expect(storage.current().active?.id).toBe(active.id);
      expect(storage.current().completed).toEqual({});
      expect(workspace.workoutName.text.value).toBe("Unsaved name");
      expect(workspace.error.value).toBe("Save or cancel your name change before finishing.");
      await workspace.workoutName.save();
      expect(await runner.run({ type: "finish", sessionId: active.id })).not.toBeNull();
      expect(storage.current().active).toBeNull();
      expect(storage.current().completed[active.id]?.name).toBe("Unsaved name");
    });

    it("preserves numeric input until it is explicitly saved", async () => {
      const { workspace, storage, active, set } = setup();
      const runner = entry === "workspace" ? workspace : workspace.training;
      workspace.training.edit(set.id, { weight: "55" });
      expect(await runner.run({ type: "finish", sessionId: active.id })).toBeNull();
      expect(storage.current().active?.id).toBe(active.id);
      expect(storage.current().completed).toEqual({});
      expect(workspace.training.rows.get(set.id)?.weight).toBe("55");
      expect(await workspace.training.saveEdits()).toBe(true);
      expect(await runner.run({ type: "finish", sessionId: active.id })).not.toBeNull();
      expect(storage.current().completed[active.id]?.exercises[0]?.sets[0]?.weightKg).toBe(55);
    });

    it("checks newly arrived journal drafts before finishing", async () => {
      const { workspace, storage, active, set, journal } = setup();
      const runner = entry === "workspace" ? workspace : workspace.training;
      journal.write({ sessionId: active.id, setId: set.id, weight: "65", reps: "8", revision: 0, base: set });
      expect(await runner.run({ type: "finish", sessionId: active.id })).toBeNull();
      expect(storage.current().active?.id).toBe(active.id);
      expect(workspace.training.pending.value[0]?.weight).toBe("65");
    });

    it("retains the caller's revision when routing a finish command", async () => {
      const { workspace, storage, active } = setup();
      const runner = entry === "workspace" ? workspace : workspace.training;
      await workspace.run({ type: "settings", settings: { restSeconds: 30, autoRest: false } });
      expect(await runner.run({ type: "finish", sessionId: active.id }, 0)).toBeNull();
      expect(storage.current().active?.id).toBe(active.id);
      expect(storage.current().revision).toBe(1);
      expect(await runner.run({ type: "finish", sessionId: active.id }, 1)).not.toBeNull();
      expect(storage.current().completed[active.id]?.id).toBe(active.id);
    });
  });

  describe("drafts arriving while a finish commits", () => {
    it("keeps and surfaces another tab's journal draft instead of pruning it", async () => {
      const { tabA, storage, drafts, active, set, open, onCommit } = race();
      onCommit(() => {
        drafts.journal.write({ sessionId: active.id, setId: set.id, weight: "65", reps: "8", revision: 0, base: set });
      });
      expect(await tabA.run({ type: "finish", sessionId: active.id })).not.toBeNull();
      await nextTick();
      expect(storage.current().completed[active.id]).toBeDefined();
      expect(drafts.current().map((draft) => draft.weight)).toEqual(["65"]);
      expect(tabA.training.detached.value).toMatchObject([
        { sessionId: active.id, setId: set.id, weight: "65", reps: "8" },
      ]);
      expect(tabA.error.value).toContain("Bench press set 1: 65 kg × 8");
      const reloaded = open(storage.storage);
      expect(reloaded.training.detached.value).toMatchObject([{ setId: set.id, weight: "65" }]);
      expect(tabA.training.dismissDetached()).toBe(true);
      expect(drafts.current()).toEqual([]);
      expect(tabA.training.detached.value).toEqual([]);
    });

    it("surfaces a tab's own pending input when another tab finishes the workout", async () => {
      const { tabA, tabB, drafts, active, set, onCommit } = race();
      onCommit(() => tabB.training.edit(set.id, { weight: "70" }));
      expect(await tabA.run({ type: "finish", sessionId: active.id })).not.toBeNull();
      await nextTick();
      expect(drafts.current().map((draft) => draft.weight)).toEqual(["70"]);
      expect(tabB.training.detached.value).toMatchObject([{ setId: set.id, weight: "70" }]);
      expect(tabB.error.value).toContain("Bench press set 1: 70 kg × 8");
    });

    it("silently acknowledges finished drafts that match the saved values", async () => {
      const { tabA, drafts, active, set, onCommit } = race();
      onCommit(() => {
        drafts.journal.write({ sessionId: active.id, setId: set.id, weight: "40", reps: "8", revision: 0, base: set });
      });
      expect(await tabA.run({ type: "finish", sessionId: active.id })).not.toBeNull();
      await nextTick();
      expect(drafts.current()).toEqual([]);
      expect(tabA.training.detached.value).toEqual([]);
      expect(tabA.error.value).toBe("");
    });
  });

  it("exposes data management without a raw command executor", () => {
    const { workspace } = setup();
    expectTypeOf(workspace.service).not.toHaveProperty("execute");
    expect(workspace.service).not.toHaveProperty("execute");
  });

  it("logging preserves a local workout name through the saved snapshot update", async () => {
    const { workspace, active, set } = setup();
    workspace.workoutName.text.value = "Local draft name";
    await workspace.run({ type: "set-completed", sessionId: active.id, setId: set.id, completed: false });
    await workspace.run({ type: "set-completed", sessionId: active.id, setId: set.id, completed: true });
    expect(workspace.workoutName.text.value).toBe("Local draft name");
    expect(workspace.workoutName.dirty.value).toBe(true);
    await workspace.workoutName.save();
    expect(workspace.active.value?.name).toBe("Local draft name");
  });
});
