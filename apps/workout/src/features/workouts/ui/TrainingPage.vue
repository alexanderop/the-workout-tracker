<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { BaseButton, BaseButtonIcon, BaseInput, BaseSheet } from "@form/ui";
import { Plus, Dumbbell, Clock3, ShieldCheck, Ellipsis, Check, Pencil, ChevronLeft } from "@lucide/vue";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import { setTargetReps, type SessionExercise } from "../domain";
import type { Confirmation } from "./dialogTypes";
import SetRow from "./SetRow.vue";
import ExerciseThumbnail from "./ExerciseThumbnail.vue";
import type { TrainingRow } from "./useTrainingSession";
import ExerciseConfiguration from "./ExerciseConfiguration.vue";
import TrainingSetEditor from "./TrainingSetEditor.vue";
import { useLeaveConfirmation } from "./useLeaveConfirmation";
import { lastExercisePerformance } from "../domain/exerciseHistory";
import { fmt, longDate, nextSetLabel, restLabel } from "./presentation";
import "./training.css";
const { workspace, workoutsHref } = defineProps<{
  workspace: WorkoutWorkspace;
  workoutsHref: string;
}>();
const emit = defineEmits<{
  finish: [];
  pick: [];
  options: [id: string];
  confirm: [request: Confirmation];
  navigate: [page: "workouts"];
  back: [event: MouseEvent];
}>();
const {
  active,
  snapshot,
  saving,
  activeTotals,
  activeSetCount,
  elapsed,
  training,
  run,
  trainingMode,
  canFinish,
} = workspace;
const { text: name, issue: nameIssue, dirty: nameDirty, conflict: nameConflict, save: rename, keepMine, useSaved } = workspace.workoutName;
const renameOpen = ref(false);
async function closeRename() {
  if (saving.value) return;
  if (await requestNameDiscard()) renameOpen.value = false;
}
async function saveName() {
  await rename();
  if (!nameDirty.value) renameOpen.value = false;
}
async function keepName() {
  await keepMine();
  if (!nameDirty.value) renameOpen.value = false;
}
function adoptName() {
  useSaved();
  renameOpen.value = false;
}
const configurationEditor = useTemplateRef<InstanceType<typeof ExerciseConfiguration>>("configurationEditor");
const nameLeave = useLeaveConfirmation();
const nameDismiss = nameLeave.open;
function settleNameLeave(leave: boolean) {
  if (leave) useSaved();
  nameLeave.settle(leave);
}
async function requestLeave(): Promise<boolean> {
  if (saving.value) return false;
  if (!await (configurationEditor.value?.requestLeave() ?? true)) return false;
  return requestNameDiscard();
}
function requestNameDiscard(): Promise<boolean> {
  if (!nameDirty.value) return Promise.resolve(true);
  return nameLeave.request();
}
defineExpose({ requestLeave });

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
const lastTime = computed(() => {
  const exercise = selectedExercise.value;
  return exercise ? lastExercisePerformance(snapshot.value?.completed ?? {}, exercise.exerciseId) : null;
});
const prescription = computed(() => {
  const sets = selectedExercise.value?.sets ?? [];
  const targets = new Set(sets.map(setTargetReps));
  return targets.size === 1 ? `${sets.length} × ${[...targets][0]} reps` : `${sets.length} sets · varied reps`;
});
watch(
  () => active.value?.id,
  () => {
    settleNameLeave(false);
    configId.value = null;
    editorSet.value = null;
    renameOpen.value = false;
  },
);
const isComplete = (exercise: SessionExercise) =>
  exercise.sets.every((set) => set.completed);
