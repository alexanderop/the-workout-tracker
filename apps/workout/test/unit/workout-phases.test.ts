import { describe, expect, it } from "vitest";
import {
  acceptsCommand,
  commandPhases,
  reduceWorkout,
  workoutPhase,
  type Command,
  type WorkoutPhase,
} from "../../src/features/workouts/domain";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";

function fixture() {
  const factory = createWorkoutFactory("phases");
  const set = factory.set({ completed: true });
  const exercise = factory.sessionExercise({ sets: [set, factory.set()] });
  const active = factory.activeSession({
    exercises: [exercise, factory.sessionExercise()],
  });
  const routine = {
    id: "press",
    name: "Press day",
    description: "",
    exercises: [
      { exerciseId: "bench-press", sets: [{ weightKg: 60, reps: 6 }] },
    ],
  };
  const routines = { [routine.id]: routine };
  const completed = factory.completedSession();
  const history = { [completed.id]: completed };
  const idle = factory.snapshot({ routines, completed: history });
  const training = factory.snapshot({ active, routines, completed: history });
  const resting = factory.snapshot({
    active: { ...active, rest: { setId: set.id, endsAt: FIXED_NOW + 90_000 } },
    routines,
    completed: history,
  });
  const otherExerciseId = "squat";
  const target = { sessionId: active.id, exerciseId: exercise.id };
  // Typed as a complete record so a new command type fails to compile here.
  const commands: Record<Command["type"], Command> = {
    settings: {
      type: "settings",
      settings: { restSeconds: 60, autoRest: false },
    },
    "save-routine": {
      type: "save-routine",
      routine: { ...routine, id: "pull" },
    },
    "save-exercise": {
      type: "save-exercise",
      exercise: factory.exercise({ id: "custom-press" }),
    },
    "rename-completed": {
      type: "rename-completed",
      sessionId: completed.id,
      name: "Renamed history",
    },
    "correct-completed": {
      type: "correct-completed",
      sessionId: completed.id,
      name: "Corrected history",
      sets: [],
    },
    start: { type: "start", routineId: routine.id },
    "start-selected": {
      type: "start-selected",
      exerciseIds: [exercise.exerciseId],
    },
    repeat: { type: "repeat", completedId: completed.id },
    rename: { type: "rename", sessionId: active.id, name: "Renamed" },
    discard: { type: "discard", sessionId: active.id },
    finish: { type: "finish", sessionId: active.id },
    "stop-rest": { type: "stop-rest", sessionId: active.id },
    "add-exercise": {
      type: "add-exercise",
      sessionId: active.id,
      exerciseId: exercise.exerciseId,
    },
    "add-exercises": {
      type: "add-exercises",
      sessionId: active.id,
      exerciseIds: [exercise.exerciseId],
    },
    "remove-exercise": { type: "remove-exercise", ...target },
    "set-exercise-note": { type: "set-exercise-note", ...target, note: "note" },
    "replace-exercise": {
      type: "replace-exercise",
      ...target,
      replacementExerciseId: otherExerciseId,
    },
    "configure-exercise": {
      type: "configure-exercise",
      ...target,
      setCount: 2,
    },
    "add-set": { type: "add-set", ...target },
    "remove-set": { type: "remove-set", ...target, setId: set.id },
    "set-entry": {
      type: "set-entry",
      ...target,
      setId: set.id,
      weightKg: 50,
      reps: 5,
      completed: true,
    },
    "set-values": {
      type: "set-values",
      ...target,
      setId: set.id,
      weightKg: 50,
      reps: 5,
    },
    "set-completed": {
      type: "set-completed",
      sessionId: active.id,
      setId: set.id,
      completed: false,
    },
  };
  return { factory, commands, idle, training, resting };
}

describe("workout phases", () => {
  it("names the lifecycle from the snapshot", () => {
    const { idle, training, resting } = fixture();
    expect(workoutPhase(idle)).toBe("idle");
    expect(workoutPhase(training)).toBe("training");
    expect(workoutPhase(resting)).toBe("resting");
  });

  it("accepts each command exactly in the phases the table allows", () => {
    const { factory, commands, idle, training, resting } = fixture();
    const seen = new Set<WorkoutPhase>();
    for (const command of Object.values(commands)) {
      const type = command.type;
      for (const snapshot of [idle, training, resting]) {
        const phase = workoutPhase(snapshot);
        seen.add(phase);
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
    expect([...seen].sort()).toEqual(["idle", "resting", "training"]);
    expect(Object.keys(commandPhases).sort()).toEqual(
      Object.keys(commands).sort(),
    );
  });

  it("rejects commands for the wrong phase with a message naming the phase", () => {
    const { factory, commands, idle, resting } = fixture();
    const inputs = { at: FIXED_NOW, id: factory.id };
    expect(reduceWorkout(resting, commands.start, inputs)).toEqual({
      kind: "rejected",
      code: "finishCurrentFirst",
      message: "Finish your current workout first.",
    });
    expect(reduceWorkout(idle, commands["add-set"], inputs)).toEqual({
      kind: "rejected",
      code: "noLongerActive",
      message: "This workout is no longer active.",
    });
  });
});
