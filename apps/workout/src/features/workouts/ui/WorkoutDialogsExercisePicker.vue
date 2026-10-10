<script setup lang="ts">
import { computed, ref } from "vue";
import { BaseSheet, BaseButton, BaseInput, BaseSelectNative } from "@form/ui";
import { Plus, Check } from "@lucide/vue";
import ExerciseCatalog from "./ExerciseCatalog.vue";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";

const { workspace } = defineProps<{
  workspace: Pick<
    WorkoutWorkspace,
    "snapshot" | "saving" | "error" | "run" | "training" | "active" | "catalog"
  >;
}>();
const emit = defineEmits<{ started: [] }>();
const { snapshot, saving, error, run, training, active, catalog } = workspace;

const muscleGroups = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Other"];
const equipmentTypes = [
  "Barbell",
  "Dumbbell",
  "Cable",
  "Machine",
  "Bodyweight",
  "Band",
  "Kettlebell",
  "Other",
];
const picker = ref<
  { kind: "start" } | { kind: "add"; sessionId: string } | null
>(null);
const pickerOpen = computed(() => picker.value !== null);
const selectedExercises = ref<string[]>([]);
const customName = ref("");
const customCategory = ref("Other");
const customEquipment = ref("Other");
const createOpen = ref(false);
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
async function createExercise() {
  if (!customName.value.trim() || saving.value) return;
  const previousIds = new Set(Object.keys(snapshot.value?.exercises ?? {}));
  const saved = await run({
    type: "create-exercise",
    exercise: {
      name: customName.value.trim(),
      category: customCategory.value,
      equipment: customEquipment.value,
    },
  });
  if (!saved) return;
  customName.value = "";
  createOpen.value = false;
  const created = Object.values(saved.exercises).find(
    (exercise) => !previousIds.has(exercise.id),
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
    :title="picker?.kind === 'start' ? 'Select exercises' : 'Add exercises'"
    description="Choose the movements for this workout."
    @close="closePicker"
  >
    <ExerciseCatalog
      :exercises="catalog"
      :selected="selectedExercises"
      :busy="saving"
      @toggle="toggleExercise"
    />
    <div class="picker-actions">
      <BaseButton
        unstyled
        class="text-button"
        :disabled="saving"
        @click="createOpen = true"
      >
        <Plus :size="16" />Create your own</BaseButton
      ><BaseButton
        unstyled
        class="btn primary full-width"
        :disabled="saving || !selectedExercises.length"
        @click="addExercises"
      >
        {{ picker?.kind === "start" ? "Start" : "Add" }} ({{
          selectedExercises.length
        }})<Check :size="17" />
      </BaseButton>
    </div>
    <p v-if="error" class="field-error" role="alert">{{ error }}</p>
  </BaseSheet>
  <BaseSheet
    :open="createOpen"
    title="Create exercise"
    description="Add a movement to your personal library."
    @close="createOpen = false"
  >
    <form class="form-stack" @submit.prevent="createExercise">
      <label class="field"
        ><span>Exercise name</span
        ><BaseInput
          v-model="customName"
          class="input"
          required
          maxlength="80"
          placeholder="e.g. Cable lateral raise"
      /></label>
      <label class="field"
        ><span>Muscle group</span
        ><BaseSelectNative v-model="customCategory" class="input">
          <option v-for="group in muscleGroups" :key="group">
            {{ group }}
          </option>
        </BaseSelectNative></label
      >
      <label class="field"
        ><span>Equipment</span
        ><BaseSelectNative v-model="customEquipment" class="input">
          <option v-for="item in equipmentTypes" :key="item">
            {{ item }}
          </option>
        </BaseSelectNative></label
      >
      <BaseButton
        unstyled
        class="btn primary full-width"
        type="submit"
        :disabled="saving || !customName.trim()"
      >
        <Plus :size="17" />Create exercise
      </BaseButton>
      <p v-if="error" class="field-error" role="alert">{{ error }}</p>
    </form>
  </BaseSheet>
</template>
