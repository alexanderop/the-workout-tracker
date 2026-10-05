import { computed, type Ref } from "vue";
import type { Workouts, DraftJournal, ApplicationCommand } from "../application";
import { sessionTotals, remainingRestSeconds } from "../domain";
import { useWorkouts } from "./useWorkouts";
import { useTrainingSession } from "./useTrainingSession";
import { useWorkoutName } from "./useWorkoutName";
import { duration } from "./presentation";
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
  async function execute(command: ApplicationCommand, revision?: number) {
    if (command.type === "finish" && workoutName.dirty.value) {
      workouts.error.value = "Save or cancel your name change before finishing.";
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
    elapsed,
  };
}
export type WorkoutWorkspace = ReturnType<typeof useWorkoutWorkspace>;
