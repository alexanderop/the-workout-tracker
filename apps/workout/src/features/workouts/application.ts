import { z } from "zod";
import {
  commandSchema,
  exerciseSchema,
  type Exercise,
  initialSnapshot,
  reduceWorkout,
  snapshotSchema,
  type Command,
  type Snapshot,
} from "./domain";
import type {
  DraftJournal,
  Result,
  StorageState,
  WorkoutStorage,
} from "./ports";
import { routineValuesSchema, type RoutineValues } from "./domain/routineDrafts";
export type { LoadState, Result, WorkoutStorage } from "./ports";

export type ApplicationCommand =
  | Command
  | { type: "create-routine"; routine: RoutineValues }
  | { type: "create-exercise"; exercise: Omit<Exercise, "id" | "custom"> };
const createRoutineSchema = z.object({
  type: z.literal("create-routine"),
  routine: routineValuesSchema,
}).strict();
const createExerciseSchema = z.object({
  type: z.literal("create-exercise"),
  exercise: exerciseSchema.unwrap().omit({ id: true, custom: true }),
}).strict();
const applicationCommandSchema = z.union([
  commandSchema,
  createRoutineSchema,
  createExerciseSchema,
]);

function resolveCommand(request: ApplicationCommand, id: () => string): Command {
  if (request.type === "create-routine")
    return { type: "save-routine", routine: { ...request.routine, id: id() } };
  if (request.type === "create-exercise")
    return {
      type: "save-exercise",
      exercise: { ...request.exercise, id: id(), custom: true },
    };
  return request;
}

export type WorkoutDependencies = {
  readonly storage: WorkoutStorage;
  readonly journal: DraftJournal;
  readonly now: () => number;
  readonly id: () => string;
};
const backupSchema = z
  .object({
    format: z.literal("form-workout"),
    version: z.literal(2),
    snapshot: snapshotSchema,
  })
  .strict();
const expectedSchema = z
  .number()
  .int()
  .nonnegative()
  .max(Number.MAX_SAFE_INTEGER);
const unavailable = {
  kind: "unavailable",
  message:
    "Your browser could not access workout storage. Try reopening this app.",
} as const;
const unconfirmed: Result = {
  kind: "unavailable",
  message:
    "Your browser could not confirm whether this change was saved. Reload before trying again.",
};

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonical(entry)}`)
      .join(",")}}`;
  return JSON.stringify(value) ?? "null";
}

function mergeSnapshots(
  local: Snapshot,
  incoming: Snapshot,
): Snapshot | string {
  if (canonical({ ...local, revision: 0 }) === canonical(initialSnapshot())) {
    const restored = {
      ...incoming,
      revision: local.revision,
      settings: local.settings,
    };
    return canonical(restored) === canonical(local)
      ? local
      : { ...restored, revision: local.revision + 1 };
  }
  const merge = <T>(
    existing: Readonly<Record<string, T>>,
    imported: Readonly<Record<string, T>>,
  ): Record<string, T> | string => {
    const records = { ...existing };
    for (const [id, record] of Object.entries(imported)) {
      if (
        Object.hasOwn(existing, id) &&
        canonical(existing[id]) !== canonical(record)
      )
        return `Backup contains a conflicting record (${id}). No data was imported.`;
      records[id] = record;
    }
    return records;
  };
  const exercises = merge(local.exercises, incoming.exercises);
  if (typeof exercises === "string") return exercises;
  const routines = merge(local.routines, incoming.routines);
  if (typeof routines === "string") return routines;
  const completed = merge(local.completed, incoming.completed);
  if (typeof completed === "string") return completed;
  const active = mergeActive(local, incoming, completed);
  if (typeof active === "string") return active;
  const next = { ...local, exercises, routines, completed, active };
  return canonical(next) === canonical(local)
    ? local
    : { ...next, revision: local.revision + 1 };
}

function mergeActive(
  local: Snapshot,
  incoming: Snapshot,
  completed: Snapshot["completed"],
): Snapshot["active"] | string {
  if (
    local.active &&
    incoming.active &&
    canonical(local.active) !== canonical(incoming.active)
  )
    return "Finish your current workout before importing another active workout.";
  const active = local.active ?? incoming.active;
  if (active && completed[active.id])
    return "Backup conflicts with an active workout. No data was imported.";
  return active;
}

function validateWrite(
  next: Snapshot,
): { kind: "valid"; data: Snapshot } | Extract<Result, { kind: "invalid" }> {
  const validated = snapshotSchema.safeParse(next);
  if (!validated.success)
    return {
      kind: "invalid",
      message: validated.error.issues[0]?.message ?? "Invalid workout data.",
    };
  return { kind: "valid", data: validated.data };
}

