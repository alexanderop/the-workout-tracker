import { computed, watch, type Ref } from "vue";
import type { Translate } from "../../../i18n";
import type {
  Workouts,
  DraftJournal,
  ApplicationCommand,
} from "../application";
import { sessionTotals, remainingRestSeconds } from "../domain";
import { useWorkouts } from "./useWorkouts";
import { useTrainingSession, type TrainingRow } from "./useTrainingSession";
import type { DetachedDraft } from "./useDetachedDrafts";
import { useWorkoutName } from "./useWorkoutName";
import { duration } from "./presentation";
/** What the active workout asks of the user next; shared by page and dock. */
export type TrainingMode =
  | { kind: "resting"; remaining: number; next: TrainingRow | undefined }
  | { kind: "next"; row: TrainingRow }
  | { kind: "all-logged" }
  | { kind: "empty" };
/** Explains input that a finish overtook; the drafts stay recoverable. */
function detachedDraftMessage(entries: readonly DetachedDraft[], t: Translate) {
  const sets = entries
    .map((entry) =>
      t("errors.failures.detachedDraftSet", {
        exercise: entry.exerciseName,
        index: entry.index + 1,
        weight: entry.weight,
        reps: entry.reps,
      }),
    )
    .join("; ");
  return t("errors.failures.detachedDraft", { sets });
}
export type WorkoutPage =
  | "today"
  | "workouts"
  | "history"
  | "exercises"
  | "progress"
  | "session"
  | "settings";
/** The clock and the translator the workspace reads; tests pass fixed ones. */
export type WorkspaceEnvironment = {
  readonly now: Readonly<Ref<number>>;
  readonly t: Translate;
};
export function useWorkoutWorkspace(
  service: Workouts,
  journal: DraftJournal,
  { now, t }: WorkspaceEnvironment,
) {
  const workouts = useWorkouts(service, t);
  const { snapshot, saving } = workouts;
  const routines = computed(() =>
    Object.values(snapshot.value?.routines ?? {}),
  );
  const catalog = computed(() =>
    Object.values(snapshot.value?.exercises ?? {}).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  );
  const history = computed(() =>
    Object.values(snapshot.value?.completed ?? {}).sort(
      (a, b) => b.finishedAt - a.finishedAt,
    ),
  );
  const active = computed(() => snapshot.value?.active ?? null);
  const workoutName = useWorkoutName({
    active,
    snapshot,
    run: execute,
    saving,
    t,
  });
  const training = useTrainingSession({
    snapshot,
    saving,
    journal,
    run: execute,
    t,
  });
  let surfaced = new Set<string>();
  // Reported once no save is running, so a save confirmation cannot hide it.
  watch(
    () => [training.detached.value, saving.value] as const,
    ([entries, busy]) => {
      if (busy) return;
      const fresh = entries.some((entry) => !surfaced.has(entry.key));
      surfaced = new Set(entries.map((entry) => entry.key));
      if (fresh) workouts.fail(detachedDraftMessage(entries, t));
    },
    { immediate: true },
  );
  async function execute(command: ApplicationCommand, revision?: number) {
    if (command.type === "finish" && workoutName.dirty.value) {
      workouts.fail(t("errors.failures.finishNeedsNameSaved"));
      return null;
    }
    return workouts.run(command, revision);
  }
  function run(command: ApplicationCommand, revision?: number) {
    if (command.type === "finish") return training.run(command, revision);
    return execute(command, revision);
  }
  const activeTotals = computed(() =>
    active.value
      ? sessionTotals(active.value)
      : { completedSets: 0, volumeKg: 0 },
  );
  const activeSetCount = computed(
    () =>
      active.value?.exercises.reduce((sum, ex) => sum + ex.sets.length, 0) ?? 0,
  );
  const rest = computed(() =>
    active.value ? remainingRestSeconds(active.value, now.value) : 0,
  );
  const trainingMode = computed<TrainingMode | null>(() => {
    const session = active.value;
    if (!session) return null;
    const next = training.next.value;
    if (session.rest) return { kind: "resting", remaining: rest.value, next };
    if (next) return { kind: "next", row: next };
    return activeSetCount.value ? { kind: "all-logged" } : { kind: "empty" };
  });
  /** Presentation gate only; `run` still enforces finish safety. */
  const canFinish = computed(
    () =>
      !saving.value &&
      !workoutName.dirty.value &&
      activeTotals.value.completedSets > 0,
  );
  const elapsed = computed(() =>
    duration(active.value ? (now.value - active.value.startedAt) / 1000 : 0),
  );
  return {
    ...workouts,
    run,
    now,
    routines,
    catalog,
    history,
    active,
    workoutName,
    training,
    activeTotals,
    activeSetCount,
    rest,
    trainingMode,
    canFinish,
    elapsed,
  };
}
export type WorkoutWorkspace = ReturnType<typeof useWorkoutWorkspace>;
