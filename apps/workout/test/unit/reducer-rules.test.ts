import { describe, expect, it } from "vitest";
import {
  initialSnapshot,
  reduceWorkout,
  snapshotSchema,
  type Command,
  type SessionExercise,
  type Snapshot,
  type Transition,
} from "../../src/features/workouts/domain";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";

const OTHER_EXERCISE_ID = "squat";
const ROUTINE = {
  id: "press",
  name: "Press day",
  description: "",
  exercises: [{ exerciseId: "bench-press", sets: [{ weightKg: 60, reps: 6 }] }],
};

function journal(exercises?: (factory: ReturnType<typeof createWorkoutFactory>) => SessionExercise[]) {
  const factory = createWorkoutFactory("rules");
  const logged = factory.set({ completed: true });
  const planned = factory.set();
  const exercise = factory.sessionExercise({ sets: [logged, planned] });
  const active = factory.activeSession({
    exercises: exercises ? exercises(factory) : [exercise, factory.sessionExercise()],
  });
  const completed = factory.completedSession();
  const snapshot = factory.snapshot({
    active,
    routines: { press: ROUTINE },
    completed: { [completed.id]: completed },
  });
  const run = (state: Snapshot, command: Command, at = FIXED_NOW): Transition =>
    reduceWorkout(state, command, { at, id: factory.id });
  const target = { sessionId: active.id, exerciseId: exercise.id };
  return { factory, snapshot, active, completed, exercise, logged, planned, target, run };
}

function rejection(transition: Transition): string | undefined {
  return transition.kind === "rejected" ? transition.message : undefined;
}

function changedSnapshot(transition: Transition): Snapshot {
  if (transition.kind !== "changed") throw new Error(`Expected a change, got ${transition.kind}.`);
  return transition.snapshot;
}

describe("given an active workout", () => {
  it("should refuse to start or repeat another workout", () => {
    const { snapshot, completed, run } = journal();
    for (const command of [
      { type: "start", routineId: ROUTINE.id },
      { type: "start-selected", exerciseIds: [OTHER_EXERCISE_ID] },
      { type: "repeat", completedId: completed.id },
    ] satisfies Command[])
      expect([command.type, rejection(run(snapshot, command))]).toEqual([
        command.type,
        "Finish your current workout first.",
      ]);
  });

  it("should keep at least one set per exercise", () => {
    const { factory, run } = journal();
    const only = factory.set();
    const exercise = factory.sessionExercise({ sets: [only] });
    const active = factory.activeSession({ exercises: [exercise, factory.sessionExercise()] });
    const result = run(factory.snapshot({ active }), {
      type: "remove-set",
      sessionId: active.id,
      exerciseId: exercise.id,
      setId: only.id,
    });
    expect(rejection(result)).toBe("Keep at least one set per exercise.");
  });

  it("should refuse a set count below the logged work", () => {
    const { factory, run } = journal();
    const exercise = factory.sessionExercise({
      sets: [factory.set({ completed: true }), factory.set({ completed: true })],
    });
    const active = factory.activeSession({ exercises: [exercise] });
    const result = run(factory.snapshot({ active }), {
      type: "configure-exercise",
      sessionId: active.id,
      exerciseId: exercise.id,
      setCount: 1,
    });
    expect(rejection(result)).toBe(
      "The set count cannot remove logged work. Clear a set explicitly first.",
    );
  });

  it("should refuse a planned set with zero repetitions", () => {
    const { snapshot, planned, target, run } = journal();
    const result = run(snapshot, {
      type: "set-values",
      ...target,
      setId: planned.id,
      weightKg: 40,
      reps: 0,
    });
    expect(rejection(result)).toBe("Planned sets need at least one target repetition.");
  });

  it("should refuse to remove its last exercise and suggest discarding instead", () => {
    const { snapshot, active, run } = journal((factory) => [
      factory.sessionExercise(),
    ]);
    const only = active.exercises[0];
    if (!only) throw new Error("fixture needs an exercise");
    const result = run(snapshot, {
      type: "remove-exercise",
      sessionId: active.id,
      exerciseId: only.id,
    });
    expect(rejection(result)).toBe(
      "A workout needs at least one exercise. Discard the workout instead.",
    );
  });

  it("should remove an exercise while others remain", () => {
    const { snapshot, target, run } = journal();
    const next = changedSnapshot(run(snapshot, { type: "remove-exercise", ...target }));
    expect(next.active?.exercises.map((row) => row.id)).not.toContain(target.exerciseId);
    expect(next.active?.exercises).toHaveLength(1);
  });

  it("should finish at its start time when the clock reads earlier", () => {
    const { snapshot, active, run } = journal();
    const next = changedSnapshot(
      run(snapshot, { type: "finish", sessionId: active.id }, active.startedAt - 60_000),
    );
    expect(next.active).toBeNull();
    expect(next.completed[active.id]?.finishedAt).toBe(active.startedAt);
  });

  it("should treat finishing an already completed workout as unchanged", () => {
    const { snapshot, active, run } = journal();
    const finished = changedSnapshot(run(snapshot, { type: "finish", sessionId: active.id }));
    expect(run(finished, { type: "finish", sessionId: active.id })).toEqual({
      kind: "unchanged",
      snapshot: finished,
    });
    expect(rejection(run(finished, { type: "finish", sessionId: "missing" }))).toBe(
      "This workout is no longer active.",
    );
  });
});

