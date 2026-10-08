import { z } from "zod";
import {
  actualReps,
  identifier,
  name,
  reps,
  routineSchema,
  exerciseSchema,
  settingsSchema,
  weight,
  type Snapshot,
  type WorkoutSet,
} from "./schemas";

const sessionId = { sessionId: identifier };
const selectedExerciseIds = z.array(identifier).min(1).max(50).refine((ids) => new Set(ids).size === ids.length);
const values = { weightKg: weight, reps: actualReps };
const plannedValues = { weightKg: weight, reps };
export function setTargetReps(set: WorkoutSet): number {
  return set.targetReps ?? Math.max(1, set.reps);
}
export const commandSchema = z
  .discriminatedUnion("type", [
    z.object({ type: z.literal("repeat"), completedId: identifier }).strict(),
    z.object({ type: z.literal("rename"), ...sessionId, name }).strict(),
    z.object({ type: z.literal("rename-completed"), ...sessionId, name }).strict(),
    z
      .object({
        type: z.literal("add-exercises"),
        ...sessionId,
        exerciseIds: selectedExerciseIds,
      })
      .strict(),
    z.object({ type: z.literal("start-selected"), exerciseIds: selectedExerciseIds }).strict(),
    z
      .object({ type: z.literal("start"), routineId: identifier })
      .strict(),
    z
      .object({
        type: z.literal("set-entry"),
        ...sessionId,
        exerciseId: identifier,
        setId: identifier,
        ...values,
        completed: z.boolean(),
      })
      .strict(),
    z
      .object({
        type: z.literal("set-values"),
        ...sessionId,
        exerciseId: identifier,
        setId: identifier,
        ...values,
      })
      .strict(),
    z
      .object({
        type: z.literal("set-completed"),
        ...sessionId,
        setId: identifier,
        completed: z.boolean(),
      })
      .strict(),
    z
      .object({
        type: z.literal("add-set"),
        ...sessionId,
        exerciseId: identifier,
        values: z.object(plannedValues).strict().optional(),
      })
      .strict(),
    z
      .object({
        type: z.literal("configure-exercise"),
        ...sessionId,
        exerciseId: identifier,
        setCount: z.number().int().min(1).max(30),
        values: z.object(plannedValues).strict().optional(),
      })
      .strict(),
    z
      .object({
        type: z.literal("remove-set"),
        ...sessionId,
        exerciseId: identifier,
        setId: identifier,
      })
      .strict(),
    z
      .object({
        type: z.literal("add-exercise"),
        ...sessionId,
        exerciseId: identifier,
      })
      .strict(),
    z
      .object({
        type: z.literal("remove-exercise"),
        ...sessionId,
        exerciseId: identifier,
      })
      .strict(),
    z
      .object({
        type: z.literal("set-exercise-note"),
        ...sessionId,
        exerciseId: identifier,
        note: z.string().max(2000),
      })
      .strict(),
    z
      .object({
        type: z.literal("replace-exercise"),
        ...sessionId,
        exerciseId: identifier,
        replacementExerciseId: identifier,
      })
      .strict(),
    z.object({
      type: z.literal("correct-completed"),
      ...sessionId,
      name: name.optional(),
      sets: z.array(z.object({
        exerciseId: identifier,
        setId: identifier,
        weightKg: weight,
        reps: actualReps,
      }).strict().readonly()).max(1500).readonly(),
    }).strict(),
    z.object({ type: z.literal("finish"), ...sessionId }).strict(),
    z.object({ type: z.literal("discard"), ...sessionId }).strict(),
    z.object({ type: z.literal("stop-rest"), ...sessionId }).strict(),
    z
      .object({ type: z.literal("save-routine"), routine: routineSchema })
      .strict(),
    z
      .object({ type: z.literal("save-exercise"), exercise: exerciseSchema })
      .strict(),
    z
      .object({ type: z.literal("settings"), settings: settingsSchema })
      .strict(),
  ])
  .readonly();
export type Command = z.infer<typeof commandSchema>;
export type Transition =
  | { readonly kind: "changed" | "unchanged"; readonly snapshot: Snapshot }
  | { readonly kind: "rejected"; readonly message: string };
export type Inputs = { readonly at: number; readonly id: () => string };
