import { describe, expect, it } from "vitest";
import {
  reduceWorkout,
  type Command,
} from "../../src/features/workouts/domain";
import {
  completedCorrection,
  completedDraft,
} from "../../src/features/workouts/domain/completedDrafts";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";

function setup() {
  const factory = createWorkoutFactory("correction");
  const legacy = { id: factory.id(), weightKg: 40, reps: 8, completed: true };
  const logged = factory.set({ completed: true });
  const unlogged = factory.set();
  const exercise = factory.sessionExercise({
    note: "Keep note",
    sets: [legacy, logged, unlogged],
  });
  const completed = factory.completedSession({ exercises: [exercise] });
  const active = factory.activeSession({
    exercises: [
      factory.sessionExercise({ sets: [factory.set({ completed: true })] }),
    ],
  });
  const snapshot = factory.snapshot({
    active: {
      ...active,
      rest: {
        setId: active.exercises[0]!.sets[0]!.id,
        endsAt: FIXED_NOW + 1000,
      },
    },
    completed: { [completed.id]: completed },
  });
  const command: Extract<Command, { type: "correct-completed" }> = {
    type: "correct-completed",
    sessionId: completed.id,
    name: " Corrected name ",
    sets: [
      { exerciseId: exercise.id, setId: legacy.id, weightKg: 50, reps: 0 },
      { exerciseId: exercise.id, setId: logged.id, weightKg: 60, reps: 6 },
    ],
  };
  return {
    snapshot,
    completed,
    exercise,
    legacy,
    logged,
    unlogged,
    command,
    inputs: { at: FIXED_NOW, id: factory.id },
  };
}
describe("completed workout correction", () => {
  it("atomically corrects logged values and name while preserving all other data", () => {
    const { snapshot, completed, command, inputs } = setup();
    const result = reduceWorkout(snapshot, command, inputs);
    expect(result.kind).toBe("changed");
    if (result.kind !== "changed") throw new Error("Expected correction");
    expect(result.snapshot).toEqual({
      ...snapshot,
      revision: 1,
      completed: {
        [completed.id]: {
          ...completed,
          name: "Corrected name",
          exercises: completed.exercises.map((exercise) => ({
            ...exercise,
            sets: [
              { ...exercise.sets[0], weightKg: 50, reps: 0 },
              { ...exercise.sets[1], weightKg: 60, reps: 6 },
              exercise.sets[2],
            ],
          })),
        },
      },
    });
    expect(
      result.snapshot.completed[completed.id]!.exercises[0]!.sets[0],
    ).not.toHaveProperty("targetReps");
    expect(reduceWorkout(result.snapshot, command, inputs)).toEqual({
      kind: "unchanged",
      snapshot: result.snapshot,
    });
  });
  it.each([
    "missing",
    "wrong-exercise",
    "unlogged",
    "duplicate",
    "invalid-weight",
    "fractional-reps",
    "negative-reps",
  ])(
    "rejects %s without partially applying the name or first patch",
    (failure) => {
      const { snapshot, command, inputs, unlogged } = setup();
      const patch = command.sets[1]!;
      const bad = {
        ...patch,
        ...(failure === "missing" ? { setId: "absent" } : {}),
        ...(failure === "wrong-exercise" ? { exerciseId: "absent" } : {}),
        ...(failure === "unlogged" ? { setId: unlogged.id } : {}),
        ...(failure === "duplicate" ? { setId: command.sets[0]!.setId } : {}),
        ...(failure === "invalid-weight" ? { weightKg: 1001 } : {}),
        ...(failure === "fractional-reps" ? { reps: 1.5 } : {}),
        ...(failure === "negative-reps" ? { reps: -1 } : {}),
      };
      expect(
        reduceWorkout(
          snapshot,
          { ...command, sets: [command.sets[0]!, bad] },
          inputs,
        ).kind,
      ).toBe("rejected");
      expect(snapshot.revision).toBe(0);
      expect(snapshot.completed[command.sessionId]?.name).toBe(
        "Previous workout",
      );
    },
  );
  it("rejects a missing completed workout and leaves empty correction unchanged", () => {
    const { snapshot, command, inputs } = setup();
    expect(
      reduceWorkout(snapshot, { ...command, sessionId: "absent" }, inputs).kind,
    ).toBe("rejected");
    expect(
      reduceWorkout(
        snapshot,
        { type: "correct-completed", sessionId: command.sessionId, sets: [] },
        inputs,
      ),
    ).toEqual({ kind: "unchanged", snapshot });
  });
  it("builds changed-only patches and rejects raw empty or invalid values", () => {
    const { completed, command } = setup();
    const draft = completedDraft(completed);
    expect(draft.sets).toHaveLength(2);
    expect(completedCorrection(completed, draft)).toEqual({
      type: "correct-completed",
      sessionId: completed.id,
      sets: [],
    });
    draft.sets[0]!.reps = "0";
    expect(completedCorrection(completed, draft)?.sets).toEqual([
      { ...command.sets[0], weightKg: 40 },
    ]);
    draft.sets[0]!.weightKg = "";
    expect(completedCorrection(completed, draft)).toBeNull();
    draft.sets[0]!.weightKg = "oops";
    expect(completedCorrection(completed, draft)).toBeNull();
  });
});
