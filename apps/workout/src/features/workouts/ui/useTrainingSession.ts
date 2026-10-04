import { computed, reactive, ref, watch, type Ref } from "vue";
import type { DraftJournal } from "../application";
import type { Command, SessionExercise, Snapshot, WorkoutSet } from "../domain";
import {
  parseSetValues,
  sameSet,
  type RawValues,
  type SetDraft,
} from "../domain/drafts";

export type TrainingRow = {
  set: WorkoutSet;
  exercise: SessionExercise;
  index: number;
  weight: string;
  reps: string;
  base: SetDraft["base"];
  touched: boolean;
  recoveredStale: boolean;
  revision: number;
  records: SetDraft[];
  alternatives: SetDraft[];
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
      const present = new Set<string>();
      for (const exercise of session?.exercises ?? [])
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
    },
    { immediate: true },
  );
  function invalidateLastLog(sessionId: string | undefined) {
    if (
      lastLog.value &&
      (lastLog.value.sessionId !== sessionId ||
        !rows.has(lastLog.value.setId) ||
        !sameSet(lastLog.value.base, rows.get(lastLog.value.setId)!.set))
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
    rows.set(set.id, restoreRow(fresh));
  }
  function restoreRow(row: TrainingRow): TrainingRow {
    const recovered = row.records[0];
    if (!recovered) return row;
    const distinct = row.records.some(
      (candidate) =>
        candidate.weight !== recovered.weight ||
        candidate.reps !== recovered.reps,
    );
    return {
      ...row,
      weight: recovered.weight,
      reps: recovered.reps,
      base: recovered.base,
      touched: true,
      recoveredStale: !sameSet(recovered.base, row.set),
      revision: recovered.revision,
      alternatives: distinct ? row.records : [],
    };
  }
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
  const conflict = (row: TrainingRow) =>
    row.touched &&
    (row.recoveredStale ||
      !sameSet(row.base, row.set) ||
      row.alternatives.length > 0);
  const dirty = (row: TrainingRow) =>
    row.weight !== String(row.set.weightKg) ||
    row.reps !== String(row.set.reps);
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
    row.recoveredStale = !sameSet(draft.base, row.set);
    row.alternatives = [];
    row.touched = true;
    persist(row);
  }
  function valuesToCommit(row: TrainingRow) {
    if (conflict(row)) {
      row.issue =
        "This set changed in another tab or has different recovered drafts. Review it before logging.";
      return;
    }
    const values = parseSetValues(row);
    if (!values) {
      row.issue = "Enter 0–1000 kg and 1–1000 whole repetitions.";
      return;
    }
    return values;
  }
  function completionAfterCommit(row: TrainingRow, valuesOnly: boolean) {
    if (valuesOnly) return row.set.completed;
    return dirty(row) || !row.set.completed;
  }
  async function commit(setId: string, valuesOnly = false) {
    const row = rows.get(setId),
      snapshot = options.snapshot.value,
      session = active.value;
    if (!row || !snapshot || !session || options.saving.value) return;
    const values = valuesToCommit(row);
    if (!values) return;
    const completed = completionAfterCommit(row, valuesOnly);
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
    row.base = { ...values, completed };
    row.weight = String(values.weightKg);
    row.reps = String(values.reps);
    reportCommit(row, session.id, completed, valuesOnly);
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
    const values = row ? parseSetValues(row) : null;
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
    if (!row || !sameSet(last.base, row.set)) {
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
  const pending = computed(() =>
    [...rows.values()].filter((row) => row.touched || conflict(row)),
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
    run,
    current,
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
