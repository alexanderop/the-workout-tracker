import { computed, watch, type Ref } from "vue";
import type { Workouts, DraftJournal, ApplicationCommand } from "../application";
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
function detachedDraftMessage(entries: readonly DetachedDraft[]) {
  const sets = entries
    .map(
      (entry) =>
        `${entry.exerciseName} set ${entry.index + 1}: ${entry.weight} kg × ${entry.reps}`,
    )
    .join("; ");
  return `Input entered while this workout was finished was not saved: ${sets}. Edit the finished workout to keep it.`;
}
export type WorkoutPage =
  "today" | "workouts" | "history" | "exercises" | "progress" | "session" | "settings";
export function useWorkoutWorkspace(
  service: Workouts,
  journal: DraftJournal,
  now: Readonly<Ref<number>>,
) {
  const workouts = useWorkouts(service);
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
  const workoutName = useWorkoutName({ active, snapshot, run: execute, saving });
  const training = useTrainingSession({
    snapshot,
    saving,
    journal,
    run: execute,
  });
  let surfaced = new Set<string>();
  // Reported once no save is running, so a save confirmation cannot hide it.
  watch(
    () => [training.detached.value, saving.value] as const,
    ([entries, busy]) => {
      if (busy) return;
      const fresh = entries.some((entry) => !surfaced.has(entry.key));
      surfaced = new Set(entries.map((entry) => entry.key));
      if (fresh) workouts.fail(detachedDraftMessage(entries));
    },
    { immediate: true },
  );
  async function execute(command: ApplicationCommand, revision?: number) {
    if (command.type === "finish" && workoutName.dirty.value) {
      workouts.fail("Save or cancel your name change before finishing.");
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
