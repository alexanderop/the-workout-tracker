import { z } from "zod";
import type { WorkoutSet } from "../domain";

const identity = z.string().min(1).max(200);
export const draftSchema = z
  .object({
    id: identity,
    writer: identity,
    sessionId: identity,
    setId: identity,
    weight: z.string().max(64),
    reps: z.string().max(64),
    revision: z.number().int().nonnegative(),
    base: z
      .object({
        weightKg: z.number().finite(),
        reps: z.number().int(),
        completed: z.boolean(),
        targetReps: z.number().int().min(1).max(1000).optional(),
      })
      .strict(),
  })
  .strict();
export type SetDraft = z.infer<typeof draftSchema>;
export type RawValues = Pick<SetDraft, "weight" | "reps">;
export type DraftInput = Omit<SetDraft, "id" | "writer">;
export function sameSet(base: SetDraft["base"], set: WorkoutSet) {
  return (
    base.weightKg === set.weightKg &&
    base.reps === set.reps &&
    base.completed === set.completed &&
    base.targetReps === set.targetReps
  );
}
export function parseSetValues(
  raw: RawValues,
): { weightKg: number; reps: number } | null {
  const weightKg = Number(raw.weight.replace(",", "."));
  const reps = Number(raw.reps);
  return raw.weight.trim() !== "" &&
    raw.reps.trim() !== "" &&
    Number.isFinite(weightKg) &&
    weightKg >= 0 &&
    weightKg <= 1000 &&
    Number.isInteger(reps) &&
    reps >= 0 &&
    reps <= 1000
    ? { weightKg, reps }
    : null;
}
