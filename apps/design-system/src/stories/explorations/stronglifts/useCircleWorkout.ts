import { computed, onUnmounted, ref } from "vue";

export type CircleSet = {
  id: number;
  weight: number;
  target: number;
  reps: number | null;
};
export type CircleExercise = {
  name: string;
  weight: number;
  target: number;
  sets: CircleSet[];
};
export type Scenario = "fresh" | "training" | "missed" | "complete" | "empty";
function sample(scenario: Scenario): CircleExercise[] {
  if (scenario === "empty") return [];
  return ["Squat", "Bench Press", "Barbell Row"].map((name, exerciseIndex) => {
    const weight = exerciseIndex === 0 ? 60 : 40;
    return {
      name,
      weight,
      target: 5,
      sets: Array.from({ length: 5 }, (_, index) => {
        const id = exerciseIndex * 5 + index;
        if (scenario === "complete") return { id, weight, target: 5, reps: 5 };
        const lastLogged = scenario === "training" ? 6 : 2;
        if (scenario === "fresh" || id > lastLogged)
          return { id, weight, target: 5, reps: null };
        return {
          id,
          weight,
          target: 5,
          reps: scenario === "missed" && id === 2 ? 3 : 5,
        };
      }),
    };
  });
}
export function useCircleWorkout(scenario: Scenario) {
  const exercises = ref(sample(scenario));
  const now = ref(Date.now());
  const rest = ref<{
    setId: number;
    start: number;
    duration: number;
    preview: boolean;
  } | null>(null);
  const fast = ref(false);
  const notice = ref("Tap a circle after completing a set.");
  const sets = computed(() =>
    exercises.value.flatMap((exercise) => exercise.sets),
  );
  const total = computed(() => sets.value.length);
  const active = computed(() =>
    exercises.value.filter((exercise) =>
      exercise.sets.some((set) => set.reps === null),
    ),
  );
  const completed = computed(() =>
    exercises.value.filter((exercise) =>
      exercise.sets.every((set) => set.reps !== null),
    ),
  );
  function add(name: string) {
    if (exercises.value.some((exercise) => exercise.name === name)) return;
    const firstId = Math.max(-1, ...sets.value.map((set) => set.id)) + 1;
    exercises.value.push({
      name,
      weight: 20,
      target: 8,
      sets: Array.from({ length: 3 }, (_, index) => ({
        id: firstId + index,
        weight: 20,
        target: 8,
        reps: null,
      })),
    });
    notice.value = `${name} added. Adjust its sample weight before logging.`;
  }
  const logged = computed(
    () => sets.value.filter((set) => set.reps !== null).length,
  );
  const volume = computed(() =>
    sets.value.reduce((sum, set) => sum + set.weight * (set.reps ?? 0), 0),
  );
  const remaining = computed(() =>
    rest.value
      ? Math.max(
          0,
          Math.ceil(
            (rest.value.start + rest.value.duration * 1000 - now.value) / 1000,
          ),
        )
      : 0,
  );
  const timer = setInterval(() => {
    now.value = Date.now();
  }, 250);
  onUnmounted(() => clearInterval(timer));
  function duration(reps: number, target: number) {
    if (fast.value) return reps < target ? 10 : 6;
    return reps < target ? 300 : 180;
  }
  function updateRest(set: CircleSet, wasBlank: boolean) {
    if (set.reps === null) return;
    now.value = Date.now();
    if (wasBlank) {
      rest.value = {
        setId: set.id,
        start: now.value,
        duration: duration(set.reps, set.target),
        preview: fast.value,
      };
      return;
    }
    if (rest.value?.setId === set.id) {
      rest.value.duration = duration(set.reps, set.target);
      rest.value.preview = fast.value;
    }
  }
  function tap(set: CircleSet) {
    const wasBlank = set.reps === null;
    set.reps = wasBlank ? set.target : Math.max(0, (set.reps ?? 0) - 1);
    updateRest(set, wasBlank);
    notice.value = `Set recorded: ${set.reps} reps at ${set.weight} kg.`;
  }
  function save(set: CircleSet, weight: number, reps: number) {
    const wasBlank = set.reps === null;
    set.weight = weight;
    if (!wasBlank) set.reps = reps;
    if (wasBlank) set.target = reps;
    updateRest(set, false);
    notice.value = wasBlank
      ? "Planned values updated. Tap the circle to log the target reps."
      : "Logged set corrected.";
  }
  function clear(set: CircleSet) {
    set.reps = null;
    if (rest.value?.setId === set.id) rest.value = null;
    notice.value = "Set cleared. It no longer counts toward your workout.";
  }
  function configure(
    exercise: CircleExercise,
    {
      weight,
      target,
      count,
    }: { weight: number; target: number; count: number },
  ) {
    const recorded = exercise.sets.filter((set) => set.reps !== null).length;
    const desired = Math.max(1, recorded, Math.min(20, Math.round(count)));
    exercise.weight = weight;
    exercise.target = target;
    let blanks = desired - recorded;
    exercise.sets = exercise.sets.filter((set) => {
      if (set.reps !== null) return true;
      blanks -= 1;
      return blanks >= 0;
    });
    for (const set of exercise.sets) {
      if (set.reps !== null) continue;
      set.weight = weight;
      set.target = target;
    }
    let id = Math.max(-1, ...sets.value.map((set) => set.id)) + 1;
    while (exercise.sets.length < desired)
      exercise.sets.push({ id: id++, weight, target, reps: null });
    notice.value = `${exercise.name} updated. Logged sets preserved.`;
  }
  function reset() {
    exercises.value = sample(scenario);
    rest.value = null;
    notice.value = "Sample workout reset.";
  }
  return {
    exercises,
    active,
    completed,
    total,
    add,
    configure,
    logged,
    volume,
    remaining,
    rest,
    fast,
    notice,
    tap,
    save,
    clear,
    reset,
  };
}
