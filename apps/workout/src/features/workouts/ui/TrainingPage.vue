<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { BaseButton, BaseButtonIcon } from "@form/ui";
import { Plus, Dumbbell, Ellipsis, Check, ChevronLeft } from "@lucide/vue";
import { useFormat, useTranslation } from "../../../i18n";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import { setTargetReps, type SessionExercise } from "../domain";
import type { Confirmation } from "./dialogTypes";
import SetRow from "./SetRow.vue";
import TrainingHeader from "./TrainingHeader.vue";
import TrainingExerciseStrip from "./TrainingExerciseStrip.vue";
import { isExerciseComplete } from "./presentation";
import type { TrainingRow } from "./useTrainingSession";
import ExerciseConfiguration from "./ExerciseConfiguration.vue";
import TrainingSetEditor from "./TrainingSetEditor.vue";
import TrainingRenameSheets from "./TrainingRenameSheets.vue";
import TrainingRestPanel from "./TrainingRestPanel.vue";
import { equipmentLabel } from "./exerciseLabels";
import { lastExercisePerformance } from "../domain/exerciseHistory";
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
const format = useFormat();
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
const lastTime = computed(() => {
  const exercise = selectedExercise.value;
  return exercise
    ? lastExercisePerformance(
        snapshot.value?.completed ?? {},
        exercise.exerciseId,
      )
    : null;
});
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
  if (!active.value) return;
  emit("confirm", {
    title: t("training.removeExercise.title"),
    description: t("training.removeExercise.description", {
      exercise: exercise.name,
      logged: exercise.sets.filter((set) => set.completed).length,
    }),
    actionLabel: t("training.removeExercise.action"),
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
    training.announce(t("training.page.exerciseGone"));
  }
});
function discard() {
  if (!active.value) return;
  emit("confirm", {
    title: t("training.discardWorkout.title"),
    description: t("training.discardWorkout.description"),
    actionLabel: t("training.discardWorkout.action"),
    command: { type: "discard", sessionId: active.value.id },
  });
}
</script>
<template>
  <section v-if="active" class="active-workout">
    <a
      class="training-back text-button"
      :href="workoutsHref"
      :aria-label="t('training.page.backLabel')"
      @click="emit('back', $event)"
      ><ChevronLeft :size="20" aria-hidden="true" /><span
        class="training-back-label"
        >{{ t("training.page.backShort") }}</span
      ></a
    >
    <TrainingHeader
      :workspace="workspace"
      @finish="emit('finish')"
      @rename="renameOpen = true"
    />
    <div class="active-workout-layout">
      <div class="active-workout-content">
        <TrainingExerciseStrip :workspace="workspace" @pick="pick" />
        <div v-if="!active.exercises.length" class="workout-empty">
          <Dumbbell :size="28" />
          <h2>{{ t("training.page.emptyTitle") }}</h2>
          <p>{{ t("training.page.emptyText") }}</p>
        </div>
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
            unstyled
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
              :busy="saving"
              :current="training.current.value?.set.id === row.set.id"
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
          <section
            v-if="lastTime"
            class="workout-last-time"
            :aria-label="t('training.page.lastTime')"
          >
            <header>
              <h3>{{ t("training.page.lastTime") }}</h3>
              <span>{{ format.longDate(lastTime.finishedAt) }}</span>
            </header>
            <p v-for="(set, index) in lastTime.sets" :key="set.id">
              <span>{{ t("training.page.lastTimeSet", { n: index + 1 }) }}</span
              ><strong>{{
                t("training.page.lastTimeResult", {
                  weight: format.number(set.weightKg),
                  reps: set.reps,
                })
              }}</strong>
            </p>
          </section>
          <p
            v-if="isExerciseComplete(selectedExercise)"
            class="workout-exercise-complete"
          >
            <Check :size="16" />
            {{ t("training.page.setLogged", selectedExercise.sets.length) }}
          </p>
        </article>
        <p v-if="training.notice.value" class="workout-guidance" role="status">
          {{ training.notice.value }}
        </p>
        <div v-if="allDone" class="workout-done">
          <p class="eyebrow">{{ t("training.page.allLoggedEyebrow") }}</p>
          <h2>{{ t("training.page.allLoggedTitle") }}</h2>
          <p>{{ t("training.page.allLoggedText") }}</p>
          <BaseButton :disabled="!canFinish" @click="emit('finish')">{{
            t("training.page.finishWorkout")
          }}</BaseButton>
        </div>
        <BaseButton
          v-if="!active.exercises.length"
          ref="addButton"
          class="workout-add"
          variant="secondary"
          :disabled="saving || active.exercises.length >= 50"
          @click="pick"
          ><Plus :size="18" />{{ t("training.page.addExercises") }}</BaseButton
        >
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
    <h1>{{ t("training.page.readyTitle") }}</h1>
    <BaseButton @click="emit('navigate', 'workouts')">{{
      t("training.page.chooseWorkout")
    }}</BaseButton>
  </div>
</template>
