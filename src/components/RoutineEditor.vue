<script setup lang="ts">
import { computed, ref } from "vue";
import { Plus, Trash2 } from "@lucide/vue";
import type { Exercise, Routine } from "../domain";

const props = defineProps<{
  routine: Routine | null;
  exercises: readonly Exercise[];
  busy: boolean;
}>();

const emit = defineEmits<{
  save: [routine: Routine];
  cancel: [];
}>();

type ExerciseDraft = {
  exerciseId: string;
  sets: string | number;
  reps: string | number;
  weightKg: string | number;
};

const name = ref(props.routine?.name ?? "");
const description = ref(props.routine?.description ?? "");
const entries = ref<ExerciseDraft[]>(
  props.routine?.exercises.map((entry) => ({
    exerciseId: entry.exerciseId,
    sets: String(entry.sets),
    reps: String(entry.reps),
    weightKg: String(entry.weightKg),
  })) ?? [],
);
const selectedExercise = ref("");
const error = ref("");
const announcement = ref("");
const availableExercises = computed(() =>
  props.exercises.filter(
    (exercise) =>
      !entries.value.some((entry) => entry.exerciseId === exercise.id),
  ),
);
const exerciseNames = computed(
  () =>
    new Map(props.exercises.map((exercise) => [exercise.id, exercise.name])),
);

function addExercise() {
  if (props.busy) return;
  const exercise = availableExercises.value.find(
    (item) => item.id === selectedExercise.value,
  );
  if (!exercise) return;
  entries.value.push({
    exerciseId: exercise.id,
    sets: "3",
    reps: "8",
    weightKg: "0",
  });
  selectedExercise.value = "";
  error.value = "";
  announcement.value = `${exercise.name} added.`;
}

function removeExercise(index: number) {
  if (props.busy) return;
  const removed = entries.value.splice(index, 1)[0];
  if (removed)
    announcement.value = `${exerciseNames.value.get(removed.exerciseId) ?? "Exercise"} removed.`;
}

function save() {
  if (props.busy) return;
  error.value = "";
  if (!name.value.trim()) {
    error.value = "Give your routine a name.";
    return;
  }
  if (entries.value.length === 0) {
    error.value = "Add at least one exercise to your routine.";
    return;
  }
  const exercises = entries.value.map((entry) => ({
    exerciseId: entry.exerciseId,
    sets: Number(entry.sets),
    reps: Number(entry.reps),
    weightKg: Number(entry.weightKg),
  }));
  if (
    entries.value.some(
      (entry) =>
        !String(entry.sets).trim() ||
        !String(entry.reps).trim() ||
        !String(entry.weightKg).trim(),
    ) ||
    exercises.some(
      (entry) =>
        !Number.isInteger(entry.sets) ||
        entry.sets < 1 ||
        entry.sets > 30 ||
        !Number.isInteger(entry.reps) ||
        entry.reps < 1 ||
        entry.reps > 1000 ||
        !Number.isFinite(entry.weightKg) ||
        entry.weightKg < 0 ||
        entry.weightKg > 1000,
    )
  ) {
    error.value =
      "Use 1–30 sets, 1–1,000 reps, and a weight between 0 and 1,000 kg.";
    return;
  }
  emit("save", {
    id: props.routine?.id ?? crypto.randomUUID(),
    name: name.value.trim(),
    description: description.value.trim(),
    exercises,
  });
}
</script>

<template>
  <form
    class="form-stack routine-editor"
    :aria-busy="busy"
    @submit.prevent="save"
  >
    <fieldset class="editor-fields form-stack" :disabled="busy">
      <label class="field">
        <span>Routine name</span>
        <input
          v-model="name"
          class="input"
          name="routine-name"
          placeholder="e.g. Upper body"
          maxlength="80"
          required
        />
      </label>
      <label class="field">
        <span>Description <span class="muted">(optional)</span></span>
        <textarea
          v-model="description"
          class="input"
          name="routine-description"
          placeholder="Your focus for this session"
          maxlength="240"
          rows="2"
        />
      </label>

      <div class="exercise-picker">
        <label class="field">
          <span>Add an exercise</span>
          <select
            v-model="selectedExercise"
            class="input"
            :disabled="availableExercises.length === 0"
          >
            <option value="" disabled>
              {{
                availableExercises.length
                  ? "Choose an exercise"
                  : "All exercises added"
              }}
            </option>
            <option
              v-for="exercise in availableExercises"
              :key="exercise.id"
              :value="exercise.id"
            >
              {{ exercise.name }} · {{ exercise.category }}
            </option>
          </select>
        </label>
        <button
          type="button"
          class="btn secondary"
          :disabled="!selectedExercise"
          @click="addExercise"
        >
          <Plus :size="18" aria-hidden="true" /> Add
        </button>
      </div>

      <p v-if="entries.length === 0" class="muted empty-exercises">
        Add exercises in the order you want to train.
      </p>
      <div
        v-for="(entry, index) in entries"
        :key="entry.exerciseId"
        class="routine-exercise"
      >
        <div class="exercise-heading">
          <h3>
            {{ index + 1 }}.
            {{ exerciseNames.get(entry.exerciseId) ?? "Exercise" }}
          </h3>
          <button
            type="button"
            class="icon-button ghost"
            :aria-label="`Remove ${exerciseNames.get(entry.exerciseId) ?? 'exercise'}`"
            @click="removeExercise(index)"
          >
            <Trash2 :size="18" aria-hidden="true" />
          </button>
        </div>
        <div class="exercise-values">
          <label class="field">
            <span>Sets</span>
            <input
              v-model="entry.sets"
              class="input"
              type="number"
              inputmode="numeric"
              min="1"
              max="30"
              step="1"
              required
              :aria-label="`${exerciseNames.get(entry.exerciseId)} sets`"
            />
          </label>
          <label class="field">
            <span>Reps</span>
            <input
              v-model="entry.reps"
              class="input"
              type="number"
              inputmode="numeric"
              min="1"
              max="1000"
              step="1"
              required
              :aria-label="`${exerciseNames.get(entry.exerciseId)} reps`"
            />
          </label>
          <label class="field">
            <span>Weight · kg</span>
            <input
              v-model="entry.weightKg"
              class="input"
              type="number"
              inputmode="decimal"
              min="0"
              max="1000"
              step="any"
              required
              :aria-label="`${exerciseNames.get(entry.exerciseId)} weight in kg`"
            />
          </label>
        </div>
      </div>
      <p v-if="entries.length" class="muted weight-hint">
        Use 0 kg for bodyweight exercises. You can adjust each set during your
        workout.
      </p>
    </fieldset>
    <p class="sr-only" role="status">{{ announcement }}</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <div class="form-actions">
      <button
        type="button"
        class="btn secondary"
        :disabled="busy"
        @click="emit('cancel')"
      >
        Cancel
      </button>
      <button type="submit" class="btn primary" :disabled="busy">
        {{ busy ? "Saving…" : "Save routine" }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.editor-fields {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
}
.exercise-picker {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 12px;
}
.exercise-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.exercise-heading h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}
.exercise-values {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.routine-editor .input {
  width: 100%;
  min-width: 0;
  min-height: 48px;
}
.routine-editor button {
  min-height: 48px;
}
.routine-editor .icon-button {
  min-width: 48px;
  flex-shrink: 0;
}
.routine-editor textarea {
  resize: vertical;
}
.weight-hint,
.empty-exercises {
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
</style>
