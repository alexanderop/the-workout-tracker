<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { BaseButton, BaseInputNumber, BaseSheet, BaseTextarea } from "@form/ui";
import { setTargetReps, type Command, type SessionExercise } from "../domain";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import { useFormat, useTranslation } from "../../../i18n";
import ExerciseConfigurationActions from "./ExerciseConfigurationActions.vue";
import ExerciseConfigurationReplace from "./ExerciseConfigurationReplace.vue";
import { useUnsavedChangesWarning } from "./useUnsavedChangesWarning";
import { useLeaveConfirmation } from "./useLeaveConfirmation";
const { exercise, workspace } = defineProps<{
  exercise: SessionExercise | null;
  workspace: Pick<
    WorkoutWorkspace,
    "active" | "snapshot" | "saving" | "training" | "error"
  >;
}>();
const emit = defineEmits<{
  close: [];
  remove: [exercise: SessionExercise];
  edit: [setId: string];
  add: [];
  replaced: [exerciseId: string];
}>();
const { t } = useTranslation();
const format = useFormat();
type View = "actions" | "configure" | "note" | "replace";
const view = ref<View>("actions");
const count = ref("1"),
  reps = ref("8"),
  weight = ref("0");
const replaceTargets = ref(false),
  note = ref(""),
  selection = ref<string[]>([]);
const issue = ref("");
const exitConfirmation = useLeaveConfirmation();
const dismiss = exitConfirmation.open;
const savePending = ref(false);
const removalOpen = ref(false);
const body = useTemplateRef<HTMLElement>("body");
let revision = 0;
const baseline = ref("");
let replacementFocusId: string | null = null;
const formState = () =>
  JSON.stringify([
    count.value,
    reps.value,
    weight.value,
    replaceTargets.value,
    note.value,
  ]);
const dirty = computed(
  () =>
    !!exercise &&
    (view.value === "note" || view.value === "configure") &&
    formState() !== baseline.value,
);
useUnsavedChangesWarning(() => dirty.value);
const minimum = computed(() =>
  Math.max(1, exercise?.sets.filter((set) => set.completed).length ?? 1),
);
const remaining = computed(
  () => exercise?.sets.filter((set) => !set.completed) ?? [],
);
const logged = computed(
  () => exercise?.sets.filter((set) => set.completed).length ?? 0,
);
const targets = computed(() =>
  remaining.value.length ? remaining.value : (exercise?.sets ?? []),
);
const sameValue = <T,>(values: T[]) =>
  new Set(values).size === 1 ? values[0] : undefined;
const repsSummary = computed(() => {
  const shared = sameValue(targets.value.map(setTargetReps));
  return shared === undefined
    ? t("training.config.mixedReps")
    : t("training.config.reps", { reps: shared });
});
const weightSummary = computed(() => {
  const shared = sameValue(targets.value.map((set) => set.weightKg));
  return shared === undefined
    ? t("training.config.mixedKg")
    : t("training.config.kg", { weight: format.value.number(shared) });
});
const catalog = computed(() =>
  Object.values(workspace.snapshot.value?.exercises ?? {}).filter(
    (item) => item.id !== exercise?.exerciseId,
  ),
);
const replacement = computed(() =>
  catalog.value.find((item) => item.id === selection.value[0]),
);
const canAdd = computed(
  () => (workspace.active.value?.exercises.length ?? 0) < 50,
);
const title = computed(() => {
  const name = exercise?.name ?? t("training.config.fallbackExercise");
  if (view.value === "configure")
    return t("training.config.configureTitle", { exercise: name });
  if (view.value === "note")
    return t("training.config.noteTitle", { exercise: name });
  if (view.value === "replace")
    return t("training.config.replaceTitle", { exercise: name });
  return name;
});
function reset() {
  const first = remaining.value[0] ?? exercise?.sets[0];
  if (!exercise || !first) return;
  count.value = String(exercise.sets.length);
  reps.value = String(setTargetReps(first));
  weight.value = String(first.weightKg);
  replaceTargets.value = false;
  note.value = exercise.note ?? "";
  selection.value = [];
  revision = workspace.snapshot.value?.revision ?? 0;
  issue.value = "";
  exitConfirmation.settle(false);
  removalOpen.value = false;
  baseline.value = formState();
}
watch(
  () => exercise?.id,
  () => {
    settleExit(false);
    view.value = "actions";
    reset();
  },
);
async function show(next: View, field?: "targetReps" | "workingWeight") {
  reset();
  view.value = next;
  if (field) replaceTargets.value = true;
  baseline.value = formState();
  await nextTick();
  const target = field
    ? body.value?.querySelector<HTMLElement>(
        `[aria-label="${t(`training.config.${field}`)}"]`,
      )
    : body.value?.querySelector<HTMLElement>("textarea, button, input");
  target?.focus();
}
function settleExit(discard: boolean) {
  if (discard) {
    baseline.value = formState();
    emit("close");
  }
  exitConfirmation.settle(discard);
}
function requestExit(kind: "close" | "leave"): Promise<boolean> {
  if (workspace.saving.value || savePending.value)
    return Promise.resolve(false);
  if (!dirty.value && !dismiss.value) {
    if (kind === "close") emit("close");
    return Promise.resolve(true);
  }
  return exitConfirmation.request();
}
function close() {
  void requestExit("close");
}
function requestLeave() {
  return requestExit("leave");
}
defineExpose({ requestLeave });
const addedId = (priorIds: ReadonlySet<string>) =>
  workspace.active.value?.exercises.find((item) => !priorIds.has(item.id))?.id;
