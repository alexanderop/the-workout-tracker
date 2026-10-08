import { computed, ref, watch, type Ref } from "vue";
import type { DraftJournal } from "../application";
import type { Command, SessionExercise, Snapshot, WorkoutSet } from "../domain";
import {
  hasDraftConflict,
  hasPendingInput,
  isDraftDirty,
  decideSetCommit,
  canUndoSet,
  resetDraftToSaved,
  restoreTrainingDraft,
  savedSetBaseline,
  addedSetValues,
  tappedSetReps,
} from "../domain/trainingDrafts";
import { useTrainingDrafts, type TrainingRow } from "./useTrainingDrafts";
import { useTrainingSelection } from "./useTrainingSelection";

export type { TrainingRow } from "./useTrainingDrafts";
export function useTrainingSession(options: {
  snapshot: Ref<Snapshot | null>;
  saving: Readonly<Ref<boolean>>;
  journal: DraftJournal;
  run: (command: Command, revision?: number) => Promise<Snapshot | null>;
}) {
  const drafts = useTrainingDrafts(options);
  const { rows, pending } = drafts;
  const lastLog = ref<{
    sessionId: string;
    setId: string;
    exerciseId: string;
    base: WorkoutSet;
  } | null>(null);
  const notice = ref("");
  const active = computed(() => options.snapshot.value?.active ?? null);
  const selection = useTrainingSelection({
    active,
    rows,
    orderedRows: drafts.orderedRows,
  });
  const { selected, selectSet } = selection;
  watch(
    () => active.value?.id,
    () => {
      notice.value = "";
      lastLog.value = null;
      selection.reset();
    },
  );
  watch(
    options.snapshot,
    (snapshot) => {
      if (!snapshot) return;
      const issue = drafts.synchronize(snapshot);
      if (issue) notice.value = issue;
      invalidateLastLog(snapshot.active?.id);
      selection.restore(snapshot.active?.exercises ?? []);
    },
    { immediate: true },
  );
  function invalidateLastLog(sessionId: string | undefined) {
    if (
      !canUndoSet(
        lastLog.value,
        sessionId,
        rows.get(lastLog.value?.setId ?? "")?.set,
      )
    )
      lastLog.value = null;
  }

  const conflict = hasDraftConflict;
  const dirty = isDraftDirty;
  function edit(setId: string, values: Parameters<typeof drafts.edit>[1]) {
    if (drafts.edit(setId, values)) selectSet(setId);
  }
  async function commit(setId: string, valuesOnly = false) {
    const row = rows.get(setId),
      snapshot = options.snapshot.value,
      session = active.value;
    if (!row || !snapshot || !session || options.saving.value) return;
    if (!recoverUnseenDrafts(session.id)) return;
    const decision = decideSetCommit(row, valuesOnly);
    switch (decision.kind) {
      case "blocked":
        row.issue = decision.issue;
        return;
      case "unchanged":
        return;
      case "ready":
        break;
    }
    const { values, completed } = decision;
    const acknowledged = [...row.records];
    const result = await options.run(
      {
        ...(valuesOnly
          ? { type: "set-values" as const }
          : { type: "set-entry" as const, completed }),
        sessionId: session.id,
        exerciseId: row.exercise.id,
        setId,
        ...values,
      },
      snapshot.revision,
    );
    if (!result) return;
    drafts.consume(row, acknowledged);
    const saved = savedSetBaseline(result, setId, { ...values, completed });
    Object.assign(row, resetDraftToSaved(saved, result.revision));
    row.issue = "";
    reportCommit(row, session.id, completed, valuesOnly);
    Object.assign(row, restoreTrainingDraft(row));
    recoverUnseenDrafts(session.id);
  }
  function reportCommit(
    row: TrainingRow,
    sessionId: string,
    completed: boolean,
    valuesOnly: boolean,
  ) {
    if (valuesOnly) {
      notice.value = "Set values saved. Logging is unchanged.";
      return;
    }
    if (completed) {
      lastLog.value = {
        sessionId,
        setId: row.set.id,
        exerciseId: row.exercise.id,
        base: {
          id: row.set.id,
          weightKg: Number(row.weight),
          reps: Number(row.reps),
          completed: true,
          targetReps: row.base.targetReps,
        },
      };
      notice.value = `${row.exercise.name} · set ${row.index + 1} logged.`;
      selected.value = null;
      return;
    }
    lastLog.value = null;
    notice.value = "Set marked as not logged.";
  }
  function lastExerciseRow(exercise: SessionExercise | undefined) {
    const last = exercise?.sets.at(-1);
    return last ? rows.get(last.id) : undefined;
  }
  async function addSet(exerciseId: string) {
    const session = active.value;
    const exercise = session?.exercises.find((item) => item.id === exerciseId);
    const row = lastExerciseRow(exercise);
    if (!session || !exercise || options.saving.value) return;
    if (!recoverUnseenDrafts(session.id)) return;
    const values = addedSetValues(row);
    if (row && (!values || conflict(row))) {
      row.issue =
        "Review this set's weight and repetitions before adding another set.";
      selectSet(row.set.id);
      return;
    }
    const result = await options.run({
      type: "add-set",
      sessionId: session.id,
      exerciseId,
      ...(values ? { values } : {}),
    });
    selectAddedSet(result, exerciseId);
  }
  function selectAddedSet(result: Snapshot | null, exerciseId: string) {
    const added = result?.active?.exercises
      .find((item) => item.id === exerciseId)
      ?.sets.at(-1);
    if (added) {
      selectSet(added.id);
      selection.requestReviewFocus(added.id);
    }
  }
  async function undoSet(setId: string) {
    const row = rows.get(setId),
      session = active.value,
      snapshot = options.snapshot.value;
    if (!row?.set.completed || !session || !snapshot || options.saving.value)
      return;
    if (!recoverUnseenDrafts(session.id)) return;
    if (hasPendingInput(row)) {
      notice.value = "Save or discard this set’s input before undoing its log.";
      selectSet(setId);
      return;
    }
    if (
      await options.run(
        {
          type: "set-completed",
          sessionId: session.id,
          setId,
          completed: false,
        },
        snapshot.revision,
      )
    ) {
      selectSet(setId);
      lastLog.value = null;
      notice.value = "Set marked as not logged. You can log it again.";
    }
  }
  /** Undoes the most recent log through the same guards as an explicit undo. */
  async function undo() {
    const last = lastLog.value,
      snapshot = options.snapshot.value;
    if (!last || !snapshot) return;
    const row = rows.get(last.setId);
    if (!row || !canUndoSet(last, snapshot.active?.id, row.set)) {
      lastLog.value = null;
      return;
    }
    await undoSet(last.setId);
  }
  async function tapSet(setId: string): Promise<boolean> {
    const row = rows.get(setId),
      session = active.value,
      snapshot = options.snapshot.value;
    if (!row || !session || !snapshot || options.saving.value) return false;
    if (!recoverUnseenDrafts(session.id)) return false;
    if (hasPendingInput(row)) {
      selectSet(setId);
      notice.value =
        "Review this set's input before using the circle shortcut.";
      return false;
    }
    const result = await options.run(
      {
        type: "set-entry",
        sessionId: session.id,
        exerciseId: row.exercise.id,
        setId,
        weightKg: row.set.weightKg,
        reps: tappedSetReps(row.set),
        completed: true,
      },
      snapshot.revision,
    );
    if (!result) return false;
    selectSet(setId);
    lastLog.value = null;
    notice.value = `${row.exercise.name} · set ${row.index + 1} recorded. Tap again for fewer reps.`;
    return true;
  }
  async function clearSet(setId: string): Promise<boolean> {
    const row = rows.get(setId),
      session = active.value;
    if (!row || !session || options.saving.value) return false;
    if (!recoverUnseenDrafts(session.id)) return false;
    if (hasPendingInput(row)) {
      notice.value = "Save or discard this set's draft before clearing it.";
      return false;
    }
    const result = await options.run({
      type: "set-completed",
      sessionId: session.id,
      setId,
      completed: false,
    });
    if (!result) return false;
    selectSet(setId);
    notice.value = `${row.exercise.name} returned to unfinished work.`;
    return true;
  }
  async function editExercise(
    command: Extract<
      Command,
      { type: "configure-exercise" | "set-exercise-note" | "replace-exercise" }
    >,
    revision: number,
  ): Promise<boolean> {
    if (options.saving.value) return false;
    if (
      command.type !== "set-exercise-note" &&
      !recoverUnseenDrafts(command.sessionId)
    )
      return false;
    if (
      command.type !== "set-exercise-note" &&
      [...rows.values()].some(
        (row) => row.exercise.id === command.exerciseId && hasPendingInput(row),
      )
    ) {
      notice.value =
        "Save or discard this exercise's drafts before changing its configuration.";
      return false;
    }
    const saved = await options.run(command, revision);
    if (saved)
      notice.value =
        command.type === "set-exercise-note"
          ? "Exercise note saved."
          : "Exercise updated. Logged sets are unchanged.";
    return !!saved;
  }
  async function saveEdits() {
    for (const row of pending.value) {
      await commit(row.set.id, true);
      if (hasPendingInput(row)) {
        selectSet(row.set.id);
        return false;
      }
    }
    return true;
  }
  function recoverUnseenDrafts(sessionId: string): boolean {
    const check = drafts.recoverUnseen(sessionId);
    if (check.kind === "ready") return true;
    selectSet(check.row.set.id);
    notice.value = check.row.storageIssue;
    return false;
  }
  async function run(command: Command, revision?: number) {
    const session = active.value;
    if (command.type === "finish" && session) {
      if (!recoverUnseenDrafts(session.id)) return null;
      if (pending.value.length) {
        notice.value = "Save or discard your input drafts before finishing.";
        const first = pending.value[0];
        if (first) selectSet(first.set.id);
        return null;
      }
    }
    const observed = drafts.retiringRecords(command);
    const result = await options.run(command, revision);
    if (result && !drafts.acknowledge(observed))
      notice.value =
        "Workout saved, but old input drafts could not be cleared on this device.";
    return result;
  }
  return {
    rows,
    reviewFocus: selection.reviewFocus,
    requestReviewFocus: selection.requestReviewFocus,
    tapSet,
    clearSet,
    editExercise,
    run,
    current: selection.current,
    next: selection.next,
    selected,
    selectedExerciseId: selection.selectedExerciseId,
    currentExercise: selection.currentExercise,
    selectExercise: selection.selectExercise,
    selectSet,
    pending,
    saveEdits,
    lastLog,
    notice: computed(() => notice.value),
    announce: (text: string) => {
      notice.value = text;
    },
    conflict,
    dirty,
    edit,
    useSaved: drafts.useSaved,
    keepInput: drafts.keepInput,
    chooseDraft: drafts.chooseDraft,
    detached: drafts.detached,
    dismissDetached: drafts.dismissDetached,
    commit,
    addSet,
    undo,
    undoSet,
  };
}
