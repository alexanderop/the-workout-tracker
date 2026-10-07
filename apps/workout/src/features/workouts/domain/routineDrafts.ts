import { routineSchema, type Routine } from "../domain";

export type RoutineValues = Omit<Routine, "id">;
export type RoutineDraft = {
  name: string;
  description: string;
  exercises: readonly {
    exerciseId: string;
    sets: readonly { weightKg: string | number; reps: string | number }[];
  }[];
};
export const routineValuesSchema = routineSchema.unwrap().omit({ id: true });

export function parseRoutineDraft(draft: RoutineDraft): RoutineValues | null {
  const result = routineValuesSchema.safeParse({
    name: draft.name,
    description: draft.description.trim(),
    exercises: draft.exercises.map((entry) => ({
      exerciseId: entry.exerciseId,
      sets: entry.sets.map((set) => ({
        weightKg: String(set.weightKg).trim() ? Number(set.weightKg) : NaN,
        reps: String(set.reps).trim() ? Number(set.reps) : NaN,
      })),
    })),
  });
  return result.success ? result.data : null;
}

export function compareRoutineBaseline(
  baseline: Routine,
  saved: Routine | undefined,
): "unchanged" | "changed" | "deleted" {
  if (!saved) return "deleted";
  const unchanged = baseline.id === saved.id &&
    baseline.name === saved.name &&
    baseline.description === saved.description &&
    baseline.exercises.length === saved.exercises.length &&
    baseline.exercises.every((entry, index) => {
      const current = saved.exercises[index]!;
      return entry.exerciseId === current.exerciseId &&
        entry.sets.length === current.sets.length &&
        entry.sets.every((set, setIndex) =>
          set.weightKg === current.sets[setIndex]!.weightKg &&
          set.reps === current.sets[setIndex]!.reps,
        );
    });
  return unchanged ? "unchanged" : "changed";
}