const full = (count: number) =>
  journal((factory) => [
    factory.sessionExercise({
      sets: [factory.set({ completed: true }), factory.set()],
    }),
    ...Array.from({ length: count - 1 }, () => factory.sessionExercise()),
  ]);

describe("given the 50-exercise limit", () => {
  it("should refuse additions beyond 50 exercises", () => {
    const { snapshot, active, run } = full(49);
    const message = "A workout can contain up to 50 exercises.";
    expect(
      rejection(
        run(snapshot, {
          type: "add-exercises",
          sessionId: active.id,
          exerciseIds: ["bench-press", OTHER_EXERCISE_ID],
        }),
      ),
    ).toBe(message);
    const fifty = changedSnapshot(
      run(snapshot, { type: "add-exercise", sessionId: active.id, exerciseId: OTHER_EXERCISE_ID }),
    );
    expect(
      rejection(
        run(fifty, { type: "add-exercise", sessionId: active.id, exerciseId: OTHER_EXERCISE_ID }),
      ),
    ).toBe(message);
  });

  it("should refuse a replacement that keeps a logged entry at 50 exercises", () => {
    const { snapshot, active, run } = full(50);
    const first = active.exercises[0];
    if (!first) throw new Error("fixture needs an exercise");
    const result = run(snapshot, {
      type: "replace-exercise",
      sessionId: active.id,
      exerciseId: first.id,
      replacementExerciseId: OTHER_EXERCISE_ID,
    });
    expect(rejection(result)).toBe("A workout can contain up to 50 exercises.");
  });
});

describe("given identifiers that name inherited object properties", () => {
  it("should not find a template, workout or exercise that was never stored", () => {
    const { snapshot, target, run } = journal();
    const idle = { ...snapshot, active: null };
    expect(rejection(run(idle, { type: "start", routineId: "toString" }))).toBe(
      "Routine was not found.",
    );
    expect(rejection(run(idle, { type: "start-selected", exerciseIds: ["valueOf"] }))).toBe(
      "Exercise was not found.",
    );
    expect(rejection(run(idle, { type: "repeat", completedId: "hasOwnProperty" }))).toBe(
      "Workout was not found.",
    );
    expect(
      rejection(run(idle, { type: "rename-completed", sessionId: "toString", name: "Renamed" })),
    ).toBe("This completed workout was not found.");
    expect(
      rejection(run(idle, { type: "correct-completed", sessionId: "toString", sets: [] })),
    ).toBe("This completed workout was not found.");
    expect(rejection(run(idle, { type: "finish", sessionId: "toString" }))).toBe(
      "This workout is no longer active.",
    );
    expect(
      rejection(
        run(snapshot, { type: "replace-exercise", ...target, replacementExerciseId: "toString" }),
      ),
    ).toBe("Exercise was not found.");
    expect(
      rejection(
        run(snapshot, { type: "add-exercise", sessionId: target.sessionId, exerciseId: "toString" }),
      ),
    ).toBe("Exercise was not found.");
  });

  it("should accept a new workout whose generated identity matches one", () => {
    // Selected exercise rows take the first identities; the workout takes the next.
    const ids = ["rules-a", "rules-b", "toString"];
    const result = reduceWorkout(
      initialSnapshot(),
      { type: "start-selected", exerciseIds: ["bench-press"] },
      { at: FIXED_NOW, id: () => ids.shift() ?? "rules-extra" },
    );
    expect(changedSnapshot(result).active?.id).toBe("toString");
  });

  it("should validate snapshots against stored records only", () => {
    const factory = createWorkoutFactory("schema");
    const base = initialSnapshot();
    const unknownRoutine = {
      ...base,
      routines: {
        press: { ...ROUTINE, exercises: [{ exerciseId: "toString", sets: [{ weightKg: 60, reps: 6 }] }] },
      },
    };
    expect(snapshotSchema.safeParse(unknownRoutine).success).toBe(false);
    const unknownExercise = {
      ...base,
      active: factory.activeSession({
        exercises: [factory.sessionExercise({ exerciseId: "toString" })],
      }),
    };
    expect(snapshotSchema.safeParse(unknownExercise).success).toBe(false);
    const inheritedName = { ...base, active: factory.activeSession({ id: "toString" }) };
    expect(snapshotSchema.safeParse(inheritedName).success).toBe(true);
  });
});
