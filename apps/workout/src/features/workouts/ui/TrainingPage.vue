<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { Button, Input } from "@form/ui";
import { Plus, Dumbbell, Clock3, ShieldCheck } from "@lucide/vue";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import type { SessionExercise } from "../domain";
import type { Confirmation } from "./dialogTypes";
import TrainingExerciseCard from "./TrainingExerciseCard.vue";
import ExerciseConfiguration from "./ExerciseConfiguration.vue";
import TrainingSetEditor from "./TrainingSetEditor.vue";
import { duration, fmt } from "./presentation";
import "./training.css";
const { workspace } = defineProps<{ workspace: WorkoutWorkspace }>();
const {
  active,
  snapshot,
  saving,
  activeTotals,
  activeSetCount,
  elapsed,
  rest,
  training,
  run,
} = workspace;
const emit = defineEmits<{
  finish: [];
  pick: [];
  options: [id: string];
  confirm: [request: Confirmation];
  navigate: [page: "workouts"];
}>();
const name = ref(""),
  nameIssue = ref("");
const pinned = ref<string | null>(null);
const editorSet = ref<string | null>(null);
const configId = ref<string | null>(null);
const configuration = computed(
  () =>
    active.value?.exercises.find(
      (exercise) => exercise.id === configId.value,
    ) ?? null,
);
const cards =
  useTemplateRef<InstanceType<typeof TrainingExerciseCard>[]>("cards");
const addButton = useTemplateRef<InstanceType<typeof Button>>("addButton");
watch(
  () => active.value?.name,
  (value) => {
    name.value = value ?? "";
  },
  { immediate: true },
);
watch(
  () => active.value?.id,
  () => {
    pinned.value = null;
    configId.value = null;
    editorSet.value = null;
  },
);
const isComplete = (exercise: SessionExercise) =>
  exercise.sets.every((set) => set.completed);
