import type { WorkoutSet } from "../domain";
import { parseSetValues, sameSet, type RawValues, type SetDraft } from "./drafts";

export type TrainingDraftState = RawValues & {
  set: WorkoutSet;
  base: SetDraft["base"];
  touched: boolean;
  recoveredStale: boolean;
  revision: number;
  records: SetDraft[];
  alternatives: SetDraft[];
};

export function restoreTrainingDraft<T extends TrainingDraftState>(state: T): T {
  const recovered = state.records[0];
  if (!recovered) return state;
  const distinct = state.records.some(
    (candidate) =>
      candidate.weight !== recovered.weight || candidate.reps !== recovered.reps,
  );
  return {
    ...state,
    weight: recovered.weight,
    reps: recovered.reps,
    base: recovered.base,
    touched: true,
    recoveredStale:
      recovered.revision !== state.revision || !sameSet(recovered.base, state.set),
    revision: recovered.revision,
    alternatives: distinct ? state.records : [],
  };
}

export function hasDraftConflict(state: TrainingDraftState): boolean {
  return (
    state.touched &&
    (state.recoveredStale ||
      !sameSet(state.base, state.set) ||
      state.alternatives.length > 0)
  );
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
  | { kind: "blocked"; issue: string };

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
  return {
    kind: "ready",
    values,
    completed: valuesOnly
      ? state.set.completed
      : isDraftDirty(state) || !state.set.completed,
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
