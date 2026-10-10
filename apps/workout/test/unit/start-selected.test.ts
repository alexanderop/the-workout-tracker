import { describe, expect, it } from "vitest";
import {
  commandSchema,
  reduceWorkout,
} from "../../src/features/workouts/domain";
import { lastExercisePerformance } from "../../src/features/workouts/domain/exerciseHistory";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";

describe("selected workout start", () => {
  it.each([
    [],
    ["bench-press", "bench-press"],
    Array.from({ length: 51 }, (_, index) => `exercise-${index}`),
  ])("rejects invalid selections %j", (exerciseIds) => {
    expect(
      commandSchema.safeParse({ type: "start-selected", exerciseIds }).success,
    ).toBe(false);
  });
  it("keeps template targets while making fresh unlogged sets", () => {
    const f = createWorkoutFactory();
    const snapshot = f.snapshot({
      routines: {
        press: {
          id: "press",
          name: "Press day",
          description: "",
          exercises: [
            {
              exerciseId: "bench-press",
              sets: [
                { weightKg: 60, reps: 6 },
                { weightKg: 55, reps: 8 },
              ],
            },
          ],
        },
      },
    });
    const result = reduceWorkout(
      snapshot,
      { type: "start", routineId: "press" },
      { at: FIXED_NOW, id: f.id },
    );
    expect(result.kind).toBe("changed");
    if (result.kind === "rejected") throw new Error(result.message);
    expect(result.snapshot.active).toMatchObject({
      name: "Press day",
      startedAt: FIXED_NOW,
      exercises: [
        {
          exerciseId: "bench-press",
          sets: [
            { weightKg: 60, reps: 6, targetReps: 6, completed: false },
            { weightKg: 55, reps: 8, targetReps: 8, completed: false },
          ],
        },
      ],
    });
    expect(result.snapshot.routines).toEqual(snapshot.routines);
  });
  it("names the workout in the caller's language and falls back to English", () => {
    const f = createWorkoutFactory();
    const named = reduceWorkout(
      f.snapshot(),
      {
        type: "start-selected",
        exerciseIds: ["bench-press"],
        name: "Neues Training",
      },
      { at: FIXED_NOW, id: f.id },
    );
    const unnamed = reduceWorkout(
      f.snapshot(),
      { type: "start-selected", exerciseIds: ["bench-press"] },
      { at: FIXED_NOW, id: f.id },
    );
    if (named.kind === "rejected" || unnamed.kind === "rejected")
      throw new Error("start rejected");
    expect(named.snapshot.active?.name).toBe("Neues Training");
    expect(unnamed.snapshot.active?.name).toBe("New workout");
    expect(
      commandSchema.safeParse({
        type: "start-selected",
        exerciseIds: ["bench-press"],
        name: "  ",
      }).success,
    ).toBe(false);
  });
  it("rejects missing catalog entries and an already active workout", () => {
    const f = createWorkoutFactory();
    expect(
      reduceWorkout(
        f.snapshot(),
        { type: "start-selected", exerciseIds: ["bench-press", "missing"] },
        { at: FIXED_NOW, id: f.id },
      ).kind,
    ).toBe("rejected");
    expect(
      reduceWorkout(
        f.snapshot({ active: f.activeSession() }),
        { type: "start-selected", exerciseIds: ["bench-press"] },
        { at: FIXED_NOW, id: f.id },
      ).kind,
    ).toBe("rejected");
  });
});

describe("last exercise performance", () => {
  it("combines matching entries in the latest logged session including failed attempts", () => {
    const f = createWorkoutFactory();
    const first = f.set({ completed: true, weightKg: 60, reps: 8 });
    const failed = f.set({ completed: true, weightKg: 65, reps: 0 });
    const old = f.completedSession({ finishedAt: FIXED_NOW - 1000 });
    const latest = f.completedSession({
      exercises: [
        f.sessionExercise({ sets: [first, f.set()] }),
        f.sessionExercise({ sets: [failed] }),
      ],
    });
    const unlogged = f.completedSession({
      finishedAt: FIXED_NOW + 1000,
      exercises: [f.sessionExercise()],
    });
    expect(
      lastExercisePerformance(
        { [old.id]: old, [latest.id]: latest, [unlogged.id]: unlogged },
        "bench-press",
      ),
    ).toEqual({ finishedAt: FIXED_NOW, sets: [first, failed] });
    expect(
      lastExercisePerformance({ [latest.id]: latest }, "squat"),
    ).toBeNull();
  });
});
