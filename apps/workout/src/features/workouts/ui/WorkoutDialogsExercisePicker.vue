<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";
import { BaseActions, BaseSheet, BaseButton, BaseNotice } from "@form/ui";
import { Plus, Check } from "@lucide/vue";
import ExerciseCatalog from "./ExerciseCatalog.vue";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import ExerciseCreateSheet from "./ExerciseCreateSheet.vue";
import type { Exercise } from "../domain";
import { useTranslation } from "../../../i18n";

const { workspace } = defineProps<{
  workspace: Pick<
    WorkoutWorkspace,
    "snapshot" | "saving" | "error" | "run" | "training" | "active" | "catalog"
  >;
}>();
const emit = defineEmits<{ started: [] }>();
const { t } = useTranslation();
const { snapshot, saving, error, run, training, active, catalog } = workspace;

const picker = ref<
  { kind: "start" } | { kind: "add"; sessionId: string } | null
>(null);
const pickerOpen = computed(() => picker.value !== null);
const selectedExercises = ref<string[]>([]);
const createOpen = ref(false);
const createSheet =
  useTemplateRef<InstanceType<typeof ExerciseCreateSheet>>("createSheet");
function toggleExercise(id: string) {
  selectedExercises.value = selectedExercises.value.includes(id)
    ? selectedExercises.value.filter((value) => value !== id)
    : [...selectedExercises.value, id];
}
function closePicker() {
  if (saving.value) return;
  picker.value = null;
  selectedExercises.value = [];
}
async function addExercises() {
  const intent = picker.value;
  if (!intent || !selectedExercises.value.length || saving.value) return;
  const previousIds = new Set(
    active.value?.exercises.map((exercise) => exercise.id),
  );
  const command =
    intent.kind === "start"
      ? {
          type: "start-selected" as const,
          exerciseIds: selectedExercises.value,
          name: t("workouts.home.defaultName"),
        }
      : {
          type: "add-exercises" as const,
          sessionId: intent.sessionId,
          exerciseIds: selectedExercises.value,
        };
  const saved = await run(command);
  if (!saved?.active) return;
  const first = saved.active.exercises.find(
    (exercise) => !previousIds.has(exercise.id),
  );
  if (first) training.selectExercise(first.id);
  picker.value = null;
  selectedExercises.value = [];
  if (intent.kind === "start") emit("started");
}
async function createExercise(exercise: Omit<Exercise, "id" | "custom">) {
  if (saving.value) return;
  const previousIds = new Set(Object.keys(snapshot.value?.exercises ?? {}));
  const saved = await run({ type: "create-exercise", exercise });
  if (!saved) return;
  createSheet.value?.reset();
  createOpen.value = false;
  const created = Object.values(saved.exercises).find(
    (candidate) => !previousIds.has(candidate.id),
  );
  if (pickerOpen.value && created)
    selectedExercises.value = [...selectedExercises.value, created.id];
}
defineExpose({
  /** Opens the picker to start a new workout from chosen exercises. */
  openStart: () => {
    selectedExercises.value = [];
    picker.value = { kind: "start" };
  },
  /** Opens the picker to add exercises to the active workout. */
  openAdd: () => {
    selectedExercises.value = [];
    if (!active.value) return;
    picker.value = { kind: "add", sessionId: active.value.id };
  },
  openCreate: () => {
    createOpen.value = true;
  },
});
</script>

<template>
  <BaseSheet
    :open="pickerOpen"
    :title="
      picker?.kind === 'start'
        ? t('dialogs.picker.titleStart')
        : t('dialogs.picker.titleAdd')
    "
    :description="t('dialogs.picker.description')"
    @close="closePicker"
  >
    <ExerciseCatalog
      :exercises="catalog"
      :selected="selectedExercises"
      :busy="saving"
      @toggle="toggleExercise"
    />
    <div class="picker-actions">
      <BaseActions>
        <BaseButton
          variant="ghost"
          :disabled="saving"
          @click="createOpen = true"
        >
          <Plus :size="16" />{{ t("dialogs.picker.createOwn") }}
        </BaseButton>
        <BaseButton
          :disabled="saving || !selectedExercises.length"
          @click="addExercises"
        >
          {{
            picker?.kind === "start"
              ? t("dialogs.picker.start", { count: selectedExercises.length })
              : t("dialogs.picker.add", { count: selectedExercises.length })
          }}<Check :size="17" />
        </BaseButton>
      </BaseActions>
    </div>
    <BaseNotice v-if="error" tone="danger">{{ error }}</BaseNotice>
  </BaseSheet>
  <ExerciseCreateSheet
    ref="createSheet"
    :open="createOpen"
    :saving="saving"
    :error="error"
    @close="createOpen = false"
    @submit="createExercise"
  />
</template>
