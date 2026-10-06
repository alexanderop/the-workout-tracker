import Dexie, { liveQuery, type Table } from "dexie";
import { snapshotSchema, type Snapshot } from "../domain";
import type { LoadState, Result, StorageState, WorkoutStorage } from "../ports";

const unavailable = {
  kind: "unavailable",
  message:
    "Your browser could not access workout storage. Try reopening this app.",
} as const;
const closedState = {
  kind: "unavailable",
  message: "Workout storage is closed.",
} as const;

function decode(raw: unknown): StorageState {
  const parsed = snapshotSchema.safeParse(raw);
  return parsed.success
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
      };
}

export function openDexieWorkoutStorage(
  databaseName: string,
  initial: Snapshot,
): WorkoutStorage {
  const seed = snapshotSchema.parse(initial);
  const database = new Dexie(databaseName);
  database.version(1).stores({ state: "" });
  const table: Table<unknown, string> = database.table("state");
  let closed = false;
  let initialized: Promise<void> | undefined;
  let generation = 0;
  let observation: { unsubscribe: () => void } | undefined;
  const listeners = new Set<(state: LoadState) => void>();
  let lastState: LoadState = { kind: "loading" };
  const emit = (state: LoadState) => {
    if (closed) return;
    lastState = state;
    for (const listener of listeners) listener(state);
  };
  const initialize = () => {
    initialized ??= database.transaction("rw", table, async () => {
      const raw = await table.get("snapshot");
      if (raw === undefined) {
        await table.put(seed, "snapshot");
        return;
      }
      const parsed = snapshotSchema.safeParse(raw);
      if (!parsed.success) return;
      const missing = Object.values(seed.exercises).filter(
        (exercise) => !exercise.custom && !Object.hasOwn(parsed.data.exercises, exercise.id),
      );
      if (!missing.length) return;
      const updated = snapshotSchema.parse({
        ...parsed.data,
        revision: parsed.data.revision + 1,
        exercises: {
          ...parsed.data.exercises,
          ...Object.fromEntries(missing.map((exercise) => [exercise.id, exercise])),
        },
      });
      await table.put(updated, "snapshot");
    });
    return initialized;
  };
  const rawRead = async () => {
    await initialize();
    return table.get("snapshot");
  };
  return {
    async read() {
      if (closed) return closedState;
      try {
        const raw = await rawRead();
        return closed ? closedState : decode(raw);
      } catch {
        return closed ? closedState : unavailable;
      }
    },
    async compareAndSave(expectedRevision, next): Promise<Result> {
      if (closed) return closedState;
      if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0)
        return { kind: "invalid", message: "Invalid workout revision." };
      const candidate = snapshotSchema.safeParse(next);
      if (!candidate.success)
        return { kind: "invalid", message: "Invalid workout data." };
      try {
        await initialize();
        if (closed) return closedState;
        return await database.transaction(
          "rw",
          table,
          async (): Promise<Result> => {
            const current = snapshotSchema.safeParse(
              await table.get("snapshot"),
            );
            if (!current.success)
              return {
                kind: "invalid",
                message:
                  "Stored data needs recovery. Export it before making changes.",
              };
            if (current.data.revision !== expectedRevision)
              return { kind: "conflict", snapshot: current.data };
            if (candidate.data.revision === expectedRevision) {
              if (
                JSON.stringify(candidate.data) !== JSON.stringify(current.data)
              )
                return {
                  kind: "invalid",
                  message: "Changed workout data must advance its revision.",
                };
              return { kind: "saved", snapshot: current.data };
            }
            if (candidate.data.revision !== expectedRevision + 1)
              return {
                kind: "invalid",
                message: "Workout revisions must advance by one.",
              };
            await table.put(candidate.data, "snapshot");
            return { kind: "saved", snapshot: candidate.data };
          },
        );
      } catch {
        return closed ? closedState : unavailable;
      }
    },
    subscribe(listener) {
      if (closed) {
        listener(closedState);
        return () => undefined;
      }
      listeners.add(listener);
      listener(lastState);
      if (listeners.size === 1) {
        const currentGeneration = ++generation;
        void initialize()
          .then(() => {
            if (closed || !listeners.size || currentGeneration !== generation)
              return;
            observation = liveQuery(rawRead).subscribe({
              next(raw) {
                if (currentGeneration === generation) emit(decode(raw));
              },
              error() {
                if (currentGeneration === generation) emit(unavailable);
              },
            });
          })
          .catch(() => {
            if (currentGeneration === generation) emit(unavailable);
          });
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          generation++;
          observation?.unsubscribe();
          observation = undefined;
          lastState = { kind: "loading" };
        }
      };
    },
    close() {
      if (closed) return;
      closed = true;
      generation++;
      listeners.clear();
      observation?.unsubscribe();
      database.close();
    },
  };
}