async function save(
  command: Extract<
    Command,
    { type: "configure-exercise" | "set-exercise-note" | "replace-exercise" }
  >,
) {
  const priorIds = new Set(
    workspace.active.value?.exercises.map((item) => item.id),
  );
  savePending.value = true;
  try {
    if (await workspace.training.editExercise(command, revision)) {
      if (command.type === "replace-exercise")
        replacementFocusId = addedId(priorIds) ?? replacementFocusId;
      baseline.value = formState();
      emit("close");
      return;
    }
    issue.value =
      workspace.error.value ||
      workspace.training.notice.value ||
      t("training.config.saveFailed");
  } finally {
    savePending.value = false;
  }
}
function restoreFocus(event: Event) {
  if (!replacementFocusId) return;
  event.preventDefault();
  const id = replacementFocusId;
  replacementFocusId = null;
  emit("replaced", id);
}
function requestConfiguration() {
  if (exercise && Number(count.value) < exercise.sets.length) {
    removalOpen.value = true;
    return;
  }
  saveConfiguration();
}
function saveConfiguration() {
  removalOpen.value = false;
  if (!exercise || !workspace.active.value) return;
  void save({
    type: "configure-exercise",
    sessionId: workspace.active.value.id,
    exerciseId: exercise.id,
    setCount: Number(count.value),
    ...(replaceTargets.value
      ? { values: { reps: Number(reps.value), weightKg: Number(weight.value) } }
      : {}),
  });
}
function saveNote() {
  if (!exercise || !workspace.active.value) return;
  void save({
    type: "set-exercise-note",
    sessionId: workspace.active.value.id,
    exerciseId: exercise.id,
    note: note.value,
  });
}
function saveReplacement() {
  if (!exercise || !workspace.active.value || !replacement.value) return;
  void save({
    type: "replace-exercise",
    sessionId: workspace.active.value.id,
    exerciseId: exercise.id,
    replacementExerciseId: replacement.value.id,
  });
}
</script>
<template>
  <BaseSheet
    :open="!!exercise || savePending"
    :title="title"
    @close="close"
    @close-auto-focus="restoreFocus"
  >
    <div v-if="exercise" ref="body" class="workout-editor">
      <ExerciseConfigurationActions
        v-if="view === 'actions'"
        :exercise="exercise"
        :saving="workspace.saving.value"
        :can-add="canAdd"
        :reps-summary="repsSummary"
        :weight-summary="weightSummary"
        @configure="show('configure', $event)"
        @note="show('note')"
        @replace="show('replace')"
        @remove="emit('remove', $event)"
        @edit="emit('edit', $event)"
        @add="emit('add')"
      />
      <template v-else-if="view === 'configure'">
        <label class="field"
          ><span>{{ t("training.config.numberOfSets") }}</span>
          <BaseInputNumber
            v-model="count"
            :label="t('training.config.numberOfSets')"
            :title="t('training.config.numberOfSets')"
            :min="minimum"
            :max="30"
            :disabled="workspace.saving.value"
        /></label>
        <label class="workout-config-toggle"
          ><input
            v-model="replaceTargets"
            type="checkbox"
            :disabled="workspace.saving.value"
          />{{ t("training.config.replaceTargets") }}</label
        >
        <template v-if="replaceTargets">
          <BaseInputNumber
            v-model="reps"
            :label="t('training.config.targetReps')"
            :title="t('training.config.targetReps')"
            :min="1"
            :max="1000"
            :disabled="workspace.saving.value"
          />
          <BaseInputNumber
            v-model="weight"
            :label="t('training.config.workingWeight')"
            :title="t('training.config.workingWeight')"
            :unit="t('training.setRow.kg')"
            :min="0"
            :max="1000"
            :decimals="2"
            :preset-step="2.5"
            :disabled="workspace.saving.value"
          />
        </template>
        <p class="muted small">{{ t("training.config.help") }}</p>
        <BaseButton
          :disabled="workspace.saving.value"
          @click="requestConfiguration"
          >{{ t("training.config.saveSettings") }}</BaseButton
        >
      </template>
      <template v-else-if="view === 'note'">
        <label class="field"
          ><span>{{ t("training.config.workoutNote") }}</span
          ><BaseTextarea
            v-model="note"
            :maxlength="2000"
            :rows="5"
            :disabled="workspace.saving.value"
        /></label>
        <p class="muted small">
          {{ t("training.config.noteCounter", { length: note.length }) }}
        </p>
        <BaseButton :disabled="workspace.saving.value" @click="saveNote">{{
          t("training.config.saveNote")
        }}</BaseButton>
      </template>
      <ExerciseConfigurationReplace
        v-else
        :exercise="exercise"
        :remaining="remaining"
        :logged="logged"
        :catalog="catalog"
        :selection="selection"
        :replacement="replacement"
        :busy="workspace.saving.value"
        :can-add="canAdd"
        @toggle="selection = selection.includes($event) ? [] : [$event]"
        @add="emit('add')"
        @save="saveReplacement"
      />
      <p v-if="issue" class="field-error" role="alert">{{ issue }}</p>
      <BaseButton
        v-if="issue"
        variant="secondary"
        :disabled="workspace.saving.value"
        @click="reset"
        >{{ t("training.config.reload") }}</BaseButton
      >
      <BaseButton
        v-if="view !== 'actions' && !dismiss"
        variant="ghost"
        :disabled="workspace.saving.value"
        @click="close"
        >{{ t("training.config.cancel") }}</BaseButton
      >
    </div>
  </BaseSheet>
  <BaseSheet
    :open="dismiss"
    :title="t('training.config.discardTitle')"
    :description="t('training.config.discardDescription')"
    @close="settleExit(false)"
  >
    <div class="form-actions">
      <BaseButton
        variant="secondary"
        :disabled="workspace.saving.value"
        @click="settleExit(false)"
      >
        {{ t("training.config.keepEditing") }}
      </BaseButton>
      <BaseButton :disabled="workspace.saving.value" @click="settleExit(true)">
        {{ t("training.config.discardAction") }}
      </BaseButton>
    </div>
  </BaseSheet>
  <BaseSheet
    :open="removalOpen"
    :title="t('training.config.removeSetsTitle')"
    :description="t('training.config.removeSetsDescription')"
    @close="removalOpen = false"
  >
    <div class="form-actions">
      <BaseButton variant="secondary" @click="removalOpen = false">
        {{ t("training.config.cancel") }}
      </BaseButton>
      <BaseButton :disabled="workspace.saving.value" @click="saveConfiguration">
        {{ t("training.config.removeSets") }}
      </BaseButton>
    </div>
  </BaseSheet>
</template>
