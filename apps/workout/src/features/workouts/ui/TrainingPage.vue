<script setup lang="ts">
import {
  computed,
  nextTick,
  onScopeDispose,
  ref,
  useTemplateRef,
  watch,
} from "vue";
import {
  BaseBackLink,
  BaseButton,
  BaseButtonIcon,
  BaseEmptyState,
  BaseNotice,
} from "@form/ui";
import { Plus, Dumbbell, Ellipsis } from "@lucide/vue";
import { useTranslation } from "../../../i18n";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import {
  barbellSettings,
  setTargetReps,
  type Barbell,
  type SessionExercise,
} from "../domain";
import type { Confirmation } from "./dialogTypes";
import SetRow from "./SetRow.vue";
import TrainingHeader from "./TrainingHeader.vue";
import TrainingExerciseStrip from "./TrainingExerciseStrip.vue";
import type { TrainingRow } from "./useTrainingSession";
import ExerciseConfiguration from "./ExerciseConfiguration.vue";
import TrainingLastTime from "./TrainingLastTime.vue";
import TrainingSetEditor from "./TrainingSetEditor.vue";
import TrainingRenameSheets from "./TrainingRenameSheets.vue";
import TrainingRestPanel from "./TrainingRestPanel.vue";
import TrainingReloadSheet from "./TrainingReloadSheet.vue";
import { equipmentLabel } from "./exerciseLabels";
import {
  discardWorkoutConfirmation,
  removeExerciseConfirmation,
} from "./trainingConfirmations";
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
const { active, snapshot, saving, activeSetCount, training, canFinish } =
  workspace;
const { t } = useTranslation();
const renameOpen = ref(false);
const renameSheets =
  useTemplateRef<InstanceType<typeof TrainingRenameSheets>>("renameSheets");
const configurationEditor = useTemplateRef<
  InstanceType<typeof ExerciseConfiguration>
