<script setup lang="ts">
import { BaseSheet, BaseButton } from "@form/ui";
import { Check } from "@lucide/vue";
import type { TrainingRow } from "./useTrainingSession";
import { fmt } from "./presentation";

const { open, totals, elapsed, pending, saving, error } = defineProps<{
  open: boolean;
  totals: { readonly completedSets: number; readonly volumeKg: number };
  elapsed: string;
  pending: readonly TrainingRow[];
  saving: boolean;
  error: string;
}>();
const emit = defineEmits<{
  close: [];
  "close-auto-focus": [event: Event];
  apply: [];
  review: [];
  finish: [];
}>();
</script>

<template>
  <BaseSheet
    :open="open"
    title="Finish this workout?"
    description="Only logged sets count toward your progress. Unlogged sets stay in the session record."
    @close="emit('close')"
    @close-auto-focus="emit('close-auto-focus', $event)"
    ><div class="finish-stats">
      <div>
        <strong>{{ totals.completedSets }}</strong
        ><span>sets logged</span>
      </div>
      <div>
        <strong>{{ fmt(totals.volumeKg) }}</strong
        ><span>kg volume</span>
      </div>
      <div>
        <strong>{{ elapsed }}</strong
        ><span>elapsed</span>
      </div>
    </div>
    <div v-if="pending.length" class="draft-finish-notice">
      <p>
        Your input is retained on this device but has not been applied to the
        workout. Apply it before finishing, or review your sets to change or
        discard it. Applying values does not log additional sets.
      </p>
      <ul aria-label="Sets with retained input">
        <li v-for="row in pending" :key="row.set.id">
          {{ row.exercise.name }} · Set {{ row.index + 1 }}
        </li>
      </ul>
      <BaseButton
        unstyled
        class="btn secondary"
        :disabled="saving"
        @click="emit('apply')"
      >
        Apply input values
      </BaseButton>
      <BaseButton
        unstyled
        class="text-button"
        :disabled="saving"
        @click="emit('review')"
      >
        Review my sets
      </BaseButton>
      <p
        v-if="pending.some((row) => row.issue)"
        class="field-error"
        role="alert"
      >
        Some values need attention. Return to the highlighted set to review
        them.
      </p>
    </div>
    <p v-if="error" class="field-error" role="alert">{{ error }}</p>
    <div class="form-actions">
      <BaseButton
        unstyled
        class="btn secondary"
        :disabled="saving"
        @click="emit('close')"
      >
        Keep training</BaseButton
      ><BaseButton
        unstyled
        class="btn primary"
        :disabled="saving || !!pending.length"
        @click="emit('finish')"
      >
        Save workout<Check :size="17" />
      </BaseButton></div
  ></BaseSheet>
</template>
