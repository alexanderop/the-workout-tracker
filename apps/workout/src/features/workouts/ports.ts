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

export type DraftJournal = {
  readonly clearBefore: (revision: number) => void;
  readonly prune: (snapshot: Snapshot) => void;
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
