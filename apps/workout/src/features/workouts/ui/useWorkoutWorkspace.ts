import { computed, onMounted, onUnmounted, ref } from "vue";
import type { Workouts, DraftJournal } from "../application";
import { sessionTotals, remainingRestSeconds } from "../domain";
import { useWorkouts } from "./useWorkouts";
import { useTrainingSession } from "./useTrainingSession";
import { duration } from "./presentation";
export type WorkoutPage =
  "today" | "workouts" | "history" | "progress" | "session";
export function useWorkoutWorkspace(service: Workouts, journal: DraftJournal) {
  const workouts = useWorkouts(service);
  const { snapshot, saving, run } = workouts;
  const now = ref(Date.now());
  let tick: ReturnType<typeof setInterval> | undefined;
  onMounted(() => {
    tick = setInterval(() => {
      now.value = Date.now();
    }, 1000);
  });
  onUnmounted(() => {
    if (tick) clearInterval(tick);
  });

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
  const training = useTrainingSession({
    snapshot,
    saving,
    journal,
    run,
  });
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
    now,
    routines,
    catalog,
    history,
    active,
    training,
    activeTotals,
    activeSetCount,
    rest,
    elapsed,
  };
}
export type WorkoutWorkspace = ReturnType<typeof useWorkoutWorkspace>;
