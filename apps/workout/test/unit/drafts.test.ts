import { expect, it } from "vitest";
import {
  parseSetValues,
  sameSet,
} from "../../src/features/workouts/domain/drafts";
it("accepts decimal input and rejects unfinished or invalid values", () => {
  expect(parseSetValues({ weight: "82,5", reps: "8" })).toEqual({
    weightKg: 82.5,
    reps: 8,
  });
  for (const raw of [
    { weight: "", reps: "8" },
    { weight: "5", reps: "" },
    { weight: "5", reps: "1.5" },
    { weight: "Infinity", reps: "8" },
  ])
    expect(parseSetValues(raw)).toBeNull();
});
it("recognizes changes to the exact set including completion", () => {
  expect(
    sameSet(
      { weightKg: 40, reps: 8, completed: false },
      { id: "a", weightKg: 40, reps: 8, completed: false },
    ),
  ).toBe(true);
  expect(
    sameSet(
      { weightKg: 40, reps: 8, completed: false },
      { id: "a", weightKg: 40, reps: 8, completed: true },
    ),
  ).toBe(false);
});
