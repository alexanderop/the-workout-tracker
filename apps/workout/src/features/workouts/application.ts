import { Result } from "@form/result";
import { z } from "zod";
import {
  canonical,
  commandSchema,
  Conflict,
  DraftCleanupPending,
  exerciseSchema,
  initialSnapshot,
  InvalidChange,
  invalidChange,
  InvalidRevision,
  mergeSnapshots,
  parseBackup,
  RecoveryRequired,
  reduceWorkout,
  SaveUnconfirmed,
  serializeBackup,
  snapshotSchema,
  StorageClosed,
  StorageUnavailable,
  StoredDataUnreadable,
  type BackupError,
  type Command,
  type Exercise,
  type ReadError,
  type SaveError,
  type Snapshot,
} from "./domain";
import type { DraftJournal, WorkoutStorage } from "./ports";
import {
  routineValuesSchema,
  type RoutineValues,
} from "./domain/routineDrafts";

/** Why a revision-checked command did not save. */
export type CommandError = SaveError | SaveUnconfirmed;
export type ImportError = CommandError | BackupError;
export type DeleteError = CommandError | DraftCleanupPending;
export type ExportError = StorageUnavailable | StorageClosed;

export type ApplicationCommand =
  | Command
  | { type: "create-routine"; routine: RoutineValues }
  | { type: "create-exercise"; exercise: Omit<Exercise, "id" | "custom"> };
const createRoutineSchema = z
  .object({
    type: z.literal("create-routine"),
    routine: routineValuesSchema,
  })
  .strict();
const createExerciseSchema = z
  .object({
    type: z.literal("create-exercise"),
    exercise: exerciseSchema.unwrap().omit({ id: true, custom: true }),
  })
  .strict();
const applicationCommandSchema = z.union([
  commandSchema,
  createRoutineSchema,
  createExerciseSchema,
]);

function resolveCommand(
  request: ApplicationCommand,
  id: () => string,
): Command {
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
  /** Receives unexpected failures for diagnostics; results stay the same. */
  readonly reportError?: (context: string, error: unknown) => void;
};
const expectedSchema = z
  .number()
  .int()
  .nonnegative()
  .max(Number.MAX_SAFE_INTEGER);

/** The first schema issue stays as written; without one the code names it. */
const issueOr = (
  message: string | undefined,
  code: "invalidWorkoutCommand" | "invalidWorkoutData",
): InvalidChange =>
  message ? new InvalidChange({ message }) : invalidChange(code);

function validateWrite(next: Snapshot): Result<Snapshot, InvalidChange> {
  const validated = snapshotSchema.safeParse(next);
  return validated.success
    ? Result.ok(validated.data)
    : Result.err(
        issueOr(validated.error.issues[0]?.message, "invalidWorkoutData"),
      );
}

