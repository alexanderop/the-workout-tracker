import type { WorkoutSet } from "../domain";
import {
  parseSetValues,
  sameSet,
  type RawValues,
  type SetDraft,
} from "./drafts";

export type TrainingDraftState = RawValues & {
  set: WorkoutSet;
  base: SetDraft["base"];
  touched: boolean;
  recoveredStale: boolean;
  revision: number;
  records: SetDraft[];
  alternatives: SetDraft[];
};

export function restoreTrainingDraft<T extends TrainingDraftState>(
  state: T,
): T {
  const recovered = state.records[0];
  if (!recovered) return state;
  const distinct = state.records.some(
    (candidate) =>
      candidate.weight !== recovered.weight ||
      candidate.reps !== recovered.reps,
  );
  return {
    ...state,
    weight: recovered.weight,
    reps: recovered.reps,
    base: recovered.base,
    touched: true,
    recoveredStale:
      recovered.revision !== state.revision ||
      !sameSet(recovered.base, state.set),
    revision: recovered.revision,
    alternatives: distinct ? state.records : [],
  };
}

/**
 * The single status a set's input is in. Stored flags are interpreted only
 * here, so callers never combine `touched`, `recoveredStale` and
 * `alternatives` themselves.
 */
export type DraftStatus =
  | { kind: "saved" }
  | { kind: "editing" }
  | {
      kind: "conflict";
      reason: "recovered-stale" | "changed-elsewhere" | "alternatives";
    };

export function draftStatus(state: TrainingDraftState): DraftStatus {
  if (!state.touched) return { kind: "saved" };
  if (state.alternatives.length > 0)
    return { kind: "conflict", reason: "alternatives" };
  if (state.recoveredStale)
    return { kind: "conflict", reason: "recovered-stale" };
  if (!sameSet(state.base, state.set))
    return { kind: "conflict", reason: "changed-elsewhere" };
  return { kind: "editing" };
}

export function hasDraftConflict(state: TrainingDraftState): boolean {
  return draftStatus(state).kind === "conflict";
}

/** True while the input differs from, or awaits review against, the saved set. */
export function hasPendingInput(state: TrainingDraftState): boolean {
  return draftStatus(state).kind !== "saved";
}

type DraftPatch = Partial<
  Pick<
    TrainingDraftState,
    | "weight"
    | "reps"
    | "base"
    | "touched"
    | "recoveredStale"
    | "revision"
    | "records"
    | "alternatives"
  >
>;

/** Typing into a set captures its baseline the first time only. */
export function editDraft(
  state: TrainingDraftState,
  values: Partial<RawValues>,
  revision: number,
): DraftPatch {
  return {
    ...(state.touched ? {} : { base: { ...state.set }, revision }),
    ...values,
    touched: true,
  };
}

/** Adopts the saved set: used for discarding input and after a commit. */
export function resetDraftToSaved(
  set: WorkoutSet,
  revision?: number,
): DraftPatch {
  return {
    weight: String(set.weightKg),
    reps: String(set.reps),
    base: { ...set },
    touched: false,
    recoveredStale: false,
    alternatives: [],
    ...(revision === undefined ? {} : { revision }),
  };
}

/** Keeps the entered input and accepts the current saved set as its baseline. */
export function keepDraftInput(
  state: TrainingDraftState,
  revision: number,
): DraftPatch {
  return {
    base: { ...state.set },
    revision,
    recoveredStale: false,
    alternatives: [],
    touched: true,
  };
}

/** Selects one of several recovered drafts; it still needs review if stale. */
export function chooseRecoveredDraft(
  state: TrainingDraftState,
  draft: SetDraft,
  revision: number | undefined,
): DraftPatch {
  return {
    weight: draft.weight,
    reps: draft.reps,
    base: draft.base,
    revision: draft.revision,
    recoveredStale:
      draft.revision !== revision || !sameSet(draft.base, state.set),
    alternatives: [],
    touched: true,
  };
}

/** A new canonical set arrived. Untouched input follows it; edits keep theirs. */
export function observeSavedSet(
  state: TrainingDraftState,
  set: WorkoutSet,
): DraftPatch & { set: WorkoutSet } {
  if (!state.touched) return { set, ...resetDraftToSaved(set) };
  return {
    set,
    recoveredStale: state.recoveredStale || !sameSet(state.base, set),
  };
}

/** Drafts written by another tab always require review before saving. */
export function mergeUnseenDrafts(
  state: TrainingDraftState,
  unseen: readonly SetDraft[],
): DraftPatch {
  const first = unseen[0];
  if (!first) return {};
  const records = [...state.records, ...unseen];
  return {
    ...(state.touched
      ? {}
      : {
          weight: first.weight,
          reps: first.reps,
          base: first.base,
          revision: first.revision,
        }),
    records,
    alternatives: records,
    touched: true,
    recoveredStale: true,
  };
}

export function isDraftDirty(state: TrainingDraftState): boolean {
  return (
    state.weight !== String(state.set.weightKg) ||
    state.reps !== String(state.set.reps)
  );
}

export type SetCommitDecision =
  | {
      kind: "ready";
      values: { weightKg: number; reps: number };
      completed: boolean;
    }
  | { kind: "blocked"; issue: string }
  | { kind: "unchanged" };

export function decideSetCommit(
  state: TrainingDraftState,
  valuesOnly = false,
): SetCommitDecision {
  if (hasDraftConflict(state))
    return {
      kind: "blocked",
      issue:
        "This set changed in another tab or has different recovered drafts. Review it before logging.",
    };
  const values = parseSetValues(state);
  if (!values)
    return {
      kind: "blocked",
      issue:
        "Enter 0–1000 kg and 0–1000 whole repetitions. Planned sets need at least one rep.",
    };
  if (
    !valuesOnly &&
    state.set.completed &&
    !isDraftDirty(state) &&
    !state.touched
  )
    return { kind: "unchanged" };
  return {
    kind: "ready",
    values,
    completed: valuesOnly ? state.set.completed : true,
  };
}

export function canUndoSet(
  last: { sessionId: string; base: WorkoutSet } | null,
  sessionId: string | undefined,
  set: WorkoutSet | undefined,
): boolean {
  return (
    !!last && last.sessionId === sessionId && !!set && sameSet(last.base, set)
  );
}