>("configurationEditor");
async function requestLeave(): Promise<boolean> {
  if (saving.value) return false;
  if (!(await (configurationEditor.value?.requestLeave() ?? true)))
    return false;
  return (await renameSheets.value?.requestDiscard()) ?? true;
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
const optionsButton =
  useTemplateRef<InstanceType<typeof BaseButtonIcon>>("optionsButton");
const addButton = useTemplateRef<InstanceType<typeof BaseButton>>("addButton");
const selectedExercise = training.currentExercise;
const selectedRows = computed<TrainingRow[]>(() =>
  (selectedExercise.value?.sets ?? []).flatMap((set) => {
    const row = training.rows.get(set.id);
    return row ? [row] : [];
  }),
);
const definition = computed(() =>
  selectedExercise.value
    ? snapshot.value?.exercises[selectedExercise.value.exerciseId]
    : undefined,
);
// Barbell exercises show which plates make up the weight being entered.
function barbellFor(exerciseId: string): Barbell | null {
  const current = snapshot.value;
  if (!current || current.exercises[exerciseId]?.equipment !== "Barbell")
    return null;
  return barbellSettings(current.settings);
}
const prescription = computed(() => {
  const sets = selectedExercise.value?.sets ?? [];
  const targets = new Set(sets.map(setTargetReps));
  const [only] = targets;
  return targets.size === 1
    ? t("training.page.prescriptionTarget", { sets: sets.length }, only ?? 0)
    : t("training.page.prescriptionVaried", { sets: sets.length });
});
watch(
  () => active.value?.id,
  () => {
    configId.value = null;
    editorSet.value = null;
    renameOpen.value = false;
  },
);
// The training notice is a toast above the dock, so it never moves the set rows
// or Discard workout. Like the footer save line it ends after eight seconds.
const NOTICE_MS = 8000;
let noticeTimer: ReturnType<typeof setTimeout> | undefined;
watch(training.notice, (text) => {
  clearTimeout(noticeTimer);
  if (text) noticeTimer = setTimeout(() => training.announce(""), NOTICE_MS);
});
onScopeDispose(() => clearTimeout(noticeTimer));
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
// Logging the last open set offers to finish; Keep training returns here to
// add sets or exercises.
async function commit(id: string) {
  const wasDone = allDone.value;
  await training.commit(id);
  if (!wasDone && allDone.value && canFinish.value) {
    emit("finish");
    return;
  }
  await nextTick();
  setRows.value?.find((row) => row.setId === id)?.focusLog();
}
watch(
  () => (editorSet.value ? training.rows.get(editorSet.value) : undefined),
  (row) => {
    if (editorSet.value && !row) void closeEditor();
  },
);
function focusExercise() {
  const element = optionsButton.value?.$el ?? addButton.value?.$el;
  if (element instanceof HTMLElement) element.focus({ preventScroll: true });
}
watch(
  () => selectedExercise.value?.id,
  async (_value, previous) => {
    if (
      previous &&
      !active.value?.exercises.some((exercise) => exercise.id === previous)
    ) {
      await nextTick();
      focusExercise();
    }
  },
);
function remove(exercise: SessionExercise) {
  configId.value = null;
  if (active.value)
    emit("confirm", removeExerciseConfirmation(t, active.value.id, exercise));
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
    training.announce(t("training.page.exerciseGone"));
  }
});
function discard() {
  if (active.value)
    emit("confirm", discardWorkoutConfirmation(t, active.value.id));
}
</script>
<template>
  <section v-if="active" class="active-workout">
    <TrainingHeader
      :workspace="workspace"
      @finish="emit('finish')"
      @rename="renameOpen = true"
    >
      <template #back>
        <BaseBackLink
          :href="workoutsHref"
          :aria-label="t('training.page.backLabel')"
          @click="emit('back', $event)"
          >{{ t("training.page.backShort") }}</BaseBackLink
        >
      </template>
    </TrainingHeader>
    <div class="active-workout-layout">
      <div class="active-workout-content">
        <TrainingExerciseStrip :workspace="workspace" @pick="pick" />
        <BaseEmptyState
          v-if="!active.exercises.length"
          :title="t('training.page.emptyTitle')"
          :body="t('training.page.emptyText')"
        >
          <template #icon><Dumbbell :size="28" /></template>
          <template #action
            ><BaseButton
              ref="addButton"
              :disabled="saving || active.exercises.length >= 50"
              @click="pick"
              ><Plus :size="18" />{{
                t("training.page.addExercises")
              }}</BaseButton
            ></template
          >
        </BaseEmptyState>
        <article v-if="selectedExercise" class="workout-selected-exercise">
          <header>
            <h2>{{ selectedExercise.name }}</h2>
            <BaseButtonIcon
              ref="optionsButton"
              :label="
                t('training.page.optionsFor', {
                  exercise: selectedExercise.name,
                })
              "
              :disabled="saving"
              @click="configure(selectedExercise.id)"
              ><Ellipsis :size="22"
            /></BaseButtonIcon>
          </header>
          <BaseButton
            variant="ghost"
            size="row"
            class="workout-prescription"
            :disabled="saving"
            @click="configure(selectedExercise.id)"
          >
            <span v-if="definition"
              >{{ equipmentLabel(definition.equipment, t) }} · </span
            >{{ prescription
            }}<span class="sr-only">{{
              t("training.page.editPrescription", {
                exercise: selectedExercise.name,
              })
            }}</span>
          </BaseButton>
          <p v-if="selectedExercise.note" class="workout-exercise-note">
            {{ selectedExercise.note }}
          </p>
          <div v-if="!editorSet" class="workout-inline-sets">
            <div class="set-labels" aria-hidden="true">
              <span>{{ t("training.page.columnSet") }}</span
              ><span>{{ t("training.page.columnKg") }}</span
              ><span>{{ t("training.page.columnReps") }}</span
              ><span>{{ t("training.page.columnLog") }}</span
              ><span></span>
            </div>
            <SetRow
              v-for="row in selectedRows"
              :key="row.set.id"
              ref="setRows"
              :row="row"
              :barbell="barbellFor(row.exercise.exerciseId)"
              :busy="saving"
              :current="training.current.value?.set.id === row.set.id"
              :suggestion="training.suggestion(row)"
              :dirty="training.dirty(row)"
              :conflict="training.conflict(row)"
              @edit="training.edit(row.set.id, $event)"
              @commit="commit(row.set.id)"
              @select="training.selectSet(row.set.id)"
              @options="edit(row.set.id)"
              @discard="training.useSaved(row.set.id)"
              @keep="training.keepInput(row.set.id)"
              @recover="training.chooseDraft(row.set.id, $event)"
            />
            <BaseButton
              variant="secondary"
              class="workout-add-set"
              :disabled="saving || selectedExercise.sets.length >= 30"
              @click="training.addSet(selectedExercise.id)"
              ><Plus :size="18" />{{ t("training.page.addSet") }}</BaseButton
            >
          </div>
          <TrainingLastTime
            :exercise-id="selectedExercise.exerciseId"
            :completed="snapshot?.completed ?? {}"
          />
        </article>
        <div class="workout-feedback">
          <BaseNotice v-if="training.notice.value">{{
            training.notice.value
          }}</BaseNotice>
        </div>
        <div v-if="allDone" class="workout-done">
          <p class="eyebrow">{{ t("training.page.allLoggedEyebrow") }}</p>
          <h2>{{ t("training.page.allLoggedTitle") }}</h2>
          <p>{{ t("training.page.allLoggedText") }}</p>
          <BaseButton :disabled="!canFinish" @click="emit('finish')">{{
            t("training.page.finishWorkout")
          }}</BaseButton>
        </div>
        <BaseButton
          variant="ghost"
          class="workout-discard"
          :disabled="saving"
          @click="discard"
          >{{ t("training.page.discardWorkout") }}</BaseButton
        >
      </div>
      <TrainingRestPanel :workspace="workspace" />
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
    <TrainingRenameSheets
      ref="renameSheets"
      v-model:open="renameOpen"
      :workspace="workspace"
    />
    <TrainingReloadSheet v-model:open="training.reloadRequired.value" />
    <TrainingSetEditor
      :set-id="editorSet"
      :training="training"
      :barbell-for="barbellFor"
      :busy="saving"
      @close="closeEditor"
      @cleared="closeEditor"
      @select="edit"
      @options="emit('options', $event)"
    />
  </section>
  <BaseEmptyState
    v-else
    :title="t('training.page.readyTitle')"
    :heading-level="1"
  >
    <template #icon><Dumbbell :size="32" /></template>
    <template #action
      ><BaseButton @click="emit('navigate', 'workouts')">{{
        t("training.page.chooseWorkout")
      }}</BaseButton></template
    >
  </BaseEmptyState>
</template>
