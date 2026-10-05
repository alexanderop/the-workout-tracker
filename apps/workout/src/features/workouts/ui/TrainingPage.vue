<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { BaseButton, BaseButtonIcon, BaseInput } from "@form/ui";
import { Plus, Dumbbell, Clock3, ShieldCheck, Ellipsis, Check } from "@lucide/vue";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import { setTargetReps, type SessionExercise } from "../domain";
import type { Confirmation } from "./dialogTypes";
import SetRow from "./SetRow.vue";
import ExerciseThumbnail from "./ExerciseThumbnail.vue";
import type { TrainingRow } from "./useTrainingSession";
import ExerciseConfiguration from "./ExerciseConfiguration.vue";
import TrainingSetEditor from "./TrainingSetEditor.vue";
import { duration, fmt } from "./presentation";
import "./training.css";
const { workspace, workoutsHref } = defineProps<{
  workspace: WorkoutWorkspace;
  workoutsHref: string;
}>();
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

const editorSet = ref<string | null>(null);
const configId = ref<string | null>(null);
const configuration = computed(
  () =>
    active.value?.exercises.find(
      (exercise) => exercise.id === configId.value,
    ) ?? null,
);
const setRows = useTemplateRef<InstanceType<typeof SetRow>[]>("setRows");
const optionsButton = useTemplateRef<InstanceType<typeof BaseButtonIcon>>("optionsButton");
const addButton = useTemplateRef<InstanceType<typeof BaseButton>>("addButton");
const selectedExercise = training.currentExercise;
const selectedRows = computed<TrainingRow[]>(() =>
  (selectedExercise.value?.sets ?? []).flatMap((set) => {
    const row = training.rows.get(set.id);
    return row ? [row] : [];
  }),
);
const definition = computed(() => selectedExercise.value
  ? snapshot.value?.exercises[selectedExercise.value.exerciseId]
  : undefined);
