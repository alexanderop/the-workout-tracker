import { describe, expect, it } from "vitest";
import type { Routine } from "../../src/features/workouts/domain";
import { compareRoutineBaseline } from "../../src/features/workouts/domain/routineDrafts";

const baseline: Routine = {
  id: "press-day",
  name: "Press day",
  description: "Start gently",
  exercises: [
    { exerciseId: "bench-press", sets: [{ weightKg: 40, reps: 8 }, { weightKg: 35, reps: 10 }] },
    { exerciseId: "squat", sets: [{ weightKg: 60, reps: 6 }] },
  ],
};

describe("template editing baseline", () => {
  it("accepts the same saved content after an unrelated snapshot change", () => {
    expect(compareRoutineBaseline(baseline, structuredClone(baseline))).toBe("unchanged");
  });

  it.each<Routine>([
    { ...baseline, name: "New name" },
    { ...baseline, description: "Different instructions" },
    { ...baseline, exercises: [...baseline.exercises].reverse() },
    { ...baseline, exercises: baseline.exercises.slice(0, 1) },
    { ...baseline, exercises: [{ exerciseId: "squat", sets: baseline.exercises[0]!.sets }, baseline.exercises[1]!] },
    { ...baseline, exercises: [{ ...baseline.exercises[0]!, sets: [{ weightKg: 45, reps: 8 }, { weightKg: 35, reps: 10 }] }, baseline.exercises[1]!] },
    { ...baseline, exercises: [{ ...baseline.exercises[0]!, sets: [{ weightKg: 40, reps: 9 }, { weightKg: 35, reps: 10 }] }, baseline.exercises[1]!] },
    { ...baseline, exercises: [{ ...baseline.exercises[0]!, sets: [...baseline.exercises[0]!.sets].reverse() }, baseline.exercises[1]!] },
    { ...baseline, exercises: [{ ...baseline.exercises[0]!, sets: baseline.exercises[0]!.sets.slice(0, 1) }, baseline.exercises[1]!] },
  ])("requires review when template content changes %#", (saved) => {
    expect(compareRoutineBaseline(baseline, saved)).toBe("changed");
  });

  it("distinguishes a deleted template from an editable conflict", () => {
    expect(compareRoutineBaseline(baseline, undefined)).toBe("deleted");
  });
});
