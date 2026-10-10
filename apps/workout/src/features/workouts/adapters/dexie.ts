import { Result } from "@form/result";
import { Dexie, liveQuery, type Table } from "dexie";
import {
  Conflict,
  invalidChange,
  InvalidRevision,
  loadState,
  RecoveryRequired,
  snapshotSchema,
  StorageClosed,
  StorageUnavailable,
  StoredDataUnreadable,
  type LoadState,
  type ReadError,
  type SaveError,
  type Snapshot,
} from "../domain";
import type { WorkoutStorage } from "../ports";

function decode(raw: unknown): Result<Snapshot, StoredDataUnreadable> {
  const parsed = snapshotSchema.safeParse(raw);
  return parsed.success
    ? Result.ok(parsed.data)
    : Result.err(
        new StoredDataUnreadable({
          rawExport: JSON.stringify(
            { format: "form-workout-recovery", raw },
            null,
            2,
          ),
        }),
      );
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
  // Reads the flag fresh: it changes while awaits are pending, which control-flow narrowing cannot see.
  const isClosed = () => closed;
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
    }).catch((error: unknown) => {
      // Forget a failed attempt so the next call retries the open.
      initialized = undefined;
      throw error;
    });
    return initialized;
  };
  const commit = async (
    expectedRevision: number,
    candidate: Snapshot,
  ): Promise<Result<Snapshot, SaveError>> => {
    const current = snapshotSchema.safeParse(await table.get("snapshot"));
    if (!current.success) return Result.err(new RecoveryRequired());
    if (current.data.revision !== expectedRevision)
      return Result.err(new Conflict({ snapshot: current.data }));
    if (candidate.revision === expectedRevision) {
      if (JSON.stringify(candidate) !== JSON.stringify(current.data))
        return Result.err(
          invalidChange("changedDataMustAdvance"),
        );
      return Result.ok(current.data);
    }
    if (candidate.revision !== expectedRevision + 1)
      return Result.err(
        invalidChange("revisionMustAdvanceByOne"),
      );
    await table.put(candidate, "snapshot");
    return Result.ok(candidate);
  };
  /** A failed effect is `closed` when the handle was closed meanwhile. */
  const failure = () => (isClosed() ? new StorageClosed() : new StorageUnavailable());
  const rawRead = async () => {
    await initialize();
    return table.get("snapshot");
  };
  return {
    async read(): Promise<Result<Snapshot, ReadError>> {
      if (closed) return Result.err(new StorageClosed());
      const raw = await Result.tryPromise({ try: rawRead, catch: failure });
      if (isClosed()) return Result.err(new StorageClosed());
      return raw.isOk() ? decode(raw.value) : Result.err(raw.error);
    },
    async compareAndSave(
      expectedRevision,
      next,
    ): Promise<Result<Snapshot, SaveError>> {
      if (closed) return Result.err(new StorageClosed());
      if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0)
        return Result.err(new InvalidRevision());
      const candidate = snapshotSchema.safeParse(next);
      if (!candidate.success)
        return Result.err(invalidChange("invalidWorkoutData"));
      const opened = await Result.tryPromise({ try: initialize, catch: failure });
      if (opened.isErr()) return Result.err(opened.error);
      if (isClosed()) return Result.err(new StorageClosed());
      return Result.flatten(
        await Result.tryPromise({
          try: () =>
            database.transaction("rw", table, () =>
              commit(expectedRevision, candidate.data),
            ),
          catch: failure,
        }),
      );
    },
    subscribe(listener) {
      if (closed) {
        listener(loadState(Result.err(new StorageClosed())));
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
                if (currentGeneration === generation)
                  emit(loadState(decode(raw)));
              },
              error() {
                if (currentGeneration === generation)
                  emit(loadState(Result.err(new StorageUnavailable())));
              },
            });
          })
          .catch(() => {
            if (currentGeneration === generation)
              emit(loadState(Result.err(new StorageUnavailable())));
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
