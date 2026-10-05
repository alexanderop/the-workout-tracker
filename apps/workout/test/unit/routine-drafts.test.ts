import { describe, expect, it } from "vitest";
import {
  parseRoutineDraft,
  type RoutineDraft,
} from "../../src/features/workouts/domain/routineDrafts";

describe("template draft validation", () => {
  const draft: RoutineDraft = {
    name: "  Press day  ",
    description: "  Start gently  ",
    exercises: [
      {
        exerciseId: "bench-press",
        sets: [
          { weightKg: "42.5", reps: "8" },
          { weightKg: 40, reps: 10 },
        ],
      },
    ],
  };

  it("trims editor text and preserves each set's distinct numeric targets", () => {
    expect(parseRoutineDraft(draft)).toEqual({
      name: "Press day",
      description: "Start gently",
      exercises: [
        {
          exerciseId: "bench-press",
          sets: [
            { weightKg: 42.5, reps: 8 },
            { weightKg: 40, reps: 10 },
          ],
        },
      ],
    });
  });

  it("rejects blank weights and zero target reps instead of coercing them into a plan", () => {
    expect(parseRoutineDraft(draft)?.name).toBe("Press day");
    for (const set of [
      { weightKg: "", reps: "8" },
      { weightKg: "40", reps: "0" },
      { weightKg: "40", reps: "1.5" },
    ]) {
      expect(
        parseRoutineDraft({
          ...draft,
          exercises: [{ exerciseId: "bench-press", sets: [set] }],
        }),
      ).toBeNull();
    }
  });
});
