import { describe, expect, it } from "vitest";
import {
  fmt,
  trainingTotals,
} from "../../src/features/workouts/ui/presentation";
import { successfulProgress } from "../../src/features/workouts/ui/progress";
import { createWorkoutFactory } from "../support/factories";

describe("precise workout values", () => {
  it("shows the complete supported weight precision", () => {
    expect(fmt(20.25)).toBe("20.25");
    expect(fmt(20)).toBe("20");
  });
});

describe("successful progress", () => {
  it("keeps failed attempts in totals without awarding a heavier personal best", () => {
    const factory = createWorkoutFactory();
    const success = factory.set({ completed: true, weightKg: 60, reps: 8 });
    const history = [
      factory.completedSession({
        exercises: [
          factory.sessionExercise({
            sets: [
              success,
              factory.set({ completed: true, weightKg: 100, reps: 0 }),
              factory.set({ weightKg: 120, reps: 8 }),
            ],
          }),
        ],
      }),
    ];
    expect(successfulProgress(history)).toEqual([
      {
        id: "bench-press",
        name: "Bench press",
        best: success,
        trend: [{ at: history[0]!.finishedAt, weight: 60 }],
      },
    ]);
    expect(trainingTotals(history)).toEqual({
      workouts: 1,
      sets: 2,
      volume: 480,
    });
  });

  it("omits a later failed-only workout from an exercise trend", () => {
    const factory = createWorkoutFactory();
    const successfulSession = factory.completedSession({
      finishedAt: 100,
      exercises: [
        factory.sessionExercise({
          sets: [factory.set({ completed: true, weightKg: 60, reps: 8 })],
        }),
      ],
    });
    const failedSession = factory.completedSession({
      finishedAt: 200,
      exercises: [
        factory.sessionExercise({
          sets: [factory.set({ completed: true, weightKg: 100, reps: 0 })],
        }),
      ],
    });
    expect(
      successfulProgress([failedSession, successfulSession])[0]?.trend,
    ).toEqual([{ at: 100, weight: 60 }]);
  });

  it("has no records or trends for only failed attempts", () => {
    const factory = createWorkoutFactory();
    const history = [
      factory.completedSession({
        exercises: [
          factory.sessionExercise({
            sets: [factory.set({ completed: true, weightKg: 100, reps: 0 })],
          }),
        ],
      }),
    ];
    expect(successfulProgress(history)).toEqual([]);
    expect(trainingTotals(history)).toEqual({
      workouts: 1,
      sets: 1,
      volume: 0,
    });
  });

  it("counts zero-weight bodyweight success and breaks weight ties by repetitions", () => {
    const factory = createWorkoutFactory();
    const best = factory.set({ completed: true, weightKg: 0, reps: 12 });
    const history = [
      factory.completedSession({
        exercises: [
          factory.sessionExercise({
            sets: [
              factory.set({ completed: true, weightKg: 0, reps: 8 }),
              best,
            ],
          }),
        ],
      }),
    ];
    expect(successfulProgress(history)[0]?.best).toEqual(best);
    expect(successfulProgress(history)[0]?.trend).toEqual([
      { at: history[0]!.finishedAt, weight: 0 },
    ]);
  });
});
