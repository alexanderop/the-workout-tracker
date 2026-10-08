<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from "vue";
import { BaseSheet, BaseButton } from "@form/ui";
import CompletedWorkoutEditor from "./CompletedWorkoutEditor.vue";
import WorkoutNameRecovery from "./WorkoutNameRecovery.vue";
import DetachedInputNotice from "./DetachedInputNotice.vue";
import WorkoutDialogsSetOptions from "./WorkoutDialogsSetOptions.vue";
import WorkoutDialogsTemplates from "./WorkoutDialogsTemplates.vue";
import WorkoutDialogsExercisePicker from "./WorkoutDialogsExercisePicker.vue";
import WorkoutDialogsFinish from "./WorkoutDialogsFinish.vue";
import WorkoutDialogsCompletedDetail from "./WorkoutDialogsCompletedDetail.vue";
import {
  routineFromSession,
  type CompletedSession,
  type Routine,
} from "../domain";
import type { WorkoutWorkspace, WorkoutPage } from "./useWorkoutWorkspace";
import type { Confirmation } from "./dialogTypes";

/** Hosts every workout sheet and routes requests between them. */
const { workspace, templatesOpen = false } = defineProps<{
  templatesOpen?: boolean;
  workspace: Pick<
    WorkoutWorkspace,
    | "snapshot"
    | "saving"
    | "error"
    | "notify"
    | "clearError"
    | "run"
    | "training"
    | "active"
    | "catalog"
    | "workoutName"
    | "activeTotals"
    | "elapsed"
  >;
}>();
const { snapshot, saving, error, notify, clearError, run, training, active } =
  workspace;
const emit = defineEmits<{
  navigate: [page: WorkoutPage];
  "template-saved": [];
  "close-templates": [];
  "template-closed": [event: Event];
}>();
const navigate = (page: WorkoutPage) => emit("navigate", page);
const templates =
  useTemplateRef<InstanceType<typeof WorkoutDialogsTemplates>>("templates");
const picker =
  useTemplateRef<InstanceType<typeof WorkoutDialogsExercisePicker>>("picker");

const optionSetId = ref<string | null>(null);
const optionRow = computed(() =>
  optionSetId.value ? training.rows.get(optionSetId.value) : undefined,
);
watch(optionRow, (row) => {
  if (optionSetId.value && !row) optionSetId.value = null;
});
function removeOptionSet() {
  const row = optionRow.value;
  if (!row || !active.value) return;
  optionSetId.value = null;
  clearError();
  confirmation.value = {
    title: "Remove set?",
    description: "This removes the set and its draft from your active workout.",
    actionLabel: "Remove set",
    command: {
      type: "remove-set",
      sessionId: active.value.id,
      exerciseId: row.exercise.id,
      setId: row.set.id,
    },
  };
}
function adjustReps(amount: number) {
  const row = optionRow.value;
  if (!row) return;
  const value = Number(row.reps);
  if (Number.isInteger(value) && value + amount >= 0 && value + amount <= 1000)
    training.edit(row.set.id, { reps: String(value + amount) });
}

const selectedSession = ref<string | null>(null);
const detail = computed(() =>
  selectedSession.value
    ? snapshot.value?.completed[selectedSession.value]
    : undefined,
);
const editingCompleted = ref<CompletedSession | null>(null);
const completedEditor =
  useTemplateRef<InstanceType<typeof CompletedWorkoutEditor>>(
    "completedEditor",
  );
function showDetail(id: string) {
  if (editingCompleted.value) {
    completedEditor.value?.requestClose();
    return;
  }
  selectedSession.value = id;
}
async function requestLeave() {
  if (!completedEditor.value) return true;
  const allowed = await completedEditor.value.requestLeave();
  if (allowed) selectedSession.value = null;
  return allowed;
}
function completedSaved() {
  editingCompleted.value = null;
  notify("Workout corrections saved");
}

const finishSessionId = ref<string | null>(null);
watch(
  () => active.value?.id,
  (id) => {
    if (finishSessionId.value !== id) finishSessionId.value = null;
  },
  { flush: "sync" },
);
const reviewSetId = ref<string | null>(null);
function reviewSets() {
  const row = training.pending.value[0];
  if (!row || saving.value) return;
  training.selectSet(row.set.id);
  reviewSetId.value = row.set.id;
  finishSessionId.value = null;
}
function finishClosed(event: Event) {
  const id = reviewSetId.value;
  if (!id) return;
  event.preventDefault();
  reviewSetId.value = null;
  training.requestReviewFocus(id);
}
async function finishWorkout() {
  const id = finishSessionId.value;
  if (!id || active.value?.id !== id) {
    finishSessionId.value = null;
    return;
  }
  if (workspace.workoutName.dirty.value) return;
  if (await training.run({ type: "finish", sessionId: id })) {
    finishSessionId.value = null;
    navigate("workouts");
    selectedSession.value = id;
    notify("Workout saved. Another session in the books.");
  }
}

