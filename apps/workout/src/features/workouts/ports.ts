import type { Result } from "@form/result";
import type { LoadState, ReadError, SaveError, Snapshot } from "./domain";

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
 * `DraftJournal.write` throws an error with this `name` when a newer data
 * deletion made the draft's revision obsolete. Only a reload recovers.
 */
export type DraftsDeletedErrorName = "DraftsDeletedError";

export type DraftJournal = {
  readonly clearBefore: (revision: number) => void;
  /**
   * Removes obsolete drafts and returns, without removing them, the drafts
   * that belong to a set of a finished workout. Such input arrived too late
   * for the finish and needs explicit recovery.
   */
  readonly prune: (
    snapshot: Snapshot,
  ) => readonly import("./domain/drafts").SetDraft[];
  readonly recover: (
    sessionId: string,
    setId: string,
  ) => readonly import("./domain/drafts").SetDraft[];
  readonly write: (
    input: import("./domain/drafts").DraftInput,
  ) => import("./domain/drafts").SetDraft;
  readonly consume: (
    drafts: readonly import("./domain/drafts").SetDraft[],
  ) => void;
};
