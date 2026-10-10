import { computed, reactive, type Ref } from "vue";
import type { DraftJournal } from "../application";
import type { Command, SessionExercise, Snapshot, WorkoutSet } from "../domain";
import type { RawValues, SetDraft } from "../domain/drafts";
import {
  restoreTrainingDraft,
  hasPendingInput,
  editDraft,
  resetDraftToSaved,
  keepDraftInput,
  chooseRecoveredDraft,
  observeSavedSet,
  mergeUnseenDrafts,
  type TrainingDraftState,
} from "../domain/trainingDrafts";
import { unionDrafts as union, useDetachedDrafts } from "./useDetachedDrafts";

export type TrainingRow = TrainingDraftState & {
  exercise: SessionExercise;
  index: number;
  issue: string;
  storageIssue: string;
};
export type DraftCheck =
  | { readonly kind: "ready" }
  | { readonly kind: "unavailable"; readonly row: TrainingRow };
const deletedIssue =
  "This workout's data was deleted in another tab. Reload before editing.";
const unsavedIssue =
  "Draft not saved on this device. Keep this page open and try again.";
const uncleanedIssue =
  "Draft saved, but older input could not be cleared on this device.";

/**
 * Owns one editable row per set of the active workout and keeps it in step
 * with the injected draft journal. Selection and commands live in
 * useTrainingSession.
 */
