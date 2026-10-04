<script setup lang="ts">
import { Button, NumericInput } from "@form/ui";
import { useTemplateRef, watch, nextTick } from "vue";
import { Check, MoreHorizontal, Save } from "@lucide/vue";
import type { TrainingRow } from "./useTrainingSession";
import type { RawValues, SetDraft } from "../domain/drafts";
const { row, busy, current, dirty, conflict } = defineProps<{
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
const form = useTemplateRef<HTMLFormElement>("form");
watch(
  () => row.issue,
  async (issue) => {
    if (!issue) return;
    await nextTick();
    form.value?.scrollIntoView({ block: "center", behavior: "instant" });
  },
);
defineExpose({
  get setId() {
    return row.set.id;
  },
  scrollIntoView() {
    form.value?.scrollIntoView({ block: "nearest", behavior: "instant" });
  },
});
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
      <Button
        type="button"
        class="set-number"
        :aria-label="`Select set ${row.index + 1} of ${row.exercise.name}`"
        :aria-pressed="current"
        @click="emit('select')"
      >
        {{ row.index + 1 }}
      </Button>
      <NumericInput
        :model-value="row.weight"
        title="Weight"
        unit="kg"
        :decimals="2"
        :preset-step="2.5"
        class="set-input"
        :aria-invalid="!!row.issue"
        :aria-describedby="row.issue ? `set-issue-${row.set.id}` : undefined"
        :label="`Set ${row.index + 1} weight for ${row.exercise.name}`"
        :disabled="busy"
        @update:model-value="emit('edit', { weight: $event })"
        @open="emit('select')"
      />
      <NumericInput
        :model-value="row.reps"
        title="Reps"
        :min="1"
        class="set-input"
        :aria-invalid="!!row.issue"
        :aria-describedby="row.issue ? `set-issue-${row.set.id}` : undefined"
        :label="`Set ${row.index + 1} repetitions for ${row.exercise.name}`"
        :disabled="busy"
        @update:model-value="emit('edit', { reps: $event })"
        @open="emit('select')"
      />
      <Button
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
      </Button>
      <Button
        type="button"
        class="icon-button set-options"
        :aria-label="`Options for set ${row.index + 1} of ${row.exercise.name}`"
        :disabled="busy"
        @click="emit('options')"
      >
        <MoreHorizontal :size="20" />
      </Button>
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
      <Button
        type="button"
        class="text-button"
        :disabled="busy"
        @click="emit('keep')"
      >
        Keep my input
      </Button>
      <Button
        v-for="draft in row.alternatives"
        :key="draft.id"
        type="button"
        class="text-button"
        @click="emit('recover', draft)"
      >
        Review {{ draft.weight || "empty" }} kg ×
        {{ draft.reps || "empty" }} reps
      </Button>
      <Button type="button" class="text-button" @click="emit('discard')">
        Discard drafts and use saved values
      </Button>
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