const allDone = computed(() => !!activeSetCount.value && !training.next.value);
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
watch(training.reviewFocus, async (request) => {
  if (!request) return;
  await nextTick();
  const row = setRows.value?.find((item) => item.setId === request.setId);
  row?.scrollIntoView();
  row?.focus();
});
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
    actionLabel: "Remove exercise",
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
    training.announce("This exercise is no longer in the workout.");
  }
});
function discard() {
  if (!active.value) return;
  emit("confirm", {
    title: "Discard this workout?",
    description:
      "This deletes the active workout and its logged sets. Completed history stays saved.",
    actionLabel: "Discard workout",
    command: { type: "discard", sessionId: active.value.id },
  });
}
</script>
<template>
  <section v-if="active" class="active-workout">
    <a class="training-back text-button" :href="workoutsHref" aria-label="Back to workouts" @click="emit('back', $event)"
      ><ChevronLeft :size="20" aria-hidden="true" /><span class="training-back-label">Workouts</span></a
    >
    <header class="active-workout-heading">
      <div>
        <p class="eyebrow">ACTIVE WORKOUT · {{ elapsed }}</p>
        <div class="workout-title">
          <h1>{{ active.name }}</h1>
          <BaseButtonIcon label="Rename workout" :disabled="saving" @click="renameOpen = true"><Pencil :size="16" /></BaseButtonIcon>
        </div>
      </div>
      <BaseButton
        variant="secondary"
        class="active-workout-finish"
        :disabled="!canFinish"
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
            :aria-current="selectedExercise?.id === exercise.id ? 'true' : undefined"
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
          <BaseButton unstyled class="workout-prescription" :disabled="saving" @click="configure(selectedExercise.id)">
            <span v-if="definition">{{ definition.equipment }} · </span>{{ prescription }}<span class="sr-only">, edit sets, reps and weight for {{ selectedExercise.name }}</span>
          </BaseButton>
          <p v-if="selectedExercise.note" class="workout-exercise-note">{{ selectedExercise.note }}</p>
          <div v-if="!editorSet" class="workout-inline-sets">
            <div class="set-labels" aria-hidden="true"><span>Set</span><span>kg</span><span>Reps</span><span>Log</span><span></span></div>
            <SetRow v-for="row in selectedRows" :key="row.set.id" ref="setRows" :row="row" :busy="saving" :current="training.current.value?.set.id === row.set.id" :dirty="training.dirty(row)" :conflict="training.conflict(row)"
              @edit="training.edit(row.set.id, $event)" @commit="commit(row.set.id)" @select="training.selectSet(row.set.id)" @options="edit(row.set.id)" @discard="training.useSaved(row.set.id)" @keep="training.keepInput(row.set.id)" @recover="training.chooseDraft(row.set.id, $event)" />
            <BaseButton variant="secondary" class="workout-add-set" :disabled="saving || selectedExercise.sets.length >= 30" @click="training.addSet(selectedExercise.id)"><Plus :size="18" />Add set</BaseButton>
          </div>
          <section v-if="lastTime" class="workout-last-time" aria-label="Last time">
            <header><h3>Last time</h3><span>{{ longDate(lastTime.finishedAt) }}</span></header>
            <p v-for="(set, index) in lastTime.sets" :key="set.id"><span>Set {{ index + 1 }}</span><strong>{{ fmt(set.weightKg) }} kg × {{ set.reps }} reps</strong></p>
          </section>
          <p v-if="isComplete(selectedExercise)" class="workout-exercise-complete"><Check :size="16" /> {{ selectedExercise.sets.length === 1 ? "Set logged" : `All ${selectedExercise.sets.length} sets logged` }}</p>
        </article>
    <p v-if="training.notice.value" class="workout-guidance" role="status">{{ training.notice.value }}</p>
        <div v-if="allDone" class="workout-done">
          <p class="eyebrow">ALL SETS LOGGED</p>
          <h2>That’s your last set.</h2>
          <p>Review your sets, or add another exercise.</p>
          <BaseButton :disabled="!canFinish" @click="emit('finish')">Finish workout</BaseButton>
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
        <BaseButton variant="ghost" class="workout-discard" :disabled="saving" @click="discard"
          >Discard workout</BaseButton
        >
      </div>
      <aside class="workout-rest-panel">
        <Clock3 :size="20" /><strong>{{
          trainingMode?.kind === "resting"
            ? restLabel(trainingMode.remaining)
            : "Ready when you are"
        }}</strong>
        <p>{{ nextSetLabel(training.next.value) }}</p>
        <small>{{
          snapshot?.settings.autoRest
            ? "Your configured rest starts after logging."
            : "Automatic rest is turned off."
        }}</small
        ><BaseButton
          v-if="trainingMode?.kind === 'resting'"
          variant="secondary"
          :disabled="saving"
          @click="run({ type: 'stop-rest', sessionId: active.id })"
          >{{ trainingMode.remaining ? "Skip rest" : "Dismiss timer" }}</BaseButton
        >
        <p class="saved-indicator">
          <ShieldCheck :size="14" />{{
            saving ? "Saving…" : "Saved on this device"
          }}
        </p>
      </aside>
    </div>
    <ExerciseConfiguration
      ref="configurationEditor"
      :exercise="configuration"
      :workspace="workspace"
      @close="configId = null"
      @remove="remove"
      @edit="editFromOptions"
      @add="addFromOptions"
      @replaced="focusReplacement"
    />
    <BaseSheet :open="renameOpen" title="Rename workout" @close="closeRename">
        <label class="field"><span>Workout name</span>
          <BaseInput
            v-model="name"
            aria-label="Workout name"
            maxlength="80"
            :disabled="saving"
            @keydown.enter.prevent="saveName"
          />
        </label>
        <div v-if="nameDirty" class="form-actions">
          <template v-if="nameConflict">
            <p role="status">The saved workout name changed. Keep your name or use “{{ active.name }}”.</p>
            <BaseButton :disabled="saving" @click="keepName">Keep my name</BaseButton>
            <BaseButton variant="secondary" :disabled="saving" @click="adoptName">Use saved name</BaseButton>
          </template>
          <template v-else>
            <BaseButton :disabled="saving" @click="saveName">Save name</BaseButton>
            <BaseButton variant="ghost" :disabled="saving" @click="closeRename">Cancel name edit</BaseButton>
          </template>
        </div>
        <p v-if="nameDirty" class="muted small">Save or cancel your name change before finishing.</p>
        <p v-if="nameIssue" class="field-error" role="alert">{{ nameIssue }}</p>
    </BaseSheet>
    <BaseSheet :open="nameDismiss" title="Discard unsaved name?" description="Your saved workout name stays unchanged." @close="settleNameLeave(false)">
      <div class="form-actions">
        <BaseButton variant="secondary" @click="settleNameLeave(false)">Keep editing</BaseButton>
        <BaseButton @click="settleNameLeave(true)">Discard name change</BaseButton>
      </div>
    </BaseSheet>
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
    <BaseButton @click="emit('navigate', 'workouts')">Choose a workout</BaseButton>
  </div>
</template>
