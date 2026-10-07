import { describe, expect, it } from "vitest";
import {
  acceptsCommand,
  commandPhases,
  reduceWorkout,
  workoutPhase,
  type Command,
  type Snapshot,
} from "../../src/features/workouts/domain";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";

function fixture() {
  const factory = createWorkoutFactory("phases");
  const set = factory.set({ completed: true });
  const exercise = factory.sessionExercise({ sets: [set, factory.set()] });
  const active = factory.activeSession({ exercises: [exercise] });
  const routines = {
    press: {
      id: "press",
      name: "Press day",
      description: "",
      exercises: [{ exerciseId: "bench-press", sets: [{ weightKg: 60, reps: 6 }] }],
    },
  };
  const training = factory.snapshot({ active, routines });
  const idle = factory.snapshot({ routines });
  const exerciseId = exercise.exerciseId;
  const otherExerciseId = Object.keys(training.exercises).find(
    (id) => id !== exercise.exerciseId,
  );
  const routineId = "press";
  const completed = factory.completedSession();
  const target = { sessionId: active.id, exerciseId: exercise.id };
  const commands: Partial<Record<Command["type"], Command>> = {
    start: { type: "start", routineId },
    "start-selected": { type: "start-selected", exerciseIds: [exerciseId!] },
    repeat: { type: "repeat", completedId: completed.id },
    rename: { type: "rename", sessionId: active.id, name: "Renamed" },
    discard: { type: "discard", sessionId: active.id },
    finish: { type: "finish", sessionId: active.id },
    "stop-rest": { type: "stop-rest", sessionId: active.id },
    "add-exercise": { type: "add-exercise", sessionId: active.id, exerciseId: exerciseId! },
    "add-exercises": { type: "add-exercises", sessionId: active.id, exerciseIds: [exerciseId!] },
    "remove-exercise": { type: "remove-exercise", ...target },
    "set-exercise-note": { type: "set-exercise-note", ...target, note: "note" },
    "replace-exercise": { type: "replace-exercise", ...target, replacementExerciseId: otherExerciseId! },
    "configure-exercise": { type: "configure-exercise", ...target, setCount: 2 },
    "add-set": { type: "add-set", ...target },
    "remove-set": { type: "remove-set", ...target, setId: set.id },
    "set-entry": { type: "set-entry", ...target, setId: set.id, weightKg: 50, reps: 5, completed: true },
    "set-values": { type: "set-values", ...target, setId: set.id, weightKg: 50, reps: 5 },
    "set-completed": { type: "set-completed", sessionId: active.id, setId: set.id, completed: false },
  };
  const withHistory = (snapshot: Snapshot) => ({
    ...snapshot,
    completed: { [completed.id]: completed },
  });
  return {
    factory,
    commands,
    idle: withHistory(idle),
    training: withHistory(training),
  };
}

describe("workout phases", () => {
  it("names the lifecycle from the snapshot", () => {
    const { idle, training } = fixture();
    expect(workoutPhase(idle)).toBe("idle");
    expect(workoutPhase(training)).toBe("training");
    expect(
      workoutPhase({
        active: { ...training.active!, rest: { setId: "s", endsAt: FIXED_NOW } },
      }),
    ).toBe("resting");
  });

  it("rejects every command outside the phases the table allows", () => {
    const { factory, commands, idle, training } = fixture();
    for (const command of Object.values(commands)) {
      const type = command.type;
      for (const snapshot of [idle, training]) {
        const phase = workoutPhase(snapshot);
        const result = reduceWorkout(snapshot, command, {
          at: FIXED_NOW,
          id: factory.id,
        });
        const expected = acceptsCommand(phase, type) ? "accepted" : "rejected";
        expect(
          result.kind === "rejected" ? "rejected" : "accepted",
          `${type} in ${phase}`,
        ).toBe(expected);
      }
    }
    expect(Object.keys(commandPhases).sort()).toEqual(
      expect.arrayContaining(Object.keys(commands).sort()),
    );
  });
});
