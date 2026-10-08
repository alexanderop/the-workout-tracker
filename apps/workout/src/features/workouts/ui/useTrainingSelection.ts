import { computed, ref, type Ref } from "vue";
import type { ActiveSession, SessionExercise } from "../domain";
import { hasPendingInput } from "../domain/trainingDrafts";
import type { TrainingRow } from "./useTrainingDrafts";

/** Which exercise and set the training page shows, and where focus goes. */
export function useTrainingSelection(options: {
  active: Readonly<Ref<ActiveSession | null>>;
  rows: ReadonlyMap<string, TrainingRow>;
  orderedRows: () => TrainingRow[];
}) {
  const { active, rows } = options;
  const selected = ref<string | null>(null);
  const selectedExerciseId = ref<string | null>(null);
  const reviewFocus = ref<{ setId: string; sequence: number } | null>(null);
  function reset() {
    selected.value = null;
    selectedExerciseId.value = null;
    reviewFocus.value = null;
  }
  /** Keeps a still-present exercise; otherwise picks pending or open work. */
  function restore(exercises: readonly SessionExercise[]) {
    if (exercises.some((exercise) => exercise.id === selectedExerciseId.value))
      return;
    const ordered = options.orderedRows();
    const pendingRow = ordered.find(hasPendingInput);
    const first = pendingRow ?? ordered.find((row) => !row.set.completed);
    selectedExerciseId.value = first?.exercise.id ?? exercises[0]?.id ?? null;
    selected.value = pendingRow?.set.id ?? null;
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
    reviewFocus.value = {
      setId,
      sequence: (reviewFocus.value?.sequence ?? 0) + 1,
    };
  }
  return {
    selected,
    selectedExerciseId,
    reviewFocus,
    reset,
    restore,
    next,
    currentExercise,
    current,
    selectExercise,
    selectSet,
    requestReviewFocus,
  };
}
