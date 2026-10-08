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

  it("rejects numeric notations a person would not type as weight or repetitions", () => {
    for (const values of [
      { weight: "0x10", reps: "8" },
      { weight: "1e1", reps: "8" },
      { weight: "40", reps: "0x10" },
      { weight: "40", reps: "1e1" },
      { weight: "40", reps: "+8" },
      { weight: "40.", reps: "8" },
      { weight: ".5", reps: "8" },
      { weight: "4,0,0", reps: "8" },
      { weight: "40", reps: "8.0" },
    ])
      expect(parseSetValues(values), JSON.stringify(values)).toBeNull();
  });

  it("accepts the inclusive 0 and 1000 limits but nothing beyond them", () => {
    expect(parseSetValues({ weight: "0", reps: "0" })).toEqual({
      weightKg: 0,
      reps: 0,
    });
    expect(parseSetValues({ weight: "1000", reps: "1000" })).toEqual({
      weightKg: 1000,
      reps: 1000,
    });
    expect(parseSetValues({ weight: "1000,0", reps: "8" })).toEqual({
      weightKg: 1000,
      reps: 8,
    });
    expect(parseSetValues({ weight: "1000.5", reps: "8" })).toBeNull();
    expect(parseSetValues({ weight: "40", reps: "1001" })).toBeNull();
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
