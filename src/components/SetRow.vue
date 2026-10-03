<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Check, Minus, Save } from "@lucide/vue";
import type { WorkoutSet } from "../domain";
const props = defineProps<{
  set: WorkoutSet;
  index: number;
  exerciseName: string;
  revision: number;
  busy: boolean;
  removable: boolean;
}>();
const emit = defineEmits<{
  commit: [
    values: {
      weightKg: number;
      reps: number;
      completed: boolean;
      revision: number;
    },
  ];
  remove: [];
}>();
const weight = ref<string | number>(String(props.set.weightKg));
const reps = ref<string | number>(String(props.set.reps));
const editedRevision = ref(props.revision);
const touched = ref(false);
let draftBase = props.set;
const issue = ref("");
const dirty = computed(
  () =>
    String(weight.value) !== String(props.set.weightKg) ||
    String(reps.value) !== String(props.set.reps),
);
watch(
  () => props.set,
  (set) => {
    if (
      !touched.value ||
      (String(weight.value) === String(set.weightKg) &&
        String(reps.value) === String(set.reps))
    ) {
      weight.value = String(set.weightKg);
      reps.value = String(set.reps);
      touched.value = false;
      editedRevision.value = props.revision;
    } else if (
      set.weightKg === draftBase.weightKg &&
      set.reps === draftBase.reps &&
      set.completed === draftBase.completed
    ) {
      editedRevision.value = props.revision;
    }
  },
);
function edit() {
  if (!touched.value) {
    editedRevision.value = props.revision;
    draftBase = props.set;
  }
  touched.value = true;
  issue.value = "";
}
function submit() {
  const weightKg = Number(weight.value),
    repetitions = Number(reps.value);
  if (
    String(weight.value).trim() === "" ||
    String(reps.value).trim() === "" ||
    !Number.isFinite(weightKg) ||
    weightKg < 0 ||
    weightKg > 1000 ||
    !Number.isInteger(repetitions) ||
    repetitions < 1 ||
    repetitions > 1000
  ) {
    issue.value = "Enter 0–1000 kg and 1–1000 whole repetitions.";
    return;
  }
  emit("commit", {
    weightKg,
    reps: repetitions,
    completed: dirty.value ? true : !props.set.completed,
    revision: touched.value ? editedRevision.value : props.revision,
  });
}
const actionLabel = computed(
  () =>
    `${props.set.completed ? (dirty.value ? "Save" : "Undo") : "Log"} set ${props.index + 1} of ${props.exerciseName}`,
);
</script>
<template>
  <div class="set-row" :class="{ completed: set.completed, edited: dirty }">
    <span class="set-number">{{ index + 1 }}</span>
    <input
      v-model="weight"
      class="set-input"
      type="number"
      min="0"
      max="1000"
      step="any"
      inputmode="decimal"
      :aria-label="`Set ${index + 1} weight for ${exerciseName}`"
      :disabled="busy"
      @input="edit"
      @keydown.enter.prevent="submit"
    />
    <input
      v-model="reps"
      class="set-input"
      type="number"
      min="1"
      max="1000"
      step="1"
      inputmode="numeric"
      :aria-label="`Set ${index + 1} repetitions for ${exerciseName}`"
      :disabled="busy"
      @input="edit"
      @keydown.enter.prevent="submit"
    />
    <button
      class="set-toggle"
      :class="{ logged: set.completed, 'has-draft': dirty }"
      :aria-label="actionLabel"
      :aria-pressed="set.completed"
      :disabled="busy"
      @click="submit"
    >
      <Save v-if="dirty && set.completed" :size="18" /><Check
        v-else
        :size="19"
      />
    </button>
    <button
      class="icon-button remove-set"
      :aria-label="`Remove set ${index + 1} of ${exerciseName}`"
      :disabled="!removable || busy"
      @click="emit('remove')"
    >
      <Minus :size="14" />
    </button>
  </div>
  <p v-if="issue" class="field-error" role="alert">{{ issue }}</p>
  <p v-else-if="dirty" class="draft-note">
    Changes save when you {{ set.completed ? "save" : "log" }} this set.
  </p>
</template>