const unfinished = computed(
  () =>
    active.value?.exercises.filter(
      (exercise) => !isComplete(exercise) || exercise.id === pinned.value,
    ) ?? [],
);
const completed = computed(
  () =>
    active.value?.exercises.filter(
      (exercise) => isComplete(exercise) && exercise.id !== pinned.value,
    ) ?? [],
);
const ordered = computed(() => [...unfinished.value, ...completed.value]);
const allDone = computed(
  () =>
    !!activeSetCount.value &&
    activeTotals.value.completedSets === activeSetCount.value,
);
const nextRow = training.next;
async function rename() {
  if (!active.value || name.value === active.value.name) return;
  if (!name.value.trim()) {
    nameIssue.value = "Give this workout a name.";
    return;
  }
  nameIssue.value = (await run({
    type: "rename",
    sessionId: active.value.id,
    name: name.value,
  }))
    ? ""
    : "Name not saved. Try again.";
}
function pick() {
  pinned.value = null;
  emit("pick");
}
function configure(id: string) {
  if (pinned.value !== id) pinned.value = null;
  configId.value = id;
}
function edit(id: string) {
  if (training.rows.get(id)?.exercise.id !== pinned.value) pinned.value = null;
  training.selectSet(id);
  editorSet.value = id;
}
async function tap(id: string) {
  const row = training.rows.get(id);
  if (!row) return;
  pinned.value = row.exercise.id;
  if (!(await training.tapSet(id))) {
    if (row.touched || row.issue) edit(id);
    return;
  }
  await nextTick();
  cards.value
    ?.find((card) => card.exerciseId === row.exercise.id)
    ?.focusSet(id);
}
async function closeEditor() {
  const id = editorSet.value;
  const row = id ? training.rows.get(id) : undefined;
  if (row) pinned.value = row.exercise.id;
  editorSet.value = null;
  await nextTick();
  if (row && id)
    cards.value
      ?.find((card) => card.exerciseId === row.exercise.id)
      ?.focusSet(id);
}
async function release() {
  pinned.value = null;
  await nextTick();
  const element = addButton.value?.$el;
  if (element instanceof HTMLElement) element.focus({ preventScroll: true });
}
function remove(exercise: SessionExercise) {
  configId.value = null;
  if (!active.value) return;
  emit("confirm", {
    title: "Remove exercise?",
    description: `Remove ${exercise.name} and its sets from this workout? Completed history stays unchanged.`,
    command: {
      type: "remove-exercise",
      sessionId: active.value.id,
      exerciseId: exercise.id,
    },
  });
}
function discard() {
  if (!active.value) return;
  emit("confirm", {
    title: "Discard this workout?",
    description:
      "This deletes the active workout and its logged sets. Completed history stays saved.",
    command: { type: "discard", sessionId: active.value.id },
  });
}
</script>
<template>
  <section v-if="active" class="circle-workout">
    <a class="training-back text-button" href="#/workouts">Back to workouts</a>
    <header class="circle-workout-heading">
      <div>
        <p class="eyebrow">ACTIVE WORKOUT · {{ elapsed }}</p>
        <h1>
          <Input
            v-model="name"
            aria-label="Workout name"
            maxlength="80"
            :disabled="saving"
            @blur="rename"
            @keydown.enter.prevent="rename"
          />
        </h1>
        <p v-if="nameIssue" class="field-error" role="alert">{{ nameIssue }}</p>
      </div>
      <Button
        variant="secondary"
        :disabled="saving || !activeTotals.completedSets"
        @click="emit('finish')"
        >Finish</Button
      >
    </header>
    <div class="circle-workout-metrics">
      <span v-if="!activeTotals.completedSets"
        >{{ active.exercises.length }}
        {{ active.exercises.length === 1 ? "exercise" : "exercises" }}</span
      ><span v-else
        >{{ activeTotals.completedSets }} / {{ activeSetCount }} sets
        logged</span
      ><span v-if="activeTotals.completedSets"
        >{{ fmt(activeTotals.volumeKg) }} kg lifted</span
      >
    </div>
    <div class="workout-progress-space">
      <progress
        v-if="activeTotals.completedSets"
        class="circle-workout-progress"
        :value="activeTotals.completedSets"
        :max="activeSetCount"
        aria-label="Logged sets"
      />
    </div>
    <p class="workout-guidance workout-live-guidance" role="status">
      {{
        training.notice.value ||
        "Check your sets, reps and weights. Tap a circle after completing its set."
      }}
    </p>
    <div class="circle-workout-layout">
      <div class="circle-workout-list">
        <div v-if="!active.exercises.length" class="workout-empty">
          <Dumbbell :size="28" />
          <h2>Make it your workout.</h2>
          <p>Add an exercise, then choose its sets, reps and weight.</p>
        </div>

        <div v-for="(exercise, index) in ordered" :key="exercise.id">
          <div
            v-if="index === unfinished.length && completed.length"
            class="workout-completed-heading"
          >
            <h2>Completed</h2>
            <span
              >{{ completed.length }}
              {{ completed.length === 1 ? "exercise" : "exercises" }}</span
            >
          </div>
          <TrainingExerciseCard
            ref="cards"
            :exercise="exercise"
            :training="training"
            :busy="saving"
            :completed="isComplete(exercise)"
            :pinned="pinned === exercise.id && isComplete(exercise)"
            @configure="configure(exercise.id)"
            @tap="tap"
            @edit="edit"
            @release="release"
          />
        </div>
        <div v-if="allDone" class="workout-done">
          <p class="eyebrow">ALL SETS LOGGED</p>
          <h2>That’s your last set.</h2>
          <p>Review your work below, or add another exercise.</p>
          <Button :disabled="saving" @click="emit('finish')"
            >Finish workout</Button
          >
        </div>
        <Button
          ref="addButton"
          class="workout-add"
          variant="secondary"
          :disabled="saving || active.exercises.length >= 50"
          @click="pick"
          ><Plus :size="18" />Add exercises</Button
        >
        <p class="workout-guidance">
          Tap again for fewer reps. Hold a circle or choose Edit sets for
          corrections.
        </p>
        <Button variant="ghost" :disabled="saving" @click="discard"
          >Discard workout</Button
        >
      </div>
      <aside class="workout-rest-panel">
        <Clock3 :size="20" /><strong>{{
          active.rest ? duration(rest) : "Ready when you are"
        }}</strong>
        <p>
          {{
            nextRow
              ? `Next: ${nextRow.exercise.name} · Set ${nextRow.index + 1} of ${nextRow.exercise.sets.length}`
              : "All planned work recorded"
          }}
        </p>
        <small>{{
          snapshot?.settings.autoRest
            ? "Your configured rest starts after logging."
            : "Automatic rest is turned off."
        }}</small
        ><Button
          v-if="active.rest"
          variant="secondary"
          :disabled="saving"
          @click="run({ type: 'stop-rest', sessionId: active.id })"
          >{{ rest ? "Skip rest" : "Dismiss timer" }}</Button
        >
        <p class="saved-indicator">
          <ShieldCheck :size="14" />{{
            saving ? "Saving…" : "Saved on this device"
          }}
        </p>
      </aside>
    </div>
    <ExerciseConfiguration
      :exercise="configuration"
      :workspace="workspace"
      @close="configId = null"
      @remove="remove"
    />
    <TrainingSetEditor
      :set-id="editorSet"
      :training="training"
      :busy="saving"
      @close="closeEditor"
      @cleared="closeEditor"
      @select="edit"
      @options="emit('options', $event)"
    />
  </section>
  <div v-else class="empty-state">
    <Dumbbell :size="32" />
    <h1>Ready for your next session?</h1>
    <Button @click="emit('navigate', 'workouts')">Choose a workout</Button>
  </div>
</template>
