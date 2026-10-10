import { computed, ref } from "vue";
import type { DemoSet } from "./demoSet";
import bench from "../../../assets/exercises/bench-press.png";
import row from "../../../assets/exercises/seated-row.png";
import press from "../../../assets/exercises/shoulder-press.png";

function createExercise(
  { name, weight, image }: { name: string; weight: number; image: string },
  index: number,
) {
  return {
    name,
    weight,
    image,
    sets: Array.from({ length: 3 }, (_, set): DemoSet => ({
      id: index * 3 + set,
      weight,
      reps: 8,
      logged: index === 0 && set === 0,
    })),
  };
}
type DemoExercise = ReturnType<typeof createExercise>;
function createExercises(): [DemoExercise, ...DemoExercise[]] {
  return [
    createExercise({ name: "Bench press", weight: 60, image: bench }, 0),
    createExercise({ name: "Seated row", weight: 45, image: row }, 1),
    createExercise({ name: "Shoulder press", weight: 20, image: press }, 2),
  ];
}
function isValid(set: DemoSet) {
  const weight = Number(set.weight);
  const reps = Number(set.reps);
  return (
    String(set.weight).trim() !== "" &&
    Number.isFinite(weight) &&
    weight >= 0 &&
    Number.isInteger(reps) &&
    reps > 0
  );
}
export function useResearchWorkout() {
  const exercises = ref(createExercises());
  const selected = ref(0);
  const resting = ref(false);
  const review = ref(false);
  const notice = ref("Demo only. Confirming a number does not log a set.");
  const lastId = ref<number>();
  const exercise = computed(
    () => exercises.value[selected.value] ?? exercises.value[0],
  );
  const current = computed(() =>
    exercise.value.sets.find((set) => !set.logged),
  );
  const setNumber = computed(
    () => exercise.value.sets.findIndex((set) => !set.logged) + 1,
  );
  const logged = computed(() =>
    exercises.value.flatMap((item) => item.sets).filter((set) => set.logged),
  );
  const volume = computed(() =>
    logged.value.reduce(
      (sum, set) => sum + Number(set.weight) * Number(set.reps),
      0,
    ),
  );
  function findSet(id: number) {
    return exercises.value
      .flatMap((item) => item.sets)
      .find((set) => set.id === id);
  }
  function edit(id: number, field: "weight" | "reps", value: string | number) {
    const set = findSet(id);
    if (!set || set.logged) return;
    set[field] = value;
  }
  function toggle(id: number) {
    const set = findSet(id);
    if (!set) return;
    if (set.logged) {
      set.logged = false;
      resting.value = false;
      notice.value = "Log undone. You can edit the set again.";
      return;
    }
    if (!isValid(set)) {
      notice.value =
        "Enter a weight of zero or more and a whole repetition count above zero.";
      return;
    }
    set.logged = true;
    lastId.value = id;
    resting.value = true;
    notice.value = "Set logged in preview. Rest display is a paused example.";
  }
  function logCurrent() {
    if (current.value) toggle(current.value.id);
  }
  function undo() {
    if (lastId.value === undefined) return;
    const set = findSet(lastId.value);
    if (set?.logged) toggle(set.id);
    lastId.value = undefined;
  }
  function next(circuit = false) {
    resting.value = false;
    if (circuit) selected.value = (selected.value + 1) % exercises.value.length;
    if (current.value) return;
    const nextIndex = exercises.value.findIndex((item) =>
      item.sets.some((set) => !set.logged),
    );
    if (nextIndex >= 0) selected.value = nextIndex;
  }
  function reset() {
    exercises.value = createExercises();
    selected.value = 0;
    resting.value = false;
    review.value = false;
    lastId.value = undefined;
    notice.value = "Preview reset.";
  }
  return {
    exercises,
    selected,
    exercise,
    current,
    setNumber,
    logged,
    volume,
    resting,
    review,
    notice,
    lastId,
    edit,
    toggle,
    logCurrent,
    undo,
    next,
    reset,
  };
}
