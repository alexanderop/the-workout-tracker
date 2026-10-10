import { z } from "zod";

/**
 * Reads a stored record by key. Only own entries count, so identifiers such
 * as `toString` never resolve to inherited object properties.
 */
export function ownRecord<T>(
  records: Readonly<Record<string, T>>,
  key: string,
): T | undefined {
  return Object.hasOwn(records, key) ? records[key] : undefined;
}

export const identifier = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/)
  .refine(
    (value) => !["__proto__", "prototype", "constructor"].includes(value),
  );
export const name = z.string().trim().min(1).max(80);
export const weight = z.number().min(0).max(1000);
export const reps = z.number().int().min(1).max(1000);
export const actualReps = z.number().int().min(0).max(1000);
export const timestamp = z.number().int().min(0).max(8640000000000000);
export const exerciseSchema = z
  .object({
    id: identifier,
    name,
    category: name,
    custom: z.boolean(),
    equipment: name,
  })
  .strict()
  .readonly();
export const routineSchema = z
  .object({
    id: identifier,
    name,
    description: z.string().max(240),
    exercises: z
      .array(
        z
          .object({
            exerciseId: identifier,
            sets: z
              .array(z.object({ reps, weightKg: weight }).strict().readonly())
              .min(1)
              .max(30)
              .readonly(),
          })
          .strict()
          .readonly(),
      )
      .min(1)
      .max(50)
      .readonly(),
  })
  .strict()
  .readonly();
const setSchema = z
  .object({
    id: identifier,
    weightKg: weight,
    reps: actualReps,
    targetReps: reps.optional(),
    completed: z.boolean(),
  })
  .strict()
  .refine(
    (set) => set.completed || set.reps > 0,
    "Unlogged sets need positive repetitions.",
  )
  .readonly();
const sessionExerciseSchema = z
  .object({
    id: identifier,
    exerciseId: identifier,
    name,
    category: name,
    sets: z.array(setSchema).min(1).max(30).readonly(),
    note: z.string().max(2000).optional(),
  })
  .strict()
  .readonly();
const sessionFields = {
  id: identifier,
  name,
  startedAt: timestamp,
  exercises: z.array(sessionExerciseSchema).max(50).readonly(),
};
const activeSchema = z
  .object({
    ...sessionFields,
    status: z.literal("active"),
    rest: z
      .object({ setId: identifier, endsAt: timestamp })
      .strict()
      .readonly()
      .nullable(),
  })
  .strict()
  .readonly();
const completedSchema = z
  .object({
    ...sessionFields,
    status: z.literal("completed"),
    finishedAt: timestamp,
  })
  .strict()
  .readonly();
export const settingsSchema = z
  .object({
    restSeconds: z.number().int().min(0).max(600),
    autoRest: z.boolean(),
  })
  .strict()
  .readonly();
export type Exercise = z.infer<typeof exerciseSchema>;
export type Routine = z.infer<typeof routineSchema>;
export type WorkoutSet = z.infer<typeof setSchema>;
export type SessionExercise = z.infer<typeof sessionExerciseSchema>;
export type ActiveSession = z.infer<typeof activeSchema>;
export type CompletedSession = z.infer<typeof completedSchema>;

const snapshotShape = z
  .object({
    revision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    exercises: z.record(identifier, exerciseSchema).readonly(),
    routines: z.record(identifier, routineSchema).readonly(),
    active: activeSchema.nullable(),
    completed: z.record(identifier, completedSchema).readonly(),
    settings: settingsSchema,
  })
  .strict();
type SnapshotShape = z.infer<typeof snapshotShape>;
type ReportIssue = (message: string) => void;
function validateRecords(snapshot: SnapshotShape, issue: ReportIssue) {
  const keyed: readonly Readonly<Record<string, { readonly id: string }>>[] = [
    snapshot.exercises,
    snapshot.routines,
    snapshot.completed,
  ];
  for (const records of keyed) {
    if (Object.entries(records).some(([key, value]) => key !== value.id))
      issue("Record keys must match their IDs.");
  }
  if (
    Object.keys(snapshot.exercises).length > 1000 ||
    Object.keys(snapshot.routines).length > 500 ||
    Object.keys(snapshot.completed).length > 20000
  )
    issue("Backup exceeds the supported record limit.");
  for (const routine of Object.values(snapshot.routines)) {
    if (
      routine.exercises.some(
        (exercise) => !ownRecord(snapshot.exercises, exercise.exerciseId),
      )
    )
      issue("Routine references an unknown exercise.");
  }
  if (snapshot.active && ownRecord(snapshot.completed, snapshot.active.id))
    issue("A workout cannot be both active and completed.");
}
function validateSession(
  session: ActiveSession | CompletedSession,
  snapshot: SnapshotShape,
  issue: ReportIssue,
) {
  const ids = session.exercises.flatMap((exercise) => [
    exercise.id,
    ...exercise.sets.map((set) => set.id),
  ]);
  if (new Set(ids).size !== ids.length || ids.includes(session.id))
    issue("Workout row IDs must be unique.");
  if (
    session.exercises.some(
      (exercise) => !ownRecord(snapshot.exercises, exercise.exerciseId),
    )
  )
    issue("Workout references an unknown exercise.");
  validateSessionStatus(session, issue);
}
function validateSessionStatus(
  session: ActiveSession | CompletedSession,
  issue: ReportIssue,
) {
  if (
    session.status === "completed" &&
    (session.finishedAt < session.startedAt ||
      sessionTotals(session).completedSets === 0)
  )
    issue("Completed workout is invalid.");
  if (
    session.status === "active" &&
    session.rest &&
    !session.exercises.some((exercise) =>
      exercise.sets.some(
        (set) => set.id === session.rest?.setId && set.completed,
      ),
    )
  )
    issue("Rest must belong to a completed set.");
}
export const snapshotSchema = snapshotShape
  .superRefine((snapshot, context) => {
    const issue: ReportIssue = (message) =>
      context.addIssue({ code: "custom", message });
    validateRecords(snapshot, issue);
    for (const session of [
      ...Object.values(snapshot.completed),
      ...(snapshot.active ? [snapshot.active] : []),
    ]) {
      validateSession(session, snapshot, issue);
    }
  })
  .readonly();
export type Snapshot = z.infer<typeof snapshotSchema>;

export function sessionTotals(session: ActiveSession | CompletedSession): {
  readonly completedSets: number;
  readonly volumeKg: number;
} {
  return session.exercises
    .flatMap((exercise) => exercise.sets)
    .reduce(
      (total, set) =>
        set.completed
          ? {
              completedSets: total.completedSets + 1,
              volumeKg: total.volumeKg + set.weightKg * set.reps,
            }
          : total,
      { completedSets: 0, volumeKg: 0 },
    );
}
