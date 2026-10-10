import type { Result } from "@form/result";
import type {
  DraftStorageFailed,
  DraftWriteError,
  LoadState,
  ReadError,
  SaveError,
  Snapshot,
} from "./domain";
import type { DraftInput, SetDraft } from "./domain/drafts";

export type { LoadState } from "./domain";

export type WorkoutStorage = {
  /**
   * The confirmed snapshot, or why there is none: unavailable or closed
   * storage, or stored data that failed validation and needs a recovery
   * export.
   */
  readonly read: () => Promise<Result<Snapshot, ReadError>>;
  /** Saves `next` only while `expectedRevision` is still the stored one. */
  readonly compareAndSave: (
    expectedRevision: number,
    next: Snapshot,
  ) => Promise<Result<Snapshot, SaveError>>;
  readonly subscribe: (listener: (state: LoadState) => void) => () => void;
  readonly close: () => void;
};

/**
 * The synchronous journal of unconfirmed weight and repetition input. Every
 * operation reports an expected browser storage failure as `DraftStorageFailed`
 * instead of throwing; the UI decides how much that matters.
 */
export type DraftJournal = {
  readonly clearBefore: (
    revision: number,
  ) => Result<void, DraftStorageFailed>;
  /**
   * Removes obsolete drafts and returns, without removing them, the drafts
   * that belong to a set of a finished workout. Such input arrived too late
   * for the finish and needs explicit recovery.
   */
  readonly prune: (
    snapshot: Snapshot,
  ) => Result<readonly SetDraft[], DraftStorageFailed>;
  readonly recover: (
    sessionId: string,
    setId: string,
  ) => Result<readonly SetDraft[], DraftStorageFailed>;
  /** Fails with `DraftsDeleted` when a newer data deletion obsoleted the draft. */
  readonly write: (input: DraftInput) => Result<SetDraft, DraftWriteError>;
  readonly consume: (
    drafts: readonly SetDraft[],
  ) => Result<void, DraftStorageFailed>;
};
