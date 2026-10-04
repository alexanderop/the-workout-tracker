import { z } from "zod";
import {
  commandSchema,
  initialSnapshot,
  reduceWorkout,
  snapshotSchema,
  type Command,
  type Snapshot,
} from "./domain";
import type { WorkoutStorage, Result } from "./ports";
export type { LoadState, Result } from "./ports";

export type WorkoutDependencies = {
  readonly storage: WorkoutStorage;
  readonly now: () => number;
  readonly id: () => string;
};
const backupSchema = z
  .object({
    format: z.literal("form-workout"),
    version: z.literal(1),
    snapshot: snapshotSchema,
  })
  .strict();
const expectedSchema = z
  .number()
  .int()
  .nonnegative()
  .max(Number.MAX_SAFE_INTEGER);
const unavailable: Result = {
  kind: "unavailable",
  message:
    "Your browser could not access workout storage. Try reopening this app.",
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
  if (
    local.revision === 0 &&
    canonical(local) === canonical(initialSnapshot())
  ) {
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
  if (
    local.active &&
    incoming.active &&
    canonical(local.active) !== canonical(incoming.active)
  )
    return "Finish your current workout before importing another active workout.";
  const active = local.active ?? incoming.active;
  if (active && completed[active.id])
    return "Backup conflicts with an active workout. No data was imported.";
  const next = { ...local, exercises, routines, completed, active };
  return canonical(next) === canonical(local)
    ? local
    : { ...next, revision: local.revision + 1 };
}

export function createWorkouts({ storage, now, id }: WorkoutDependencies) {
  let closed = false;
  const write = async (
    expectedRevision: number,
    transform: (snapshot: Snapshot) => Snapshot | string,
  ): Promise<Result> => {
    if (closed)
      return { kind: "unavailable", message: "Workout storage is closed." };
    if (!expectedSchema.safeParse(expectedRevision).success)
      return { kind: "invalid", message: "Invalid workout revision." };
    try {
      const current = await storage.read();
      if (current.kind === "unavailable") return current;
      if (current.kind === "recovery")
        return {
          kind: "invalid",
          message:
            "Stored data needs recovery. Export it before making changes.",
        };
      if (current.snapshot.revision !== expectedRevision)
        return { kind: "conflict", snapshot: current.snapshot };
      const next = transform(current.snapshot);
      if (typeof next === "string") return { kind: "invalid", message: next };
      const validated = snapshotSchema.safeParse(next);
      if (!validated.success)
        return {
          kind: "invalid",
          message:
            validated.error.issues[0]?.message ?? "Invalid workout data.",
        };
      if (closed)
        return { kind: "unavailable", message: "Workout storage is closed." };
      return await storage.compareAndSave(expectedRevision, validated.data);
    } catch {
      return unavailable;
    }
  };
  return {
    async execute(command: Command, expectedRevision: number): Promise<Result> {
      const parsed = commandSchema.safeParse(command);
      if (!parsed.success)
        return {
          kind: "invalid",
          message:
            parsed.error.issues[0]?.message ?? "Invalid workout command.",
        };
      return write(expectedRevision, (snapshot) => {
        const result = reduceWorkout(snapshot, parsed.data, { at: now(), id });
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
        { format: "form-workout", version: 1, snapshot: current.snapshot },
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
