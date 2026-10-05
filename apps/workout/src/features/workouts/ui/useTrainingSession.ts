import { computed, reactive, ref, watch, type Ref } from "vue";
import type { DraftJournal } from "../application";
import type { Command, SessionExercise, Snapshot, WorkoutSet } from "../domain";
import { setTargetReps } from "../domain";
import {
  parseSetValues,
  sameSet,
  type RawValues,
  type SetDraft,
} from "../domain/drafts";

import {
  restoreTrainingDraft,
  hasDraftConflict,
  isDraftDirty,
  decideSetCommit,
  canUndoSet,
  type TrainingDraftState,
} from "../domain/trainingDrafts";

export type TrainingRow = TrainingDraftState & {
  exercise: SessionExercise;
  index: number;
  issue: string;
  storageIssue: string;
};
export function useTrainingSession(options: {
  snapshot: Ref<Snapshot | null>;
  saving: Ref<boolean>;
  journal: DraftJournal;
  run: (command: Command, revision?: number) => Promise<Snapshot | null>;
}) {
  const rows = reactive(new Map<string, TrainingRow>());
  const selected = ref<string | null>(null);
  const reviewFocus = ref<{ setId: string; sequence: number } | null>(null);
  const selectedExerciseId = ref<string | null>(null);
  const lastLog = ref<{
    sessionId: string;
    setId: string;
    exerciseId: string;
    base: WorkoutSet;
  } | null>(null);
  const notice = ref("");
  const active = computed(() => options.snapshot.value?.active ?? null);
  watch(
    () => active.value?.id,
    () => {
      notice.value = "";
      selected.value = null;
      selectedExerciseId.value = null;
      lastLog.value = null;
      reviewFocus.value = null;
    },
  );
  function consume(row: TrainingRow) {
    try {
      options.journal.consume(row.records);
      row.records = [];
      row.storageIssue = "";
      return true;
    } catch {
      row.storageIssue =
        "Draft recovery could not be cleared. Keep this page open and try again.";
      return false;
    }
  }
  watch(
    options.snapshot,
    (snapshot) => {
      if (!snapshot) return;
      try {
        options.journal.prune(snapshot);
      } catch {}
      const session = snapshot.active;
      const exercises = session?.exercises ?? [];
      const present = new Set<string>();
      for (const exercise of exercises)
        for (const [index, set] of exercise.sets.entries()) {
          present.add(set.id);
          synchronizeRow(session!.id, snapshot.revision, exercise, index, set);
        }
      for (const [id, row] of rows)
        if (!present.has(id)) {
          consume(row);
          rows.delete(id);
        }
      invalidateLastLog(session?.id);
      restoreSelection(exercises);
    },
    { immediate: true },
  );
  function orderedRows() {
    return (active.value?.exercises ?? []).flatMap((exercise) =>
      exercise.sets.flatMap((set) => {
        const row = rows.get(set.id);
        return row ? [row] : [];
      }),
    );
  }
  function restoreSelection(exercises: readonly SessionExercise[]) {
    if (exercises.some((exercise) => exercise.id === selectedExerciseId.value))
      return;
    const ordered = orderedRows();
    const pendingRow = ordered.find((row) => row.touched || hasDraftConflict(row));
    const first = pendingRow ?? ordered.find((row) => !row.set.completed);
    selectedExerciseId.value = first?.exercise.id ?? exercises[0]?.id ?? null;
    selected.value = pendingRow?.set.id ?? null;
  }
  function invalidateLastLog(sessionId: string | undefined) {
    if (
      !canUndoSet(lastLog.value, sessionId, rows.get(lastLog.value?.setId ?? "")?.set)
    )
      lastLog.value = null;
  }

  function recoverRecords(
    sessionId: string,
    setId: string,
  ): Pick<TrainingRow, "records" | "storageIssue"> {
    try {
      return {
        records: [...options.journal.recover(sessionId, setId)],
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
    sessionId: string,
    revision: number,
    exercise: SessionExercise,
    index: number,
    set: WorkoutSet,
  ) {
    const row = rows.get(set.id);
    if (row) {
      if (row.touched && !sameSet(row.base, set)) row.recoveredStale = true;
      row.set = set;
      row.exercise = exercise;
      row.index = index;
      if (row.touched) return;
      row.weight = String(set.weightKg);
      row.reps = String(set.reps);
      row.base = { ...set };
      return;
    }
    const recovered = recoverRecords(sessionId, set.id);
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
  const next = computed(() => {
    const set = active.value?.exercises
      .flatMap((exercise) => exercise.sets)
      .find((set) => !set.completed);
    return set ? rows.get(set.id) : undefined;
  });
  const currentExercise = computed(
    () =>
      active.value?.exercises.find(
        (exercise) => exercise.id === selectedExerciseId.value,
      ) ??
      active.value?.exercises[0] ??
      null,
  );
  const current = computed(() => {
    const chosen = selected.value ? rows.get(selected.value) : undefined;
    if (chosen?.exercise.id === currentExercise.value?.id) return chosen;
    return (
      [...rows.values()].find(
        (row) =>
          row.exercise.id === currentExercise.value?.id && !row.set.completed,
      ) ?? null
    );
  });
  function selectExercise(id: string) {
    selectedExerciseId.value = id;
    selected.value = null;
  }
  function selectSet(id: string) {
    const row = rows.get(id);
    if (!row) return;
    selectedExerciseId.value = row.exercise.id;
    selected.value = id;
  }
  function requestReviewFocus(setId: string) {
    if (!rows.has(setId)) return;
    reviewFocus.value = { setId, sequence: (reviewFocus.value?.sequence ?? 0) + 1 };
  }
  const conflict = hasDraftConflict;
  const dirty = isDraftDirty;
  function persist(row: TrainingRow) {
    if (!active.value || !options.snapshot.value) return;
    try {
      const saved = options.journal.write({
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
      const predecessors = row.records;
      row.records = [saved];
      retainAlternatives(row, predecessors);
      row.storageIssue = "";
    } catch {
      row.storageIssue =
        "Draft not saved on this device. Keep this page open and try again.";
    }
  }
  function retainAlternatives(row: TrainingRow, predecessors: SetDraft[]) {
    if (row.alternatives.length) {
      row.records.unshift(...predecessors);
      return;
    }
    options.journal.consume(predecessors);
  }
  function edit(setId: string, values: Partial<RawValues>) {
    const row = rows.get(setId);
    if (!row || options.saving.value) return;
    if (!row.touched) {
      row.base = { ...row.set };
      row.revision = options.snapshot.value?.revision ?? 0;
    }
    row.touched = true;
    Object.assign(row, values);
    row.issue = "";
    selectSet(setId);
    persist(row);
  }
  function useSaved(setId: string) {
    const row = rows.get(setId);
    if (!row) return;
    try {
      row.records = [
        ...row.records,
        ...options.journal.recover(active.value!.id, setId),
      ];
    } catch {}
    if (!consume(row)) return;
    row.weight = String(row.set.weightKg);
    row.reps = String(row.set.reps);
    row.base = { ...row.set };
    row.touched = false;
    row.recoveredStale = false;
    row.alternatives = [];
    row.issue = "";
  }
  function keepInput(setId: string) {
    const row = rows.get(setId);
    const snapshot = options.snapshot.value;
    if (!row || !snapshot || options.saving.value) return;
    row.base = { ...row.set };
    row.revision = snapshot.revision;
    row.recoveredStale = false;
    row.alternatives = [];
    row.issue = "";
    row.touched = true;
    persist(row);
  }
  function chooseDraft(setId: string, draft: SetDraft) {
    const row = rows.get(setId);
    if (!row) return;
    row.weight = draft.weight;
    row.reps = draft.reps;
    row.base = draft.base;
    row.revision = draft.revision;
    row.recoveredStale =
      draft.revision !== options.snapshot.value?.revision ||
      !sameSet(draft.base, row.set);
    row.alternatives = [];
    row.touched = true;
    persist(row);
  }
  async function commit(setId: string, valuesOnly = false) {
    const row = rows.get(setId),
      snapshot = options.snapshot.value,
      session = active.value;
    if (!row || !snapshot || !session || options.saving.value) return;
    const decision = decideSetCommit(row, valuesOnly);
    if (decision.kind === "blocked") {
      row.issue = decision.issue;
      return;
    }
    const { values, completed } = decision;
    try {
      row.records = [
        ...row.records,
        ...options.journal.recover(session.id, setId),
      ];
    } catch {}
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
    consume(row);
    row.touched = false;
    row.recoveredStale = false;
    row.alternatives = [];
    row.issue = "";
    row.base = savedSetBaseline(result, setId, { ...values, completed });
    row.weight = String(row.base.weightKg);
    row.reps = String(row.base.reps);
    reportCommit(row, session.id, completed, valuesOnly);
  }
  function savedSetBaseline(
    snapshot: Snapshot,
    setId: string,
    fallback: SetDraft["base"],
  ) {
    return (
      snapshot.active?.exercises
        .flatMap((exercise) => exercise.sets)
        .find((set) => set.id === setId) ?? fallback
    );
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
  function addedSetValues(row: TrainingRow | undefined) {
    if (!row) return null;
    const values = parseSetValues(row);
    return values ? { ...values, reps: setTargetReps(row.set) } : null;
  }
  async function addSet(exerciseId: string) {
    const session = active.value;
    const exercise = session?.exercises.find((item) => item.id === exerciseId);
    const row = lastExerciseRow(exercise);
    if (!session || !exercise || options.saving.value) return;
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
    if (added) selectSet(added.id);
  }
  async function undo() {
    const last = lastLog.value,
      snapshot = options.snapshot.value;
    if (!last || !snapshot) return;
    const row = rows.get(last.setId);
    if (!row || !canUndoSet(last, snapshot.active?.id, row.set)) {
      lastLog.value = null;
      return;
    }
    if (
      await options.run(
        {
          type: "set-completed",
          sessionId: last.sessionId,
          setId: last.setId,
          completed: false,
        },
        snapshot.revision,
      )
    ) {
      selectSet(last.setId);
      lastLog.value = null;
      notice.value = "Set marked as not logged.";
    }
  }
  async function tapSet(setId: string): Promise<boolean> {
    const row = rows.get(setId),
      session = active.value,
      snapshot = options.snapshot.value;
    if (!row || !session || !snapshot || options.saving.value) return false;
    if (!recoverUnseenDrafts(session.id)) return false;
    if (row.touched || conflict(row)) {
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
        reps: row.set.completed ? Math.max(0, row.set.reps - 1) : row.set.reps,
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
    if (row.touched) {
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
        (row) => row.exercise.id === command.exerciseId && row.touched,
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
  const pending = computed(() =>
    orderedRows().filter((row) => row.touched || conflict(row)),
  );
  async function saveEdits() {
    for (const row of pending.value) {
      await commit(row.set.id, true);
      if (row.touched) {
        selectSet(row.set.id);
        return false;
      }
    }
    return true;
  }
  function recoverUnseenDrafts(sessionId: string): boolean {
    for (const row of rows.values()) {
      let recovered: readonly SetDraft[];
      try {
        recovered = options.journal.recover(sessionId, row.set.id);
      } catch {
        row.storageIssue =
          "Could not check saved drafts. Try again before finishing.";
        selectSet(row.set.id);
        notice.value = row.storageIssue;
        return false;
      }
      const known = new Set(row.records.map((record) => record.id));
      const unseen = recovered.filter((record) => !known.has(record.id));
      const first = unseen[0];
      if (!first) continue;
      if (!row.touched) {
        row.weight = first.weight;
        row.reps = first.reps;
        row.base = first.base;
        row.revision = first.revision;
      }
      row.records = [...row.records, ...unseen];
      row.alternatives = [...row.records];
      row.touched = true;
      row.recoveredStale = true;
      row.issue =
        "Another tab has input drafts for this set. Review them before finishing.";
    }
    return true;
  }
  async function run(command: Command) {
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
    const retiring = [...rows.values()].filter(
      (row) =>
        command.type === "finish" ||
        command.type === "discard" ||
        (command.type === "remove-set" && command.setId === row.set.id) ||
        (command.type === "remove-exercise" &&
          command.exerciseId === row.exercise.id),
    );
    const observed = retiring.flatMap((row) => {
      if (command.type === "finish") return row.records;
      try {
        return [
          ...row.records,
          ...options.journal.recover(session!.id, row.set.id),
        ];
      } catch {
        return row.records;
      }
    });
    const result = await options.run(command);
    if (result) {
      try {
        options.journal.consume(observed);
      } catch {
        notice.value =
          "Workout saved, but old input drafts could not be cleared on this device.";
      }
    }
    return result;
  }
  return {
    rows,
    reviewFocus,
    requestReviewFocus,
    tapSet,
    clearSet,
    editExercise,
    run,
    current,
    next,
    selected,
    selectedExerciseId,
    currentExercise,
    selectExercise,
    selectSet,
    pending,
    saveEdits,
    lastLog,
    notice,
    conflict,
    dirty,
    edit,
    useSaved,
    keepInput,
    chooseDraft,
    commit,
    addSet,
    undo,
  };
}
