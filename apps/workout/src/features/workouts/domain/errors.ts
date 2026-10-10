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
/** The change is invalid; `message` names the rejected rule. */
export class InvalidChange extends TaggedError("InvalidChange")<{
  message: string;
}> {}

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
