import { describe, expect, it } from "vitest";
import {
  parseSetValues,
  sameSet,
} from "../../src/features/workouts/domain/drafts";
import { createWorkoutFactory } from "../support/factories";

describe("raw numeric drafts", () => {
  it("accepts decimal commas and zero-repetition attempts without accepting incomplete numbers", () => {
    expect(parseSetValues({ weight: "42,5", reps: "0" })).toEqual({
      weightKg: 42.5,
      reps: 0,
    });
    for (const values of [
      { weight: "", reps: "8" },
      { weight: "40", reps: "" },
      { weight: "-1", reps: "8" },
      { weight: "40", reps: "2.5" },
      { weight: "Infinity", reps: "8" },
      { weight: "1001", reps: "8" },
    ])
      expect(parseSetValues(values)).toBeNull();
  });

  it("detects changes to a set's values or target without treating its identity as an edit", () => {
    const factory = createWorkoutFactory();
    const set = factory.set();
    expect(sameSet(set, factory.set())).toBe(true);
    expect(sameSet(set, { ...set, targetReps: 10 })).toBe(false);
    expect(sameSet(set, { ...set, completed: true })).toBe(false);
    expect(sameSet(set, { ...set, weightKg: 45 })).toBe(false);
  });
});
