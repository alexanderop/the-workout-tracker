import { TaggedError } from "@form/result";
import type { Snapshot } from "./schemas";

/**
 * Expected storage failures, one class per failure. The vocabulary is saved,
 * conflict, invalid and unavailable: a success is the saved snapshot, and the
 * classes below are the other three. The UI turns each tag into a message in
 * `ui/errorMessages.ts`, where TypeScript rejects a class without one.
 */

/** The browser could not open or use workout storage. */
export class StorageUnavailable extends TaggedError("StorageUnavailable") {}
/** The handle was closed; only a new handle can read or write. */
export class StorageClosed extends TaggedError("StorageClosed") {}
/** A write threw and a second read could not tell whether it committed. */
export class SaveUnconfirmed extends TaggedError("SaveUnconfirmed") {}
/** Stored data failed validation. It stays intact and can be exported. */
export class StoredDataUnreadable extends TaggedError("StoredDataUnreadable")<{
  rawExport: string;
}> {}

/** The state changed since the caller reviewed it; carries the newer state. */
export class Conflict extends TaggedError("Conflict")<{ snapshot: Snapshot }> {}
/** Stored data is unreadable, so changes are blocked until it is exported. */
export class RecoveryRequired extends TaggedError("RecoveryRequired") {}
/** The expected revision is not a non-negative safe integer. */
export class InvalidRevision extends TaggedError("InvalidRevision") {}
/**
 * Every rule a change can break, by stable code. The English text is the
 * fallback for logs and tests; the UI translates by code
 * (`errors.rejections.<code>`).
 */
export const rejections = {
  invalidValues: "Please check the entered values.",
  invalidWorkoutChange: "Invalid workout change.",
  invalidWorkoutData: "Invalid workout data.",
  invalidWorkoutCommand: "Invalid workout command.",
  changeFailedUnexpectedly:
    "This change failed unexpectedly. Nothing was saved.",
  revisionMustAdvanceByOne: "Workout revisions must advance by one.",
  changedDataMustAdvance: "Changed workout data must advance its revision.",
  noLongerActive: "This workout is no longer active.",
  finishCurrentFirst: "Finish your current workout first.",
  finishNeedsLoggedSet: "Complete at least one set before finishing.",
  completedNotFound: "This completed workout was not found.",
  setNotInCompleted: "This set was not found in the completed workout.",
  onlyLoggedCorrectable: "Only logged sets can be corrected.",
  setCorrectedOnce: "A set can only be corrected once.",
  workoutNotFound: "Workout was not found.",
  workoutIdExists: "Workout ID already exists.",
  routineNotFound: "Routine was not found.",
  exerciseNotFound: "Exercise was not found.",
  workoutExerciseNotFound: "Workout exercise was not found.",
  tooManyExercises: "A workout can contain up to 50 exercises.",
  needsOneExercise:
    "A workout needs at least one exercise. Discard the workout instead.",
  chooseDifferentExercise: "Choose a different exercise.",
  allSetsLogged: "All sets are logged. Add another exercise instead.",
  setCountRemovesLogged:
    "The set count cannot remove logged work. Clear a set explicitly first.",
  exerciseHasNoSets: "Exercise has no sets.",
  setNotFound: "Set was not found.",
  keepOneSet: "Keep at least one set per exercise.",
  plannedSetNeedsReps: "Planned sets need at least one target repetition.",
} as const;
export type RejectionCode = keyof typeof rejections;

/**
 * The change is invalid; `message` names the rejected rule in English and
 * `code`, when present, lets the UI show it in the active language.
 */
export class InvalidChange extends TaggedError("InvalidChange")<{
  message: string;
  code?: RejectionCode;
}> {}

/** An `InvalidChange` for a known rule. */
export const invalidChange = (code: RejectionCode): InvalidChange =>
  new InvalidChange({ message: rejections[code], code });

/**
 * Data deletion committed, but input drafts could not be cleared. Retrying
 * finishes the cleanup; `snapshot` is the reset journal.
 */
export class DraftCleanupPending extends TaggedError("DraftCleanupPending")<{
  snapshot: Snapshot;
}> {}

/**
 * A newer data deletion made the draft's revision obsolete. The journal
 * refuses the write and only a reload recovers.
 */
export class DraftsDeleted extends TaggedError("DraftsDeleted") {}
/** The browser could not read, write or clear input drafts. */
export class DraftStorageFailed extends TaggedError("DraftStorageFailed")<{
  cause: unknown;
}> {}

/** Why reading the confirmed snapshot failed. */
export type ReadError = StorageUnavailable | StorageClosed | StoredDataUnreadable;
/** Why the draft journal could not write a draft. */
export type DraftWriteError = DraftsDeleted | DraftStorageFailed;
/** Why a revision-checked write did not save. */
export type SaveError =
  | Conflict
  | RecoveryRequired
  | InvalidRevision
  | InvalidChange
  | StorageUnavailable
  | StorageClosed;
