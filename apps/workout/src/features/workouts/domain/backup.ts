import { Result, TaggedError } from "@form/result";
import { z } from "zod";
import { canonical } from "./canonical";
import { initialSnapshot } from "./session";
import { snapshotSchema, type Snapshot } from "./schemas";

export const backupLimits = { characters: 20_000_000 } as const;

export class BackupTooLarge extends TaggedError("BackupTooLarge") {}
export class BackupUnreadable extends TaggedError("BackupUnreadable") {}
export class InvalidBackup extends TaggedError("InvalidBackup") {}
/** A record with this ID exists locally with different content. */
export class ConflictingRecord extends TaggedError("ConflictingRecord")<{
  recordId: string;
}> {}
/** The backup holds a different active workout than the local one. */
export class ActiveWorkoutInProgress extends TaggedError(
  "ActiveWorkoutInProgress",
) {}
/** The backup's active workout is also a completed workout. */
export class ActiveWorkoutFinished extends TaggedError(
  "ActiveWorkoutFinished",
) {}

type BackupParseError = BackupTooLarge | BackupUnreadable | InvalidBackup;
type BackupMergeError =
  ConflictingRecord | ActiveWorkoutInProgress | ActiveWorkoutFinished;
export type BackupError = BackupParseError | BackupMergeError;

const backupSchema = z
  .object({
    format: z.literal("form-workout"),
    version: z.literal(2),
    snapshot: snapshotSchema,
  })
  .strict();

export function serializeBackup(snapshot: Snapshot): string {
  return JSON.stringify(
    { format: "form-workout", version: 2, snapshot },
    null,
    2,
  );
}

/** Reads a backup file's text into its snapshot. */
export function parseBackup(json: string): Result<Snapshot, BackupParseError> {
  if (json.length > backupLimits.characters)
    return Result.err(new BackupTooLarge());
  return Result.try({
    try: (): unknown => JSON.parse(json),
    catch: () => new BackupUnreadable(),
  }).andThen((raw) => {
    const parsed = backupSchema.safeParse(raw);
    return parsed.success
      ? Result.ok(parsed.data.snapshot)
      : Result.err(new InvalidBackup());
  });
}

function mergeRecords<T>(
  existing: Readonly<Record<string, T>>,
  imported: Readonly<Record<string, T>>,
): Result<Record<string, T>, ConflictingRecord> {
  const records = { ...existing };
  for (const [id, record] of Object.entries(imported)) {
    if (
      Object.hasOwn(existing, id) &&
      canonical(existing[id]) !== canonical(record)
    )
      return Result.err(new ConflictingRecord({ recordId: id }));
    records[id] = record;
  }
  return Result.ok(records);
}

function mergeActive(
  local: Snapshot,
  incoming: Snapshot,
  completed: Snapshot["completed"],
): Result<Snapshot["active"], ActiveWorkoutInProgress | ActiveWorkoutFinished> {
  if (
    local.active &&
    incoming.active &&
    canonical(local.active) !== canonical(incoming.active)
  )
    return Result.err(new ActiveWorkoutInProgress());
  const active = local.active ?? incoming.active;
  if (active && Object.hasOwn(completed, active.id))
    return Result.err(new ActiveWorkoutFinished());
  return Result.ok(active);
}

/**
 * Merges complete records atomically. Identical records are skipped, a
 * conflicting identity rejects the whole import, and local settings win. A
 * pristine journal can restore edited starter definitions. The result keeps
 * the local revision unless something changed, in which case it advances by
 * one.
 */
export function mergeSnapshots(
  local: Snapshot,
  incoming: Snapshot,
): Result<Snapshot, BackupMergeError> {
  if (canonical({ ...local, revision: 0 }) === canonical(initialSnapshot())) {
    const restored = {
      ...incoming,
      revision: local.revision,
      settings: local.settings,
    };
    return Result.ok(
      canonical(restored) === canonical(local)
        ? local
        : { ...restored, revision: local.revision + 1 },
    );
  }
  return Result.gen(function* () {
    const exercises = yield* mergeRecords(local.exercises, incoming.exercises);
    const routines = yield* mergeRecords(local.routines, incoming.routines);
    const completed = yield* mergeRecords(local.completed, incoming.completed);
    const active = yield* mergeActive(local, incoming, completed);
    const next = { ...local, exercises, routines, completed, active };
    return Result.ok(
      canonical(next) === canonical(local)
        ? local
        : { ...next, revision: local.revision + 1 },
    );
  });
}
