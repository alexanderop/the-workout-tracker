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
