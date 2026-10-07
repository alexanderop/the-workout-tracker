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
const actualReps = z.number().int().min(0).max(1000);
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
export type Settings = z.infer<typeof settingsSchema>;

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
      (exercise) => !snapshot.exercises[exercise.exerciseId],
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
  switch (command.type) {
    case "correct-completed":
      return correctCompleted(command);
    case "rename-completed": {
      const completed = snapshot.completed[command.sessionId];
      if (!completed) return reject("This completed workout was not found.");
      return changed({
        ...snapshot,
        completed: {
          ...snapshot.completed,
          [completed.id]: { ...completed, name: command.name.trim() },
        },
      });
    }
    case "settings":
      return changed({ ...snapshot, settings: command.settings });
    case "save-routine":
      return changed({
        ...snapshot,
        routines: {
          ...snapshot.routines,
          [command.routine.id]: command.routine,
        },
      });
    case "save-exercise":
      return changed({
        ...snapshot,
        exercises: {
          ...snapshot.exercises,
          [command.exercise.id]: command.exercise,
        },
      });
    case "repeat":
      return repeatWorkout(command);
    case "start":
    case "start-selected":
      return startWorkout(command);
    case "rename":
    case "discard":
    case "finish":
    case "stop-rest":
    case "add-exercise":
    case "add-exercises":
    case "remove-exercise":
    case "set-exercise-note":
    case "replace-exercise":
    case "configure-exercise":
    case "add-set":
    case "remove-set":
    case "set-entry":
    case "set-values":
    case "set-completed":
      return reduceActive(command);
  }
  function correctCompleted(command: Extract<Command, { type: "correct-completed" }>): Transition {
      const completed = snapshot.completed[command.sessionId];
      if (!completed) return reject("This completed workout was not found.");
      const patches = new Map<string, (typeof command.sets)[number]>();
      for (const patch of command.sets) {
        const exercise = completed.exercises.find((row) => row.id === patch.exerciseId);
        const set = exercise?.sets.find((row) => row.id === patch.setId);
        if (!set) return reject("This set was not found in the completed workout.");
        if (!set.completed) return reject("Only logged sets can be corrected.");
        if (patches.has(patch.setId)) return reject("A set can only be corrected once.");
        patches.set(patch.setId, patch);
      }
      return changed({
        ...snapshot,
        completed: {
          ...snapshot.completed,
          [completed.id]: {
            ...completed,
            name: command.name?.trim() ?? completed.name,
            exercises: completed.exercises.map((exercise) => ({
              ...exercise,
              sets: exercise.sets.map((set) => {
                const patch = patches.get(set.id);
                return patch ? { ...set, weightKg: patch.weightKg, reps: patch.reps } : set;
              }),
            })),
          },
        },
      });
    }
  function repeatWorkout(
    command: Extract<Command, { type: "repeat" }>,
  ): Transition {
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
          exerciseId: exercise.exerciseId,
          name: exercise.name,
          category: exercise.category,
          id: inputs.id(),
          sets: exercise.sets.map((set) => ({
            ...set,
            id: inputs.id(),
            completed: false,
            reps: setTargetReps(set),
            targetReps: setTargetReps(set),
          })),
        })),
      },
    });
  }
  function startWorkout(
    command: Extract<Command, { type: "start" | "start-selected" }>,
  ): Transition {
    if (snapshot.active) return reject("Finish your current workout first.");
    const routine = command.type === "start" ? snapshot.routines[command.routineId] : null;
    if (command.type === "start" && !routine) return reject("Routine was not found.");
    const sessionExercises = command.type === "start-selected"
      ? selectedExercises(command.exerciseIds)
      : routineExercises(routine);
    if (typeof sessionExercises === "string") return reject(sessionExercises);
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
  function routineExercises(
    routine: Routine | null | undefined,
  ): SessionExercise[] | string {
    const sessionExercises: SessionExercise[] = [];
    for (const row of routine?.exercises ?? []) {
      const exercise = snapshot.exercises[row.exerciseId];
      if (!exercise) return "Exercise was not found.";
      sessionExercises.push({
        id: inputs.id(),
        exerciseId: exercise.id,
        name: exercise.name,
        category: exercise.category,
        sets: row.sets.map((set) => ({
          id: inputs.id(),
          weightKg: set.weightKg,
          reps: set.reps,
          targetReps: set.reps,
          completed: false,
        })),
      });
    }
    return sessionExercises;
  }
  function selectedExercises(ids: readonly string[]): SessionExercise[] | string {
    const additions: SessionExercise[] = [];
    for (const exerciseId of ids) {
      const exercise = snapshot.exercises[exerciseId];
      if (!exercise) return "Exercise was not found.";
      additions.push({
        id: inputs.id(),
        exerciseId: exercise.id,
        name: exercise.name,
        category: exercise.category,
        sets: [
          {
            id: inputs.id(),
            weightKg: 0,
            reps: 8,
            targetReps: 8,
            completed: false,
          },
        ],
      });
    }
    return additions;
  }
  function reduceActive(
    command: Exclude<
      Extract<Command, { sessionId: string }>,
      { type: "rename-completed" | "correct-completed" }
    >,
  ): Transition {
    if (command.type === "finish" && snapshot.completed[command.sessionId])
      return unchanged();
    const candidate = snapshot.active;
    if (!candidate || candidate.id !== command.sessionId)
      return reject("This workout is no longer active.");
    const active = candidate;
    const saveActive = (next: ActiveSession): Transition =>
      changed({ ...snapshot, active: next });
    switch (command.type) {
      case "rename":
        return saveActive({ ...active, name: command.name.trim() });
      case "discard":
        return changed({ ...snapshot, active: null });
      case "finish":
        return finishWorkout();
      case "stop-rest":
        return saveActive({ ...active, rest: null });
      case "add-exercise":
      case "add-exercises":
        return addExercises(command);
      case "remove-exercise":
      case "set-exercise-note":
      case "replace-exercise":
      case "configure-exercise":
      case "add-set":
      case "remove-set":
      case "set-entry":
      case "set-values":
      case "set-completed":
        return reduceExercise(command);
    }
    function finishWorkout(): Transition {
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
    function addExercises(
      command: Extract<Command, { type: "add-exercise" | "add-exercises" }>,
    ): Transition {
      const ids =
        command.type === "add-exercise"
          ? [command.exerciseId]
          : command.exerciseIds;
      if (active.exercises.length + ids.length > 50)
        return reject("A workout can contain up to 50 exercises.");
      const additions = selectedExercises(ids);
      if (typeof additions === "string") return reject(additions);
      return saveActive({
        ...active,
        exercises: [...active.exercises, ...additions],
      });
    }
    function reduceExercise(
      command: Extract<
        Command,
        {
          type:
            | "remove-exercise"
            | "configure-exercise"
            | "set-exercise-note"
            | "replace-exercise"
            | "add-set"
            | "remove-set"
            | "set-entry"
            | "set-values"
            | "set-completed";
        }
      >,
    ): Transition {
      const candidateExercise =
        command.type === "set-completed"
          ? active.exercises.find((row) =>
              row.sets.some((set) => set.id === command.setId),
            )
          : active.exercises.find((row) => row.id === command.exerciseId);
      if (!candidateExercise) return reject("Workout exercise was not found.");
      const exercise = candidateExercise;
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
      if (command.type === "set-exercise-note")
        return setExerciseNote(command.note);
      if (command.type === "replace-exercise")
        return replaceExercise(command.replacementExerciseId);
      if (command.type === "configure-exercise")
        return configureExercise(command);
      if (command.type === "add-set") return addSet(command);
      return updateSet(command);
      function setExerciseNote(noteInput: string): Transition {
        const { note: previousNote, ...withoutNote } = exercise;
        const note = noteInput.trim();
        if (note === (previousNote ?? "")) return unchanged();
        return saveExercise({ ...withoutNote, ...(note ? { note } : {}) });
      }
      function replaceExercise(replacementId: string): Transition {
        const replacement = snapshot.exercises[replacementId];
        if (!replacement) return reject("Exercise was not found.");
        if (replacement.id === exercise.exerciseId)
          return reject("Choose a different exercise.");
        const remaining = exercise.sets.filter((set) => !set.completed);
        const logged = exercise.sets.filter((set) => set.completed);
        if (!remaining.length)
          return reject("All sets are logged. Add another exercise instead.");
        if (logged.length && active.exercises.length >= 50)
          return reject("A workout can contain up to 50 exercises.");
        const next: SessionExercise = {
          id: inputs.id(),
          exerciseId: replacement.id,
          name: replacement.name,
          category: replacement.category,
          sets: remaining.map((set) => ({
            id: inputs.id(),
            weightKg: 0,
            reps: setTargetReps(set),
            targetReps: setTargetReps(set),
            completed: false,
          })),
        };
        return saveActive({
          ...active,
          exercises: active.exercises.flatMap((row) => {
            if (row.id !== exercise.id) return [row];
            return logged.length
              ? [{ ...exercise, sets: logged }, next]
              : [next];
          }),
          rest: remaining.some((set) => set.id === active.rest?.setId)
            ? null
            : active.rest,
        });
      }
      function configureExercise(
        command: Extract<Command, { type: "configure-exercise" }>,
      ): Transition {
        const logged = exercise.sets.filter((set) => set.completed).length;
        if (command.setCount < logged)
          return reject(
            "The set count cannot remove logged work. Clear a set explicitly first.",
          );
        let remaining = command.setCount - logged;
        const retained = exercise.sets
          .filter((set) => {
            if (set.completed) return true;
            return remaining-- > 0;
          })
          .map((set) => {
            if (set.completed || !command.values) return set;
            return {
              ...set,
              ...command.values,
              targetReps: command.values.reps,
            };
          });
        const previous = exercise.sets.at(-1)!;
        const values = command.values ?? {
          weightKg: previous.weightKg,
          reps: setTargetReps(previous),
        };
        while (retained.length < command.setCount)
          retained.push({
            id: inputs.id(),
            ...values,
            targetReps: values.reps,
            completed: false,
          });
        return saveExercise({ ...exercise, sets: retained });
      }
      function addSet(
        command: Extract<Command, { type: "add-set" }>,
      ): Transition {
        const previous = exercise.sets.at(-1)!;
        const reps = command.values?.reps ?? setTargetReps(previous);
        return saveExercise({
          ...exercise,
          sets: [
            ...exercise.sets,
            {
              id: inputs.id(),
              weightKg: command.values?.weightKg ?? previous?.weightKg ?? 0,
              reps: reps,
              targetReps: reps,
              completed: false,
            },
          ],
        });
      }
      function updateSet(
        command: Extract<
          Command,
          { type: "remove-set" | "set-entry" | "set-values" | "set-completed" }
        >,
      ): Transition {
        const set = exercise.sets.find((row) => row.id === command.setId);
        if (!set) return reject("Set was not found.");
        if (command.type === "remove-set") {
          if (exercise.sets.length === 1)
            return reject("Keep at least one set per exercise.");
          return saveExercise(
            {
              ...exercise,
              sets: exercise.sets.filter((row) => row.id !== set.id),
            },
            active.rest?.setId === set.id ? null : active.rest,
          );
        }
        const nextSet = changedSet(set, command);
        if (!nextSet.completed && nextSet.reps === 0)
          return reject("Planned sets need at least one target repetition.");
        const rest = nextRest(set, nextSet);
        return saveExercise(
          {
            ...exercise,
            sets: exercise.sets.map((row) =>
              row.id === set.id ? nextSet : row,
            ),
          },
          rest,
        );
      }
      function nextRest(
        set: WorkoutSet,
        nextSet: WorkoutSet,
      ): ActiveSession["rest"] {
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
        return rest;
      }
    }
  }
}

function changedSet(
  set: WorkoutSet,
  command: Extract<
    Command,
    { type: "set-entry" | "set-values" | "set-completed" }
  >,
): WorkoutSet {
  const target = setTargetReps(set);
  if (command.type === "set-completed")
    return {
      ...set,
      completed: command.completed,
      reps: command.completed ? set.reps : target,
    };
  if (command.type === "set-entry")
    return {
      ...set,
      weightKg: command.weightKg,
      reps: command.completed ? command.reps : target,
      targetReps: target,
      completed: command.completed,
    };
  return {
    ...set,
    weightKg: command.weightKg,
    reps: command.reps,
    targetReps: set.completed ? target : Math.max(1, command.reps),
  };
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
        reps: setTargetReps(set),
      })),
    })),
  };
}
