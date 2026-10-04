import Dexie, { liveQuery, type Table } from "dexie";
import { z } from "zod";
import {
  commandSchema,
  initialSnapshot,
  reduceWorkout,
  snapshotSchema,
  type Command,
  type Snapshot,
} from "./domain";

export type LoadState =
  | { readonly kind: "loading" }
  | { readonly kind: "ready"; readonly snapshot: Snapshot }
  | {
      readonly kind: "recovery";
      readonly message: string;
      readonly rawExport: string;
    }
  | { readonly kind: "unavailable"; readonly message: string };
export type Result =
  | { readonly kind: "saved"; readonly snapshot: Snapshot }
  | { readonly kind: "conflict"; readonly snapshot: Snapshot }
  | { readonly kind: "invalid"; readonly message: string }
  | { readonly kind: "unavailable"; readonly message: string };
export type WorkoutOptions = {
  readonly databaseName: string;
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
const message =
  "Your browser could not access workout storage. Try reopening this app.";

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

export function openWorkouts(options: WorkoutOptions) {
  const database = new Dexie(options.databaseName);
  database.version(1).stores({ state: "" });
  const table: Table<unknown, string> = database.table("state");
  let closed = false;
  let initialized: Promise<void> | undefined;
  const listeners = new Set<(state: LoadState) => void>();
  let lastState: LoadState = { kind: "loading" };
  const subscriptions = new Set<{ unsubscribe: () => void }>();
  let observationGeneration = 0;
  const emit = (state: LoadState) => {
    if (closed) return;
    lastState = state;
    for (const listener of listeners) listener(state);
  };
  const initialize = () => {
    initialized ??= database.transaction("rw", table, async () => {
      if ((await table.get("snapshot")) === undefined)
        await table.put(initialSnapshot(), "snapshot");
    });
    return initialized;
  };
  const rawRead = async () => {
    await initialize();
    return table.get("snapshot");
  };
  const write = async (
    expectedRevision: number,
    transform: (snapshot: Snapshot) => Snapshot | string,
  ): Promise<Result> => {
    if (closed)
      return { kind: "unavailable", message: "Workout storage is closed." };
    if (!expectedSchema.safeParse(expectedRevision).success)
      return { kind: "invalid", message: "Invalid workout revision." };
    try {
      await initialize();
      return await database.transaction(
        "rw",
        table,
        async (): Promise<Result> => {
          const parsed = snapshotSchema.safeParse(await table.get("snapshot"));
          if (!parsed.success)
            return {
              kind: "invalid",
              message:
                "Stored data needs recovery. Export it before making changes.",
            };
          const snapshot = parsed.data;
          if (snapshot.revision !== expectedRevision)
            return { kind: "conflict", snapshot };
          const next = transform(snapshot);
          if (typeof next === "string")
            return { kind: "invalid", message: next };
          const validated = snapshotSchema.safeParse(next);
          if (!validated.success)
            return {
              kind: "invalid",
              message:
                validated.error.issues[0]?.message ?? "Invalid workout data.",
            };
          if (next.revision !== snapshot.revision)
            await table.put(validated.data, "snapshot");
          return { kind: "saved", snapshot: validated.data };
        },
      );
    } catch {
      return { kind: "unavailable", message };
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
        const result = reduceWorkout(snapshot, parsed.data, {
          at: options.now(),
          id: options.id,
        });
        return result.kind === "rejected" ? result.message : result.snapshot;
      });
    },
    subscribe(listener: (state: LoadState) => void): () => void {
      if (closed) {
        listener({
          kind: "unavailable",
          message: "Workout storage is closed.",
        });
        return () => undefined;
      }
      listeners.add(listener);
      listener(lastState);
      if (listeners.size === 1) {
        const generation = ++observationGeneration;
        void initialize()
          .then(() => {
            if (
              closed ||
              listeners.size === 0 ||
              generation !== observationGeneration
            )
              return;
            const subscription = liveQuery(rawRead).subscribe({
              next(raw) {
                const parsed = snapshotSchema.safeParse(raw);
                emit(
                  parsed.success
                    ? { kind: "ready", snapshot: parsed.data }
                    : {
                        kind: "recovery",
                        message:
                          "Stored workout data could not be read. Export a recovery copy before changing browser storage.",
                        rawExport: JSON.stringify(
                          { format: "form-workout-recovery", raw },
                          null,
                          2,
                        ),
                      },
                );
              },
              error() {
                emit({ kind: "unavailable", message });
              },
            });
            subscriptions.add(subscription);
          })
          .catch(() => emit({ kind: "unavailable", message }));
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          observationGeneration++;
          lastState = { kind: "loading" };
          for (const subscription of subscriptions) subscription.unsubscribe();
          subscriptions.clear();
        }
      };
    },
    async exportBackup(): Promise<string> {
      if (closed) throw new Error("Workout storage is closed.");
      const raw = await rawRead();
      const parsed = snapshotSchema.safeParse(raw);
      return JSON.stringify(
        parsed.success
          ? { format: "form-workout", version: 1, snapshot: parsed.data }
          : { format: "form-workout-recovery", raw },
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
          message: "This is not a valid Form workout backup.",
        };
      return write(expectedRevision, (snapshot) =>
        mergeSnapshots(snapshot, parsed.data.snapshot),
      );
    },
    close(): void {
      closed = true;
      listeners.clear();
      for (const subscription of subscriptions) subscription.unsubscribe();
      subscriptions.clear();
      database.close();
    },
  };
}
export type Workouts = ReturnType<typeof openWorkouts>;
