<script setup lang="ts">
import { Button, Input, Textarea, NumericInput } from "@form/ui";
import { computed, ref } from "vue";
import { Plus, Trash2 } from "@lucide/vue";
import type { CompletedSession, Exercise, Routine } from "../domain";
import { routineSchema } from "../domain";
import ExerciseCatalog from "./ExerciseCatalog.vue";
const props = defineProps<{
  routine: Routine | null;
  source?: CompletedSession | null;
  exercises: readonly Exercise[];
  busy: boolean;
}>();
const emit = defineEmits<{ save: [routine: Routine]; cancel: [] }>();
type SetDraft = {
  weightKg: string | number;
  reps: string | number;
  skipped?: boolean;
};
type ExerciseDraft = { key: string; exerciseId: string; sets: SetDraft[] };
const name = ref(props.routine?.name ?? "");
const description = ref(props.routine?.description ?? "");
const entries = ref<ExerciseDraft[]>(
  props.routine?.exercises.map((entry, exerciseIndex) => ({
    key: crypto.randomUUID(),
    exerciseId: entry.exerciseId,
    sets: entry.sets.map((set, setIndex) => ({
      ...set,
      skipped:
        props.source?.exercises[exerciseIndex]?.sets[setIndex]?.completed ===
        false,
    })),
  })) ?? [],
);
const pickerOpen = ref(false);
const selected = ref<string[]>([]);
const error = ref("");
const names = computed(
  () =>
    new Map(props.exercises.map((exercise) => [exercise.id, exercise.name])),
);
function toggle(id: string) {
  selected.value = selected.value.includes(id)
    ? selected.value.filter((item) => item !== id)
    : [...selected.value, id];
}
function addExercises() {
  if (entries.value.length + selected.value.length > 50) {
    error.value = "Keep up to 50 exercises in a template.";
    return;
  }
  entries.value.push(
    ...selected.value.map((exerciseId) => ({
      key: crypto.randomUUID(),
      exerciseId,
      sets: [{ reps: 8, weightKg: 0 }],
    })),
  );
  selected.value = [];
  pickerOpen.value = false;
  error.value = "";
}
function addSet(entry: ExerciseDraft) {
  if (entry.sets.length < 30)
    entry.sets.push({
      ...(entry.sets.at(-1) ?? { reps: 8, weightKg: 0 }),
      skipped: false,
    });
}
function save() {
  if (props.busy) return;
  const result = routineSchema.safeParse({
    id: props.routine?.id ?? crypto.randomUUID(),
    name: name.value,
    description: description.value.trim(),
    exercises: entries.value.map((entry) => ({
      exerciseId: entry.exerciseId,
      sets: entry.sets.map((set) => ({
        weightKg: String(set.weightKg).trim() ? Number(set.weightKg) : NaN,
        reps: String(set.reps).trim() ? Number(set.reps) : NaN,
      })),
    })),
  });
  if (!result.success) {
    error.value =
      "Add a name and at least one exercise. Use 0–1,000 kg and 1–1,000 whole reps for every set.";
    return;
  }
  emit("save", result.data);
}
</script>
<template>
  <form
    class="form-stack routine-editor"
    :aria-busy="busy"
    @submit.prevent="save"
  >
    <fieldset class="editor-fields form-stack" :disabled="busy">
      <label class="field"
        ><span>Template name</span
        ><Input
          v-model="name"
          class="input"
          name="routine-name"
          placeholder="e.g. Upper body"
          maxlength="80"
          required
      /></label>
      <label class="field"
        ><span>Description <span class="muted">(optional)</span></span
        ><Textarea
          v-model="description"
          class="input"
          maxlength="240"
          rows="2"
          placeholder="Your focus for this session"
        />
      </label>
      <p class="muted small">
        Every set is editable. Remove any sets you do not want to repeat,
        including those you skipped.
      </p>
      <section
        v-for="(entry, index) in entries"
        :key="entry.key"
        class="routine-exercise"
      >
        <div class="exercise-heading">
          <h3>{{ index + 1 }}. {{ names.get(entry.exerciseId) }}</h3>
          <Button
            type="button"
            class="icon-button"
            :aria-label="`Remove ${names.get(entry.exerciseId)}`"
            @click="entries.splice(index, 1)"
          >
            <Trash2 :size="17" />
          </Button>
        </div>
        <div
          v-for="(set, setIndex) in entry.sets"
          :key="setIndex"
          class="template-set"
        >
          <span class="muted"
            >{{ setIndex + 1
            }}<small v-if="set.skipped" class="skipped-label"
              >Skipped</small
            ></span
          >
          <label class="field"
            ><span>Weight · kg</span
            ><NumericInput
              v-model="set.weightKg"
              class="input"
              title="Weight"
              unit="kg"
              :decimals="2"
              :preset-step="2.5"
              :disabled="busy"
              :min="0"
              :max="1000"
              :label="`${names.get(entry.exerciseId)} set ${setIndex + 1} weight`"
          /></label>
          <label class="field"
            ><span>Reps</span
            ><NumericInput
              v-model="set.reps"
              class="input"
              title="Reps"
              :disabled="busy"
              :min="1"
              :max="1000"
              :label="`${names.get(entry.exerciseId)} set ${setIndex + 1} reps`"
          /></label>
          <Button
            type="button"
            class="icon-button"
            :disabled="entry.sets.length <= 1"
            :aria-label="`Remove set ${setIndex + 1} of ${names.get(entry.exerciseId)}`"
            @click="entry.sets.splice(setIndex, 1)"
          >
            <Trash2 :size="16" />
          </Button>
        </div>
        <Button
          type="button"
          class="text-button add-set"
          :disabled="entry.sets.length >= 30"
          @click="addSet(entry)"
        >
          <Plus :size="15" />Add set
        </Button>
      </section>
      <Button
        type="button"
        class="btn secondary full-width"
        :disabled="entries.length >= 50"
        @click="pickerOpen = !pickerOpen"
      >
        <Plus :size="17" />{{
          pickerOpen ? "Close exercise library" : "Add exercises"
        }}
      </Button>
      <div v-if="pickerOpen" class="template-picker">
        <ExerciseCatalog
          :exercises="exercises"
          :selected="selected"
          :busy="busy"
          @toggle="toggle"
        /><Button
          type="button"
          class="btn primary full-width"
          :disabled="!selected.length"
          @click="addExercises"
        >
          Add {{ selected.length }} exercises
        </Button>
      </div>
    </fieldset>
    <p v-if="error" class="field-error" role="alert">{{ error }}</p>
    <div class="form-actions">
      <Button
        type="button"
        class="btn secondary"
        :disabled="busy"
        @click="emit('cancel')"
      >
        Cancel</Button
      ><Button type="submit" class="btn primary" :disabled="busy">
        {{ busy ? "Saving…" : "Save template" }}
      </Button>
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
.exercise-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.exercise-heading h3 {
  font-size: 14px;
  margin: 0;
}
.template-set {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) minmax(0, 1fr) 40px;
  gap: 10px;
  align-items: center;
  margin-top: 12px;
}
.input {
  width: 100%;
  min-width: 0;
  min-height: 44px;
}
.template-picker {
  border: 1px solid var(--surface);
  border-radius: 12px;
  padding: 12px;
}
.template-picker :deep(.catalog-list) {
  max-height: 320px;
  overflow: auto;
}
.skipped-label {
  display: block;
  font-size: 9px;
  margin-top: 4px;
}
@media (max-width: 380px) {
  .template-set {
    grid-template-columns: 20px minmax(0, 1fr) minmax(0, 1fr) 44px;
    gap: 6px;
    align-items: end;
  }
  .template-set > .muted {
    align-self: center;
  }
  .template-set .field > span {
    font-size: 11px;
    white-space: nowrap;
  }
  .template-set .input {
    padding-inline: 6px;
  }
  .routine-exercise {
    padding: 12px;
  }
}
</style>
