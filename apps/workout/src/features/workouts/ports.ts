import type { Snapshot } from "./domain";

export type StorageState =
  | { readonly kind: "ready"; readonly snapshot: Snapshot }
  | {
      readonly kind: "recovery";
      readonly message: string;
      readonly rawExport: string;
    }
  | { readonly kind: "unavailable"; readonly message: string };
export type LoadState = { readonly kind: "loading" } | StorageState;
export type Result =
  | { readonly kind: "saved"; readonly snapshot: Snapshot }
  | { readonly kind: "conflict"; readonly snapshot: Snapshot }
  | { readonly kind: "invalid"; readonly message: string }
  | { readonly kind: "unavailable"; readonly message: string };
export type WorkoutStorage = {
  readonly read: () => Promise<StorageState>;
  readonly compareAndSave: (
    expectedRevision: number,
    next: Snapshot,
  ) => Promise<Result>;
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