export function createWorkouts({
  storage,
  journal,
  now,
  id,
}: WorkoutDependencies) {
  let closed = false;
  const closedResult: Result = {
    kind: "unavailable",
    message: "Workout storage is closed.",
  };
  const readCurrent = async (): Promise<StorageState> => {
    try {
      return await storage.read();
    } catch (error) {
      console.error("Workout storage read failed.", error);
      return unavailable;
    }
  };
  const applyTransform = (
    snapshot: Snapshot,
    transform: (snapshot: Snapshot) => Snapshot | string,
  ): Snapshot | string => {
    try {
      return transform(snapshot);
    } catch (error) {
      console.error("Workout change failed unexpectedly.", error);
      return "This change failed unexpectedly. Nothing was saved.";
    }
  };
  // A throwing save may still have committed, so re-read before reporting.
  const confirmSave = async (
    expectedRevision: number,
    next: Snapshot,
  ): Promise<Result> => {
    const after = await readCurrent();
    if (after.kind !== "ready") return unconfirmed;
    if (after.snapshot.revision === expectedRevision) return unavailable;
    if (canonical(after.snapshot) === canonical(next))
      return { kind: "saved", snapshot: after.snapshot };
    return { kind: "conflict", snapshot: after.snapshot };
  };
  const save = async (
    expectedRevision: number,
    next: Snapshot,
  ): Promise<Result> => {
    try {
      return await storage.compareAndSave(expectedRevision, next);
    } catch (error) {
      console.error("Workout storage write failed.", error);
      return confirmSave(expectedRevision, next);
    }
  };
  const write = async (
    expectedRevision: number,
    transform: (snapshot: Snapshot) => Snapshot | string,
  ): Promise<Result> => {
    if (closed) return closedResult;
    if (!expectedSchema.safeParse(expectedRevision).success)
      return { kind: "invalid", message: "Invalid workout revision." };
    const current = await readCurrent();
    if (current.kind === "unavailable") return current;
    if (current.kind === "recovery")
      return {
        kind: "invalid",
        message: "Stored data needs recovery. Export it before making changes.",
      };
    if (current.snapshot.revision !== expectedRevision)
      return { kind: "conflict", snapshot: current.snapshot };
    const next = applyTransform(current.snapshot, transform);
    if (typeof next === "string") return { kind: "invalid", message: next };
    const validated = validateWrite(next);
    if (validated.kind === "invalid") return validated;
    if (closed) return closedResult;
    return save(expectedRevision, validated.data);
  };
  return {
    async deleteAllData(expectedRevision: number): Promise<
      | Result
      | {
          readonly kind: "cleanup-pending";
          readonly snapshot: Snapshot;
          readonly message: string;
        }
    > {
      const result = await write(expectedRevision, (snapshot) => ({
        ...initialSnapshot(),
        revision: snapshot.revision + 1,
      }));
      if (result.kind !== "saved") return result;
      try {
        journal.clearBefore(result.snapshot.revision);
        return result;
      } catch {
        return {
          kind: "cleanup-pending",
          snapshot: result.snapshot,
          message:
            "Your workouts and preferences were deleted, but input drafts could not be cleared. Retry to finish deleting your data.",
        };
      }
    },
    async execute(
      command: ApplicationCommand,
      expectedRevision: number,
    ): Promise<Result> {
      const parsed = applicationCommandSchema.safeParse(command);
      if (!parsed.success)
        return {
          kind: "invalid",
          message:
            parsed.error.issues[0]?.message ?? "Invalid workout command.",
        };
      return write(expectedRevision, (snapshot) => {
        const resolved = resolveCommand(parsed.data, id);
        const validated = commandSchema.safeParse(resolved);
        if (!validated.success)
          return validated.error.issues[0]?.message ?? "Invalid workout command.";
        const result = reduceWorkout(snapshot, validated.data, { at: now(), id });
        return result.kind === "rejected" ? result.message : result.snapshot;
      });
    },
    subscribe: storage.subscribe,
    async exportBackup(): Promise<string> {
      if (closed) throw new Error("Workout storage is closed.");
      const current = await storage.read();
      if (current.kind === "unavailable") throw new Error(current.message);
      if (current.kind === "recovery") return current.rawExport;
      return JSON.stringify(
        { format: "form-workout", version: 2, snapshot: current.snapshot },
        null,
        2,
      );
    },
    async importBackup(
      json: string,
      expectedRevision: number,
    ): Promise<Result> {
      if (json.length > 20_000_000)
        return {
          kind: "invalid",
          message: "Backup is too large. The limit is 20 MB.",
        };
      let raw: unknown;
      try {
        raw = JSON.parse(json);
      } catch {
        return { kind: "invalid", message: "This file is not valid JSON." };
      }
      const parsed = backupSchema.safeParse(raw);
      if (!parsed.success)
        return {
          kind: "invalid",
          message: "This is not a valid workout backup.",
        };
      return write(expectedRevision, (snapshot) =>
        mergeSnapshots(snapshot, parsed.data.snapshot),
      );
    },
    close(): void {
      if (closed) return;
      closed = true;
      storage.close();
    },
  };
}
export type Workouts = ReturnType<typeof createWorkouts>;
export type { DraftJournal } from "./ports";