export function useTrainingDrafts(options: {
  snapshot: Ref<Snapshot | null>;
  saving: Readonly<Ref<boolean>>;
  journal: DraftJournal;
}) {
  const rows = reactive(new Map<string, TrainingRow>());
  const detached = useDetachedDrafts(options.journal);
  const active = computed(() => options.snapshot.value?.active ?? null);
  let sessionId: string | undefined;
  /** Records of removed rows whose acknowledgement failed; retried later. */
  let stranded: SetDraft[] = [];
  function consume(row: TrainingRow, records = row.records) {
    try {
      options.journal.consume(records);
      const acknowledged = new Set(records.map((record) => record.id));
      row.records = row.records.filter(
        (record) => !acknowledged.has(record.id),
      );
      row.storageIssue = "";
      return true;
    } catch {
      row.storageIssue =
        "Draft recovery could not be cleared. Keep this page open and try again.";
      return false;
    }
  }
  function retryStranded() {
    if (!stranded.length) return;
    try {
      options.journal.consume(stranded);
      stranded = [];
    } catch {
      // Still stranded; the issue was reported when it first failed.
    }
  }
  /**
   * Adopts a canonical snapshot: prunes the journal, syncs every row and
   * detaches input that a finish overtook. Returns a new cleanup issue for
   * removed rows whose drafts could not be cleared, or "".
   */
  function synchronize(snapshot: Snapshot): string {
    let finished: readonly SetDraft[] = [];
    try {
      finished = options.journal.prune(snapshot);
    } catch {
      // Pruning is best effort; recovery still filters stale records.
    }
    retryStranded();
    const present = synchronizeRows(snapshot);
    const retired = retireRows(snapshot, present);
    detached.detachRecords(
      snapshot,
      finished.filter((record) => !retired.consumed.has(record.id)),
    );
    sessionId = snapshot.active?.id;
    return retired.issue;
  }
  /** Syncs a row for every set of the active workout; returns their IDs. */
  function synchronizeRows(snapshot: Snapshot) {
    const session = snapshot.active;
    const present = new Set<string>();
    for (const exercise of session?.exercises ?? [])
      for (const [index, set] of exercise.sets.entries()) {
        present.add(set.id);
        if (session)
          synchronizeRow(session.id, snapshot.revision, exercise, index, set);
      }
    return present;
  }
  /**
   * Removes rows whose set is gone. Pending input for a finished workout is
   * detached; other records are acknowledged or stranded for a retry.
   */
  function retireRows(snapshot: Snapshot, present: ReadonlySet<string>) {
    const consumed = new Set<string>();
    let issue = "";
    for (const [id, row] of rows) {
      if (present.has(id)) continue;
      rows.delete(id);
      const values = { weight: row.weight, reps: row.reps };
      if (
        sessionId &&
        hasPendingInput(row) &&
        detached.detach(snapshot, sessionId, id, values, row.records)
      )
        continue;
      for (const record of row.records) consumed.add(record.id);
      if (consume(row)) continue;
      stranded = union(stranded, row.records);
      issue =
        "Saved, but input drafts of a removed set could not be cleared on this device. They are retried automatically.";
    }
    return { consumed, issue };
  }
  function orderedRows() {
    return (active.value?.exercises ?? []).flatMap((exercise) =>
      exercise.sets.flatMap((set) => {
        const row = rows.get(set.id);
        return row ? [row] : [];
      }),
    );
  }
  function recoverRecords(
    session: string,
    setId: string,
  ): Pick<TrainingRow, "records" | "storageIssue"> {
    try {
      return {
        records: [...options.journal.recover(session, setId)],
        storageIssue: "",
      };
    } catch {
      return {
        records: [],
        storageIssue:
          "Draft recovery is unavailable. New edits may not survive closing this page.",
      };
    }
  }
  function synchronizeRow(
    session: string,
    revision: number,
    exercise: SessionExercise,
    index: number,
    set: WorkoutSet,
  ) {
    const row = rows.get(set.id);
    if (row) {
      Object.assign(row, observeSavedSet(row, set), { exercise, index });
      return;
    }
    const recovered = recoverRecords(session, set.id);
    const fresh: TrainingRow = {
      set,
      exercise,
      index,
      revision,
      ...recovered,
      weight: String(set.weightKg),
      reps: String(set.reps),
      base: { ...set },
      touched: false,
      recoveredStale: false,
      alternatives: [],
      issue: "",
    };
    rows.set(set.id, restoreTrainingDraft(fresh));
  }
  function persist(row: TrainingRow) {
    if (!active.value || !options.snapshot.value) return;
    let saved: SetDraft;
    try {
      saved = options.journal.write({
        sessionId: active.value.id,
        setId: row.set.id,
        weight: row.weight,
        reps: row.reps,
        base: {
          weightKg: row.base.weightKg,
          reps: row.base.reps,
          completed: row.base.completed,
          targetReps: row.base.targetReps,
        },
        revision: row.revision,
      });
    } catch (error) {
      row.storageIssue =
        error instanceof Error && error.name === "DraftsDeletedError"
          ? deletedIssue
          : unsavedIssue;
      return;
    }
    const predecessors = row.records;
    row.records = [saved];
    row.storageIssue = retainAlternatives(row, predecessors);
  }
  /** Returns a storage issue when superseded drafts could not be cleared. */
  function retainAlternatives(row: TrainingRow, predecessors: SetDraft[]) {
    if (row.alternatives.length) {
      row.records.unshift(...predecessors);
      return "";
    }
    try {
      options.journal.consume(predecessors);
      return "";
    } catch {
      // Keep them so the next acknowledgement retries.
      row.records.push(...predecessors);
      return uncleanedIssue;
    }
  }
  /** Returns whether the row accepted the input. */
  function edit(setId: string, values: Partial<RawValues>): boolean {
    const row = rows.get(setId);
    if (!row || options.saving.value) return false;
    Object.assign(
      row,
      editDraft(row, values, options.snapshot.value?.revision ?? 0),
    );
    row.issue = "";
    persist(row);
    return true;
  }
  function useSaved(setId: string) {
    const row = rows.get(setId);
    const session = active.value;
    if (!row || !session || options.saving.value) return;
    try {
      row.records = union(
        row.records,
        options.journal.recover(session.id, setId),
      );
    } catch {
      // Consume what is already known; unseen records surface on next check.
    }
    if (!consume(row)) return;
    Object.assign(row, resetDraftToSaved(row.set));
    row.issue = "";
  }
  function keepInput(setId: string) {
    const row = rows.get(setId);
    const snapshot = options.snapshot.value;
    if (!row || !snapshot || options.saving.value) return;
    Object.assign(row, keepDraftInput(row, snapshot.revision));
    row.issue = "";
    persist(row);
  }
  function chooseDraft(setId: string, draft: SetDraft) {
    const row = rows.get(setId);
    if (!row || options.saving.value) return;
    Object.assign(
      row,
      chooseRecoveredDraft(row, draft, options.snapshot.value?.revision),
    );
    persist(row);
  }
  /** Merges drafts written by other tabs since the rows were last read. */
  function recoverUnseen(session: string): DraftCheck {
    for (const row of rows.values()) {
      let recovered: readonly SetDraft[];
      try {
        recovered = options.journal.recover(session, row.set.id);
      } catch {
        row.storageIssue =
          "Could not check saved drafts. Try again before saving.";
        return { kind: "unavailable", row };
      }
      const known = new Set(row.records.map((record) => record.id));
      const unseen = recovered.filter((record) => !known.has(record.id));
      if (!unseen.length) continue;
      Object.assign(row, mergeUnseenDrafts(row, unseen));
      row.issue =
        "Another tab has input drafts for this set. Review them before saving.";
    }
    return { kind: "ready" };
  }
  /** Journal records belonging to rows that the command will remove. */
  function retiringRecords(command: Command): SetDraft[] {
    const session = active.value;
    return [...rows.values()]
      .filter(
        (row) =>
          command.type === "finish" ||
          command.type === "discard" ||
          (command.type === "remove-set" && command.setId === row.set.id) ||
          (command.type === "remove-exercise" &&
            command.exerciseId === row.exercise.id),
      )
      .flatMap((row) => {
        if (command.type === "finish" || !session) return row.records;
        try {
          return [
            ...row.records,
            ...options.journal.recover(session.id, row.set.id),
          ];
        } catch {
          return row.records;
        }
      });
  }
  /** Returns false when the journal could not acknowledge the records. */
  function acknowledge(records: readonly SetDraft[]): boolean {
    try {
      options.journal.consume(records);
      return true;
    } catch {
      return false;
    }
  }
  const pending = computed(() => orderedRows().filter(hasPendingInput));
  return {
    rows,
    pending,
    orderedRows,
    synchronize,
    consume,
    edit,
    useSaved,
    keepInput,
    chooseDraft,
    recoverUnseen,
    retiringRecords,
    acknowledge,
    detached: detached.entries,
    dismissDetached: detached.dismiss,
  };
}
