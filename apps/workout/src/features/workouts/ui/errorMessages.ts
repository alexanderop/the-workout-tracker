import { matchError } from "@form/result";
import type { DeleteError, ImportError } from "../application";
import type { ReadError } from "../domain";

/** What the interface says about a failure, and whether a reload can fix it. */
export type Failure = { readonly message: string; readonly reload: boolean };

export const conflictMessage =
  "This workout changed in another tab. Your draft is still visible. Reload to use the latest saved values.";

const reloadable = (message: string): Failure => ({ message, reload: true });
const final = (message: string): Failure => ({ message, reload: false });

/**
 * One message for every expected failure. `matchError` is exhaustive, so a new
 * error class does not compile until it has text here. Only failures that a
 * reload can resolve (conflicts and unavailable storage) offer Reload.
 */
export function describeFailure(error: ImportError | DeleteError): Failure {
  return matchError(error, {
    Conflict: () => reloadable(conflictMessage),
    StorageUnavailable: () =>
      reloadable(
        "Your browser could not access workout storage. Try reopening this app.",
      ),
    StorageClosed: () => reloadable("Workout storage is closed."),
    SaveUnconfirmed: () =>
      reloadable(
        "Your browser could not confirm whether this change was saved. Reload before trying again.",
      ),
    RecoveryRequired: () =>
      final("Stored data needs recovery. Export it before making changes."),
    InvalidRevision: () => final("Invalid workout revision."),
    InvalidChange: ({ message }) => final(message),
    DraftCleanupPending: () =>
      final(
        "Your workouts and preferences were deleted, but input drafts could not be cleared. Retry to finish deleting your data.",
      ),
    BackupTooLarge: () => final("Backup is too large. The limit is 20 MB."),
    BackupUnreadable: () => final("This file is not valid JSON."),
    InvalidBackup: () => final("This is not a valid workout backup."),
    ConflictingRecord: ({ recordId }) =>
      final(
        `Backup contains a conflicting record (${recordId}). No data was imported.`,
      ),
    ActiveWorkoutInProgress: () =>
      final(
        "Finish your current workout before importing another active workout.",
      ),
    ActiveWorkoutFinished: () =>
      final("Backup conflicts with an active workout. No data was imported."),
  });
}

/** Why the journal cannot be shown, for the "needs attention" screen. */
export function describeReadFailure(error: ReadError): string {
  return matchError(error, {
    StorageUnavailable: () =>
      "Your browser could not access workout storage. Try reopening this app.",
    StorageClosed: () => "Workout storage is closed.",
    StoredDataUnreadable: () =>
      "Stored workout data could not be read. Export a recovery copy before changing browser storage.",
  });
}