const prescription = computed(() => {
  const sets = selectedExercise.value?.sets ?? [];
  const targets = new Set(sets.map(setTargetReps));
  return targets.size === 1 ? `${sets.length} × ${[...targets][0]} reps` : `${sets.length} sets · varied reps`;
});
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
    configId.value = null;
    editorSet.value = null;
  },
);
const isComplete = (exercise: SessionExercise) =>
  exercise.sets.every((set) => set.completed);
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
  emit("pick");
}
function configure(id: string) {
  configId.value = id;
}
function edit(id: string) {
  training.selectSet(id);
  editorSet.value = id;
}
async function closeEditor() {
  const id = editorSet.value;
  editorSet.value = null;
  await nextTick();
  const row = setRows.value?.find((item) => item.setId === id);
  if (row) {
    row.focus();
    return;
  }
  focusExercise();
}
async function commit(id: string) {
  await training.commit(id);
  await nextTick();
  setRows.value?.find((row) => row.setId === id)?.focusLog();
}
watch(
  () => editorSet.value ? training.rows.get(editorSet.value) : undefined,
  (row) => {
    if (editorSet.value && !row) void closeEditor();
  },
);
function focusExercise() {
  const element = optionsButton.value?.$el ?? addButton.value?.$el;
  if (element instanceof HTMLElement) element.focus({ preventScroll: true });
}
watch(() => selectedExercise.value?.id, async (_value, previous) => {
  if (previous && !active.value?.exercises.some((exercise) => exercise.id === previous)) {
    await nextTick();
    focusExercise();
  }
});
function remove(exercise: SessionExercise) {
  configId.value = null;
  if (!active.value) return;
  emit("confirm", {
    title: "Remove exercise?",
    description: `Remove ${exercise.name}, including ${exercise.sets.filter((set) => set.completed).length} logged sets and any unsaved input for this exercise? Completed history stays unchanged.`,
    command: {
      type: "remove-exercise",
      sessionId: active.value.id,
      exerciseId: exercise.id,
    },
  });
}
async function editFromOptions(id: string) {
  configId.value = null;
  await nextTick();
  edit(id);
}
async function addFromOptions() {
  configId.value = null;
  await nextTick();
  pick();
}
async function focusReplacement(id: string) {
  training.selectExercise(id);
  await nextTick();
  focusExercise();
}
watch(configuration, (value) => {
  if (configId.value && !value) {
    configId.value = null;
    training.notice.value = "This exercise is no longer in the workout.";
  }
});
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
  <section v-if="active" class="active-workout">
    <a class="training-back text-button" :href="workoutsHref"
      >Back to workouts</a
    >
    <header class="active-workout-heading">
      <div>
        <p class="eyebrow">ACTIVE WORKOUT · {{ elapsed }}</p>
        <h1>
          <BaseInput
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
      <BaseButton
        variant="secondary"
        :disabled="saving || !activeTotals.completedSets"
        @click="emit('finish')"
        >Finish</BaseButton
      >
    </header>
    <div class="active-workout-metrics">
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
        class="active-workout-progress"
        :value="activeTotals.completedSets"
        :max="activeSetCount"
        aria-label="Logged sets"
      />
    </div>
    <div class="active-workout-layout">
      <div class="active-workout-content">
        <nav v-if="active.exercises.length" class="workout-exercise-strip" aria-label="Workout exercises">
          <BaseButton
            v-for="exercise in active.exercises" :key="exercise.id" unstyled
            class="workout-exercise-tab"
            :aria-pressed="selectedExercise?.id === exercise.id"
            :aria-label="`${exercise.name}${isComplete(exercise) ? ', all sets logged' : ''}`"
            @click="training.selectExercise(exercise.id)"
          >
            <ExerciseThumbnail :exercise="snapshot?.exercises[exercise.exerciseId]" />
            <span class="workout-exercise-tab-name">{{ exercise.name }}</span>
            <Check v-if="isComplete(exercise)" class="workout-exercise-tab-check" :size="15" />
          </BaseButton>
          <BaseButton unstyled class="workout-exercise-tab workout-exercise-tab-add" :disabled="saving || active.exercises.length >= 50" aria-label="Add exercises" @click="pick"><span><Plus :size="24" /></span><span class="workout-exercise-tab-name">Add</span></BaseButton>
        </nav>
        <div v-if="!active.exercises.length" class="workout-empty">
          <Dumbbell :size="28" />
          <h2>Make it your workout.</h2>
          <p>Add an exercise, then choose its sets, reps and weight.</p>
        </div>
        <article v-if="selectedExercise" class="workout-selected-exercise">
          <header>
            <h2>{{ selectedExercise.name }}</h2>
            <BaseButtonIcon ref="optionsButton" :label="`Options for ${selectedExercise.name}`" :disabled="saving" @click="configure(selectedExercise.id)"><Ellipsis :size="22" /></BaseButtonIcon>
          </header>
          <BaseButton unstyled class="workout-prescription" :disabled="saving" :aria-label="`Edit sets, reps and weight for ${selectedExercise.name}`" @click="configure(selectedExercise.id)">
            <span v-if="definition">{{ definition.equipment }}<span aria-hidden="true"> · </span></span>{{ prescription }}
          </BaseButton>
          <p v-if="selectedExercise.note" class="workout-exercise-note">{{ selectedExercise.note }}</p>
          <div v-if="!editorSet" class="workout-inline-sets">
            <div class="set-labels" aria-hidden="true"><span>Set</span><span>kg</span><span>Reps</span><span>Log</span><span></span></div>
            <SetRow v-for="row in selectedRows" :key="row.set.id" ref="setRows" :row="row" :busy="saving" :current="training.current.value?.set.id === row.set.id" :dirty="training.dirty(row)" :conflict="training.conflict(row)"
              @edit="training.edit(row.set.id, $event)" @commit="commit(row.set.id)" @select="training.selectSet(row.set.id)" @options="edit(row.set.id)" @discard="training.useSaved(row.set.id)" @keep="training.keepInput(row.set.id)" @recover="training.chooseDraft(row.set.id, $event)" />
          </div>
          <p v-if="isComplete(selectedExercise)" class="workout-exercise-complete"><Check :size="16" /> All {{ selectedExercise.sets.length }} sets logged</p>
        </article>
    <p v-if="training.notice.value" class="workout-guidance" role="status">{{ training.notice.value }}</p>
        <div v-if="allDone" class="workout-done">
          <p class="eyebrow">ALL SETS LOGGED</p>
          <h2>That’s your last set.</h2>
          <p>Review your sets, or add another exercise.</p>
          <BaseButton :disabled="saving" @click="emit('finish')"
            >Finish workout</BaseButton
          >
        </div>
        <BaseButton
          v-if="!active.exercises.length"
          ref="addButton"
          class="workout-add"
          variant="secondary"
          :disabled="saving || active.exercises.length >= 50"
          @click="pick"
          ><Plus :size="18" />Add exercises</BaseButton
        >
        <BaseButton variant="ghost" :disabled="saving" @click="discard"
          >Discard workout</BaseButton
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
        ><BaseButton
          v-if="active.rest"
          variant="secondary"
          :disabled="saving"
          @click="run({ type: 'stop-rest', sessionId: active.id })"
          >{{ rest ? "Skip rest" : "Dismiss timer" }}</BaseButton
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
      @edit="editFromOptions"
      @add="addFromOptions"
      @replaced="focusReplacement"
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
    <BaseButton @click="emit('navigate', 'workouts')"
      >Choose a workout</BaseButton
    >
  </div>
</template>