const confirmation = ref<Confirmation | null>(null);
async function confirmAction() {
  if (!confirmation.value) return;
  const command = confirmation.value.command;
  if (await training.run(command)) {
    confirmation.value = null;
    if (command.type === "discard") navigate("workouts");
  }
}

async function startWorkout(routineId: string | null) {
  if (active.value) {
    navigate("session");
    return;
  }
  if (routineId === null) {
    picker.value?.openStart();
    return;
  }
  const saved = await run({ type: "start", routineId });
  if (saved?.active) navigate("session");
}
async function repeatWorkout(id: string) {
  if (await run({ type: "repeat", completedId: id })) {
    selectedSession.value = null;
    navigate("session");
  }
}
function convertWorkout(id: string) {
  const session = snapshot.value?.completed[id];
  if (!session) return;
  selectedSession.value = null;
  templates.value?.editRoutine(routineFromSession(session, session.id), session);
}
defineExpose({
  requestLeave,
  startWorkout,
  editRoutine: (routine: Routine | null) =>
    templates.value?.editRoutine(routine),
  showDetail,
  openPicker: () => picker.value?.openAdd(),
  repeatWorkout,
  convertWorkout,
  openCreateExercise: () => picker.value?.openCreate(),
  openFinish: () => {
    if (!active.value || workspace.workoutName.dirty.value) return;
    finishSessionId.value = active.value.id;
  },
  showOptions: (id: string) => {
    optionSetId.value = id;
  },
  confirm: (request: Confirmation) => {
    clearError();
    confirmation.value = request;
  },
});
</script>

<template>
  <WorkoutNameRecovery :controller="workspace.workoutName" />
  <DetachedInputNotice
    :entries="training.detached.value"
    :dismiss="training.dismissDetached"
  />
  <WorkoutDialogsSetOptions
    :row="optionRow"
    :saving="saving"
    @close="optionSetId = null"
    @undo="training.undoSet"
    @adjust="adjustReps"
    @remove="removeOptionSet"
  />
  <WorkoutDialogsTemplates
    ref="templates"
    :open="templatesOpen"
    :workspace="workspace"
    @start="startWorkout"
    @template-saved="emit('template-saved')"
    @close-templates="emit('close-templates')"
    @template-closed="emit('template-closed', $event)"
  />
  <WorkoutDialogsExercisePicker
    ref="picker"
    :workspace="workspace"
    @started="navigate('session')"
  />
  <WorkoutDialogsFinish
    :open="finishSessionId !== null"
    :totals="workspace.activeTotals.value"
    :elapsed="workspace.elapsed.value"
    :pending="training.pending.value"
    :saving="saving"
    :error="error"
    @close="finishSessionId = null"
    @close-auto-focus="finishClosed"
    @apply="training.saveEdits()"
    @review="reviewSets"
    @finish="finishWorkout"
  />
  <BaseSheet
    :open="confirmation !== null"
    :title="confirmation?.title ?? 'Confirm'"
    :description="confirmation?.description"
    @close="!saving && (confirmation = null)"
  >
    <p v-if="error" class="field-error" role="alert">{{ error }}</p>
    <div class="form-actions">
      <BaseButton
        unstyled
        class="btn secondary"
        :disabled="saving"
        @click="confirmation = null"
      >
        Cancel</BaseButton
      ><BaseButton
        unstyled
        class="btn primary"
        :disabled="saving"
        @click="confirmAction"
      >
        {{ confirmation?.actionLabel }}
      </BaseButton>
    </div></BaseSheet
  >
  <WorkoutDialogsCompletedDetail
    :detail="detail"
    :open="!!detail && !editingCompleted"
    :saving="saving"
    :active="!!active"
    @close="selectedSession = null"
    @edit="editingCompleted = $event"
    @repeat="repeatWorkout"
    @convert="convertWorkout"
  />
  <CompletedWorkoutEditor
    v-if="editingCompleted"
    ref="completedEditor"
    :session="editingCompleted"
    :workspace="workspace"
    @close="editingCompleted = null"
    @saved="completedSaved"
  />
</template>