export function createWorkouts({
  storage,
  journal,
  now,
  id,
  reportError = () => undefined,
}: WorkoutDependencies) {
  let closed = false;
  // Reads the flag fresh: it changes while awaits are pending, which control-flow narrowing cannot see.
  const isClosed = () => closed;
  const readCurrent = async (): Promise<Result<Snapshot, ReadError>> =>
    Result.flatten(
      await Result.tryPromise({
        try: () => storage.read(),
        catch: (error) => {
          reportError("Workout storage read failed.", error);
          return new StorageUnavailable();
        },
      }),
    );
  /** Like `readCurrent`, but unreadable data blocks the change. */
  const readWritable = async () =>
    (await readCurrent()).mapError((error) =>
      StoredDataUnreadable.is(error) ? new RecoveryRequired() : error,
    );
  const applyTransform = <E>(
    snapshot: Snapshot,
    transform: (snapshot: Snapshot) => Result<Snapshot, E>,
  ): Result<Snapshot, E | InvalidChange> =>
    Result.flatten(
      Result.try({
        try: () => transform(snapshot),
        catch: (error) => {
          reportError("Workout change failed unexpectedly.", error);
          return invalidChange("changeFailedUnexpectedly");
        },
      }),
    );
  // A throwing save may still have committed, so re-read before reporting.
  const confirmSave = async (
    expectedRevision: number,
    next: Snapshot,
  ): Promise<Result<Snapshot, CommandError>> => {
    const after = await readCurrent();
    if (after.isErr()) return Result.err(new SaveUnconfirmed());
    if (after.value.revision === expectedRevision)
      return Result.err(new StorageUnavailable());
    if (canonical(after.value) === canonical(next))
      return Result.ok(after.value);
    return Result.err(new Conflict({ snapshot: after.value }));
  };
  const save = async (
    expectedRevision: number,
    next: Snapshot,
  ): Promise<Result<Snapshot, CommandError>> => {
    const attempt = await Result.tryPromise({
      try: () => storage.compareAndSave(expectedRevision, next),
      catch: (error) => {
        reportError("Workout storage write failed.", error);
        return error;
      },
    });
    if (attempt.isErr()) return confirmSave(expectedRevision, next);
    return attempt.value;
  };
  const write = <E>(
    expectedRevision: number,
    transform: (snapshot: Snapshot) => Result<Snapshot, E>,
  ): Promise<Result<Snapshot, CommandError | E>> =>
    Result.gen(async function* () {
      if (closed) return yield* new StorageClosed();
      if (!expectedSchema.safeParse(expectedRevision).success)
        return yield* new InvalidRevision();
      const current = yield* Result.await(readWritable());
      if (current.revision !== expectedRevision)
        return yield* new Conflict({ snapshot: current });
      const next = yield* applyTransform(current, transform);
      const valid = yield* validateWrite(next);
      if (isClosed()) return yield* new StorageClosed();
      return Result.ok(yield* Result.await(save(expectedRevision, valid)));
    });
  return {
    async deleteAllData(
      expectedRevision: number,
    ): Promise<Result<Snapshot, DeleteError>> {
      const saved = await write(expectedRevision, (snapshot) =>
        Result.ok({ ...initialSnapshot(), revision: snapshot.revision + 1 }),
      );
      if (saved.isErr()) return saved;
      if (journal.clearBefore(saved.value.revision).isErr())
        return Result.err(new DraftCleanupPending({ snapshot: saved.value }));
      return saved;
    },
    execute(
      command: ApplicationCommand,
      expectedRevision: number,
    ): Promise<Result<Snapshot, CommandError>> {
      const parsed = applicationCommandSchema.safeParse(command);
      if (!parsed.success)
        return Promise.resolve(
          Result.err(
            issueOr(parsed.error.issues[0]?.message, "invalidWorkoutCommand"),
          ),
        );
      return write(expectedRevision, (snapshot) => {
        const resolved = resolveCommand(parsed.data, id);
        const validated = commandSchema.safeParse(resolved);
        if (!validated.success)
          return Result.err(
            issueOr(
              validated.error.issues[0]?.message,
              "invalidWorkoutCommand",
            ),
          );
        const result = reduceWorkout(snapshot, validated.data, {
          at: now(),
          id,
        });
        return result.kind === "rejected"
          ? Result.err(
              new InvalidChange({ message: result.message, code: result.code }),
            )
          : Result.ok(result.snapshot);
      });
    },
    subscribe: storage.subscribe,
    async exportBackup(): Promise<Result<string, ExportError>> {
      if (closed) return Result.err(new StorageClosed());
      const current = await readCurrent();
      if (current.isOk()) return Result.ok(serializeBackup(current.value));
      if (StoredDataUnreadable.is(current.error))
        return Result.ok(current.error.rawExport);
      return Result.err(current.error);
    },
    importBackup(
      json: string,
      expectedRevision: number,
    ): Promise<Result<Snapshot, ImportError>> {
      return Result.gen(async function* () {
        const incoming = yield* parseBackup(json);
        const merged = yield* Result.await(
          write(expectedRevision, (snapshot) =>
            mergeSnapshots(snapshot, incoming),
          ),
        );
        return Result.ok(merged);
      });
    },
    close(): void {
      if (closed) return;
      closed = true;
      storage.close();
    },
  };
}
export type Workouts = ReturnType<typeof createWorkouts>;
export type { DraftJournal, WorkoutStorage } from "./ports";
