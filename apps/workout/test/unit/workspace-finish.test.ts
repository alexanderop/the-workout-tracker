import { afterEach, describe, expect, expectTypeOf, it } from "vitest";
import { effectScope, ref, type EffectScope } from "vue";
import { createWorkouts } from "../../src/features/workouts/application";
import { useWorkoutWorkspace } from "../../src/features/workouts/ui/useWorkoutWorkspace";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";
import { createMemoryJournal, createMemoryStorage } from "../support/memory-ports";

const scopes: EffectScope[] = [];
afterEach(() => {
  for (const scope of scopes.splice(0)) scope.stop();
});
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
