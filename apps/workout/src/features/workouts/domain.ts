import { z } from "zod";
import { defaultExercises } from "./domain/catalog";

const identifier = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/)
  .refine(
    (value) => !["__proto__", "prototype", "constructor"].includes(value),
  );
const name = z.string().trim().min(1).max(80);
const weight = z.number().finite().min(0).max(1000);
const reps = z.number().int().min(1).max(1000);
const timestamp = z.number().int().min(0).max(8640000000000000);
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
  .object({ id: identifier, weightKg: weight, reps, completed: z.boolean() })
  .strict()
  .readonly();
const sessionExerciseSchema = z
  .object({
    id: identifier,
    exerciseId: identifier,
    name,
    category: name,
    sets: z.array(setSchema).min(1).max(30).readonly(),
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
export type Settings = z.infer<typeof settingsSchema>;

export const snapshotSchema = z
  .object({
    revision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    exercises: z.record(identifier, exerciseSchema).readonly(),
    routines: z.record(identifier, routineSchema).readonly(),
    active: activeSchema.nullable(),
    completed: z.record(identifier, completedSchema).readonly(),
    settings: settingsSchema,
  })
  .strict()
  .superRefine((snapshot, context) => {
    const issue = (message: string) =>
      context.addIssue({ code: "custom", message });
    for (const records of [
      snapshot.exercises,
      snapshot.routines,
      snapshot.completed,
    ]) {
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
          (exercise) => !snapshot.exercises[exercise.exerciseId],
        )
      )
        issue("Routine references an unknown exercise.");
    }
    if (snapshot.active && snapshot.completed[snapshot.active.id])
      issue("A workout cannot be both active and completed.");
    for (const session of [
      ...Object.values(snapshot.completed),
      ...(snapshot.active ? [snapshot.active] : []),
    ]) {
      const ids = session.exercises.flatMap((exercise) => [
        exercise.id,
        ...exercise.sets.map((set) => set.id),
      ]);
      if (new Set(ids).size !== ids.length || ids.includes(session.id))
        issue("Workout row IDs must be unique.");
      if (
        session.exercises.some(
          (exercise) => !snapshot.exercises[exercise.exerciseId],
        )
      )
        issue("Workout references an unknown exercise.");
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
  })
  .readonly();
export type Snapshot = z.infer<typeof snapshotSchema>;

const sessionId = { sessionId: identifier };
const values = { weightKg: weight, reps };
export const commandSchema = z
  .discriminatedUnion("type", [
    z.object({ type: z.literal("repeat"), completedId: identifier }).strict(),
    z.object({ type: z.literal("rename"), ...sessionId, name }).strict(),
    z
      .object({
        type: z.literal("add-exercises"),
        ...sessionId,
        exerciseIds: z
          .array(identifier)
          .min(1)
          .max(50)
          .refine((ids) => new Set(ids).size === ids.length),
      })
      .strict(),
    z
      .object({ type: z.literal("start"), routineId: identifier.nullable() })
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
        values: z.object(values).strict().optional(),
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

export function initialSnapshot(): Snapshot {
  return {
    revision: 0,
    exercises: Object.fromEntries(
      defaultExercises.map((exercise) => [exercise.id, exercise]),
    ),
    routines: {},
    active: null,
    completed: {},
    settings: { restSeconds: 90, autoRest: true },
  };
}

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

export function remainingRestSeconds(
  active: ActiveSession | null,
  at: number,
): number {
  return active?.rest
    ? Math.max(0, Math.ceil((active.rest.endsAt - at) / 1000))
    : 0;
}

export function reduceWorkout(
  snapshot: Snapshot,
  command: Command,
  inputs: Inputs,
): Transition {
  const parsed = commandSchema.safeParse(command);
  if (!parsed.success || !timestamp.safeParse(inputs.at).success)
    return { kind: "rejected", message: "Please check the entered values." };
  const reject = (message: string): Transition => ({
    kind: "rejected",
    message,
  });
  const unchanged = (): Transition => ({ kind: "unchanged", snapshot });
  const changed = (next: Snapshot): Transition => {
    if (JSON.stringify(next) === JSON.stringify(snapshot)) return unchanged();
    const validated = snapshotSchema.safeParse({
      ...next,
      revision: snapshot.revision + 1,
    });
    return validated.success
      ? { kind: "changed", snapshot: validated.data }
      : reject(validated.error.issues[0]?.message ?? "Invalid workout change.");
  };
  if (command.type === "settings")
    return changed({ ...snapshot, settings: command.settings });
  if (command.type === "save-routine")
    return changed({
      ...snapshot,
      routines: { ...snapshot.routines, [command.routine.id]: command.routine },
    });
  if (command.type === "save-exercise")
    return changed({
      ...snapshot,
      exercises: {
        ...snapshot.exercises,
        [command.exercise.id]: command.exercise,
      },
    });
  if (command.type === "repeat") {
    if (snapshot.active) return reject("Finish your current workout first.");
    const source = snapshot.completed[command.completedId];
    if (!source) return reject("Workout was not found.");
    const id = inputs.id();
    if (snapshot.completed[id]) return reject("Workout ID already exists.");
    return changed({
      ...snapshot,
      active: {
        id,
        status: "active",
        name: source.name,
        startedAt: inputs.at,
        rest: null,
        exercises: source.exercises.map((exercise) => ({
          ...exercise,
          id: inputs.id(),
          sets: exercise.sets.map((set) => ({
            ...set,
            id: inputs.id(),
            completed: false,
          })),
        })),
      },
    });
  }
  if (command.type === "start") {
    if (snapshot.active) return reject("Finish your current workout first.");
    const routine = command.routineId
      ? snapshot.routines[command.routineId]
      : null;
    if (command.routineId && !routine) return reject("Routine was not found.");
    const sessionExercises: SessionExercise[] = [];
    for (const row of routine?.exercises ?? []) {
      const exercise = snapshot.exercises[row.exerciseId];
      if (!exercise) return reject("Exercise was not found.");
      sessionExercises.push({
        id: inputs.id(),
        exerciseId: exercise.id,
        name: exercise.name,
        category: exercise.category,
        sets: row.sets.map((set) => ({
          id: inputs.id(),
          weightKg: set.weightKg,
          reps: set.reps,
          completed: false,
        })),
      });
    }
    const id = inputs.id();
    if (snapshot.completed[id]) return reject("Workout ID already exists.");
    return changed({
      ...snapshot,
      active: {
        id,
        status: "active",
        name: routine?.name ?? "New workout",
        startedAt: inputs.at,
        exercises: sessionExercises,
        rest: null,
      },
    });
  }
  if (command.type === "finish" && snapshot.completed[command.sessionId])
    return unchanged();
  const active = snapshot.active;
  if (!active || active.id !== command.sessionId)
    return reject("This workout is no longer active.");
  const saveActive = (next: ActiveSession): Transition =>
    changed({ ...snapshot, active: next });
  if (command.type === "rename")
    return saveActive({ ...active, name: command.name.trim() });
  if (command.type === "discard") return changed({ ...snapshot, active: null });
  if (command.type === "finish") {
    if (!sessionTotals(active).completedSets)
      return reject("Complete at least one set before finishing.");
    const completed: CompletedSession = {
      id: active.id,
      status: "completed",
      name: active.name,
      startedAt: active.startedAt,
      finishedAt: Math.max(active.startedAt, inputs.at),
      exercises: active.exercises,
    };
    return changed({
      ...snapshot,
      active: null,
      completed: { ...snapshot.completed, [completed.id]: completed },
    });
  }
  if (command.type === "stop-rest")
    return saveActive({ ...active, rest: null });
  if (command.type === "add-exercise" || command.type === "add-exercises") {
    const ids =
      command.type === "add-exercise"
        ? [command.exerciseId]
        : command.exerciseIds;
    if (active.exercises.length + ids.length > 50)
      return reject("A workout can contain up to 50 exercises.");
    const additions: SessionExercise[] = [];
    for (const exerciseId of ids) {
      const exercise = snapshot.exercises[exerciseId];
      if (!exercise) return reject("Exercise was not found.");
      additions.push({
        id: inputs.id(),
        exerciseId: exercise.id,
        name: exercise.name,
        category: exercise.category,
        sets: [{ id: inputs.id(), weightKg: 0, reps: 8, completed: false }],
      });
    }
    return saveActive({
      ...active,
      exercises: [...active.exercises, ...additions],
    });
  }
  const exercise =
    command.type === "set-completed"
      ? active.exercises.find((row) =>
          row.sets.some((set) => set.id === command.setId),
        )
      : active.exercises.find((row) => row.id === command.exerciseId);
  if (!exercise) return reject("Workout exercise was not found.");
  if (command.type === "remove-exercise")
    return saveActive({
      ...active,
      exercises: active.exercises.filter((row) => row.id !== exercise.id),
      rest: exercise.sets.some((set) => set.id === active.rest?.setId)
        ? null
        : active.rest,
    });
  const saveExercise = (
    next: SessionExercise,
    rest = active.rest,
  ): Transition =>
    saveActive({
      ...active,
      rest,
      exercises: active.exercises.map((row) =>
        row.id === next.id ? next : row,
      ),
    });
  if (command.type === "add-set") {
    const previous = exercise.sets.at(-1);
    return saveExercise({
      ...exercise,
      sets: [
        ...exercise.sets,
        {
          id: inputs.id(),
          weightKg: command.values?.weightKg ?? previous?.weightKg ?? 0,
          reps: command.values?.reps ?? previous?.reps ?? 8,
          completed: false,
        },
      ],
    });
  }
  const set = exercise.sets.find((row) => row.id === command.setId);
  if (!set) return reject("Set was not found.");
  if (command.type === "remove-set") {
    if (exercise.sets.length === 1)
      return reject("Keep at least one set per exercise.");
    return saveExercise(
      { ...exercise, sets: exercise.sets.filter((row) => row.id !== set.id) },
      active.rest?.setId === set.id ? null : active.rest,
    );
  }
  const nextSet =
    command.type === "set-completed"
      ? { ...set, completed: command.completed }
      : {
          ...set,
          weightKg: command.weightKg,
          reps: command.reps,
          ...(command.type === "set-entry"
            ? { completed: command.completed }
            : {}),
        };
  let rest = active.rest;
  if (
    !set.completed &&
    nextSet.completed &&
    snapshot.settings.autoRest &&
    snapshot.settings.restSeconds > 0
  )
    rest = {
      setId: set.id,
      endsAt: inputs.at + snapshot.settings.restSeconds * 1000,
    };
  if (!nextSet.completed && rest?.setId === set.id) rest = null;
  return saveExercise(
    {
      ...exercise,
      sets: exercise.sets.map((row) => (row.id === set.id ? nextSet : row)),
    },
    rest,
  );
}

export function routineFromSession(
  session: CompletedSession,
  id: string,
): Routine {
  return {
    id,
    name: session.name,
    description: "",
    exercises: session.exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      sets: exercise.sets.map((set) => ({
        weightKg: set.weightKg,
        reps: set.reps,
      })),
    })),
  };
}
