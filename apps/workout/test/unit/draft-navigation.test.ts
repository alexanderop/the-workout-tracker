import { afterEach, describe, expect, it } from "vitest";
import { effectScope, nextTick, ref, type EffectScope } from "vue";
import { useTrainingSession } from "../../src/features/workouts/ui/useTrainingSession";
import { createWorkouts } from "../../src/features/workouts/application";
import type { Snapshot } from "../../src/features/workouts/domain";
import type { SetDraft } from "../../src/features/workouts/domain/drafts";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";
import { createMemoryJournal, createMemoryStorage } from "../support/memory-ports";

const scopes: EffectScope[] = [];
afterEach(() => {
  for (const scope of scopes.splice(0)) scope.stop();
});
function setup(initial: Snapshot, drafts: readonly SetDraft[] = [], loaded = true) {
  const factory = createWorkoutFactory("navigation");
  const snapshot = ref<Snapshot | null>(loaded ? initial : null);
  const journal = createMemoryJournal(factory.id, drafts).journal;
  const storage = createMemoryStorage(initial).storage;
  const service = createWorkouts({ storage, journal, now: () => FIXED_NOW, id: factory.id });
  const scope = effectScope();
  scopes.push(scope);
  const training = scope.run(() => useTrainingSession({
    snapshot,
    saving: ref(false),
    journal,
    async run(command, revision = snapshot.value?.revision ?? 0) {
      const result = await service.execute(command, revision);
      if (result.isErr()) return null;
      snapshot.value = result.value;
      await nextTick();
      return result.value;
    },
  }))!;
  return { training, snapshot };
}

describe("training navigation", () => {
  it("selects unfinished work when the initial snapshot arrives asynchronously", async () => {
    const f = createWorkoutFactory();
    const first = f.sessionExercise({ sets: [f.set({ completed: true })] });
    const second = f.sessionExercise();
    const initial = f.snapshot({ active: f.activeSession({ exercises: [first, second] }) });
    const { training, snapshot } = setup(initial, [], false);
    snapshot.value = initial;
    await nextTick();
    expect(training.currentExercise.value?.id).toBe(second.id);
  });

  it("resumes the first unfinished exercise and keeps it selected after its last set is logged", async () => {
    const f = createWorkoutFactory();
    const finished = f.sessionExercise({ sets: [f.set({ completed: true })] });
    const unfinished = f.sessionExercise({ name: "Squat", sets: [f.set()] });
    const later = f.sessionExercise({ name: "Deadlift" });
    const { training } = setup(f.snapshot({ active: f.activeSession({ exercises: [finished, unfinished, later] }) }));
    expect(training.currentExercise.value?.id).toBe(unfinished.id);
    await training.commit(unfinished.sets[0]!.id);
    expect(training.rows.get(unfinished.sets[0]!.id)?.set.completed).toBe(true);
    expect(training.currentExercise.value?.id).toBe(unfinished.id);
  });

  it("recovers a pending input before choosing an unfinished exercise", () => {
    const f = createWorkoutFactory();
    const first = f.sessionExercise();
    const pending = f.sessionExercise({ sets: [f.set({ completed: true })] });
    const active = f.activeSession({ exercises: [first, pending] });
    const set = pending.sets[0]!;
    const draft = f.draft({ sessionId: active.id, setId: set.id, base: set });
    const { training } = setup(f.snapshot({ active }), [draft]);
    expect(training.currentExercise.value?.id).toBe(pending.id);
    expect(training.current.value?.set.id).toBe(set.id);
    expect(training.current.value?.weight).toBe("45");
  });

  it("orders pending input by canonical exercise order after a snapshot reorder", async () => {
    const f = createWorkoutFactory();
    const first = f.sessionExercise();
    const second = f.sessionExercise();
    const active = f.activeSession({ exercises: [first, second] });
    const { training, snapshot } = setup(f.snapshot({ active }));
    training.edit(first.sets[0]!.id, { weight: "50" });
    training.edit(second.sets[0]!.id, { weight: "60" });
    snapshot.value = f.snapshot({ active: { ...active, exercises: [second, first] } });
    await nextTick();
    expect(training.pending.value.map(row => row.set.id)).toEqual([second.sets[0]!.id, first.sets[0]!.id]);
  });
});
