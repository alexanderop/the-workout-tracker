import { matchError } from "@form/result";
import type { Translate } from "../../../i18n";
import type { DeleteError, ImportError } from "../application";
import type { ReadError } from "../domain";

/** What the interface says about a failure, and whether a reload can fix it. */
export type Failure = { readonly message: string; readonly reload: boolean };

/** Shown when another tab saved first; the draft stays visible. */
export const conflictMessage = (t: Translate) => t("errors.failures.conflict");

const reloadable = (message: string): Failure => ({ message, reload: true });
const final = (message: string): Failure => ({ message, reload: false });

/**
 * One message for every expected failure. `matchError` is exhaustive, so a new
 * error class does not compile until it has text here. Only failures that a
 * reload can resolve (conflicts and unavailable storage) offer Reload.
 */
export function describeFailure(
  error: ImportError | DeleteError,
  t: Translate,
): Failure {
  return matchError(error, {
    Conflict: () => reloadable(conflictMessage(t)),
    StorageUnavailable: () =>
      reloadable(t("errors.failures.storageUnavailable")),
    StorageClosed: () => reloadable(t("errors.failures.storageClosed")),
    SaveUnconfirmed: () => reloadable(t("errors.failures.saveUnconfirmed")),
    RecoveryRequired: () => final(t("errors.failures.recoveryRequired")),
    InvalidRevision: () => final(t("errors.failures.invalidRevision")),
    InvalidChange: ({ code, message }) =>
      final(code ? t(`errors.rejections.${code}`) : message),
    DraftCleanupPending: () => final(t("errors.failures.draftCleanupPending")),
    BackupTooLarge: () => final(t("errors.failures.backupTooLarge")),
    BackupUnreadable: () => final(t("errors.failures.backupUnreadable")),
    InvalidBackup: () => final(t("errors.failures.invalidBackup")),
    ConflictingRecord: ({ recordId }) =>
      final(t("errors.failures.conflictingRecord", { recordId })),
    ActiveWorkoutInProgress: () =>
      final(t("errors.failures.activeWorkoutInProgress")),
    ActiveWorkoutFinished: () =>
      final(t("errors.failures.activeWorkoutFinished")),
  });
}

/** Why the journal cannot be shown, for the "needs attention" screen. */
export function describeReadFailure(error: ReadError, t: Translate): string {
  return matchError(error, {
    StorageUnavailable: () => t("errors.failures.storageUnavailable"),
    StorageClosed: () => t("errors.failures.storageClosed"),
    StoredDataUnreadable: () => t("errors.failures.storedDataUnreadable"),
  });
}
