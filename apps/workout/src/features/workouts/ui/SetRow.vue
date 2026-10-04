<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { Check, MoreHorizontal, Save } from "@lucide/vue";
import type { TrainingRow } from "./useTrainingSession";
import type { RawValues, SetDraft } from "../domain/drafts";
const props = defineProps<{
  row: TrainingRow;
  busy: boolean;
  current: boolean;
  dirty: boolean;
  conflict: boolean;
}>();
const emit = defineEmits<{
  edit: [values: Partial<RawValues>];
  commit: [];
  select: [];
  options: [];
  discard: [];
  keep: [];
  recover: [draft: SetDraft];
}>();
const form = ref<HTMLFormElement | null>(null);
watch(
  () => props.row.issue,
  async (issue) => {
    if (!issue) return;
    await nextTick();
    form.value?.scrollIntoView({ block: "center", behavior: "instant" });
  },
);
function selectInput(event: FocusEvent) {
  emit("select");
  if (event.target instanceof HTMLInputElement) event.target.select();
}
function input(field: "weight" | "reps", event: Event) {
  if (event.target instanceof HTMLInputElement)
    emit("edit", { [field]: event.target.value });
}
</script>
<template>
  <form
    ref="form"
    :id="`set-form-${row.set.id}`"
    class="set-form"
    :class="{ 'is-current': current }"
    @submit.prevent="emit('commit')"
  >
    <div
      class="set-row"
      :class="{ completed: row.set.completed, edited: dirty }"
    >
      <button
        type="button"
        class="set-number"
        :aria-label="`Select set ${row.index + 1} of ${row.exercise.name}`"
        :aria-pressed="current"
        @click="emit('select')"
      >
        {{ row.index + 1 }}
      </button>
      <input
        :value="row.weight"
        class="set-input"
        type="text"
        inputmode="decimal"
        maxlength="64"
        :aria-invalid="!!row.issue"
        :aria-describedby="row.issue ? `set-issue-${row.set.id}` : undefined"
        :aria-label="`Set ${row.index + 1} weight for ${row.exercise.name}`"
        :disabled="busy"
        @input="input('weight', $event)"
        @focus="selectInput"
      />
      <input
        :value="row.reps"
        class="set-input"
        type="text"
        inputmode="numeric"
        maxlength="64"
        :aria-invalid="!!row.issue"
        :aria-describedby="row.issue ? `set-issue-${row.set.id}` : undefined"
        :aria-label="`Set ${row.index + 1} repetitions for ${row.exercise.name}`"
        :disabled="busy"
        @input="input('reps', $event)"
        @focus="selectInput"
      />
      <button
        type="submit"
        class="set-toggle"
        :class="{ logged: row.set.completed, 'has-draft': dirty }"
        :aria-label="`${row.set.completed ? (dirty ? 'Save' : 'Undo') : 'Log'} set ${row.index + 1} of ${row.exercise.name}`"
        :aria-pressed="row.set.completed"
        :disabled="busy"
      >
        <Save v-if="dirty && row.set.completed" :size="18" /><Check
          v-else
          :size="19"
        />
      </button>
      <button
        type="button"
        class="icon-button set-options"
        :aria-label="`Options for set ${row.index + 1} of ${row.exercise.name}`"
        :disabled="busy"
        @click="emit('options')"
      >
        <MoreHorizontal :size="20" />
      </button>
    </div>
    <p
      v-if="row.issue"
      :id="`set-issue-${row.set.id}`"
      class="field-error"
      role="alert"
    >
      {{ row.issue }}
    </p>
    <div v-if="conflict" class="draft-conflict">
      <p>
        This set changed in another tab or has different recovered drafts. Your
        input is preserved.
      </p>
      <p>
        Saved: {{ row.set.weightKg }} kg × {{ row.set.reps }} reps ·
        {{ row.set.completed ? "logged" : "not logged" }}.
      </p>
      <button
        type="button"
        class="text-button"
        :disabled="busy"
        @click="emit('keep')"
      >
        Keep my input
      </button>
      <button
        v-for="draft in row.alternatives"
        :key="draft.id"
        type="button"
        class="text-button"
        @click="emit('recover', draft)"
      >
        Review {{ draft.weight || "empty" }} kg ×
        {{ draft.reps || "empty" }} reps
      </button>
      <button type="button" class="text-button" @click="emit('discard')">
        Discard drafts and use saved values
      </button>
    </div>
    <p v-if="row.storageIssue" class="field-error" role="alert">
      {{ row.storageIssue }}
    </p>
    <p v-else-if="row.touched && !conflict" class="draft-note">
      Draft saved on this device.
      {{
        row.set.completed
          ? "Save to update this set."
          : "Log when you finish this set."
      }}
    </p>
  </form>
</template>
