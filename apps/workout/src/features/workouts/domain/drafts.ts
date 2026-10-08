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
const WEIGHT_PATTERN = /^\d+([.,]\d+)?$/;
const REPS_PATTERN = /^\d+$/;
/**
 * Parses typed input as plain decimal digits only, so notations such as
 * `0x10` or `1e1` that `Number()` would accept are rejected.
 */
export function parseSetValues(
  raw: RawValues,
): { weightKg: number; reps: number } | null {
  const weight = raw.weight.trim();
  const repsText = raw.reps.trim();
  if (!WEIGHT_PATTERN.test(weight) || !REPS_PATTERN.test(repsText)) return null;
  const weightKg = Number(weight.replace(",", "."));
  const reps = Number(repsText);
  return weightKg <= 1000 && reps <= 1000 ? { weightKg, reps } : null;
}
