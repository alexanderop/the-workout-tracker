<script setup lang="ts">
import { BaseSheet, BaseButton } from "@form/ui";
import type { TrainingRow } from "./useTrainingSession";

const { row, saving } = defineProps<{
  row: TrainingRow | undefined;
  saving: boolean;
}>();
const emit = defineEmits<{
  close: [];
  undo: [setId: string];
  adjust: [amount: number];
  remove: [];
}>();
</script>

<template>
  <BaseSheet
    :open="!!row"
    :title="row ? `Set ${row.index + 1} of ${row.exercise.name}` : 'Set options'"
    description="Adjust repetitions, undo logging or remove this set."
    @close="emit('close')"
  >
    <template v-if="row">
      <BaseButton
        v-if="row.set.completed"
        variant="secondary"
        :disabled="saving || row.touched"
        @click="emit('undo', row.set.id)"
        >Undo log</BaseButton
      >
      <div class="repetition-adjuster">
        <BaseButton
          unstyled
          class="btn secondary"
          :disabled="saving || Number(row.reps) <= 0"
          aria-label="Decrease repetitions"
          @click="emit('adjust', -1)"
        >
          −</BaseButton
        ><strong>{{ row.reps || "—" }} reps</strong
        ><BaseButton
          unstyled
          class="btn secondary"
          :disabled="saving || Number(row.reps) >= 1000"
          aria-label="Increase repetitions"
          @click="emit('adjust', 1)"
        >
          +
        </BaseButton>
      </div>
      <BaseButton
        unstyled
        class="btn secondary full-width"
        :disabled="saving || row.exercise.sets.length <= 1"
        @click="emit('remove')"
      >
        Remove set
      </BaseButton>
    </template>
  </BaseSheet>
</template>
