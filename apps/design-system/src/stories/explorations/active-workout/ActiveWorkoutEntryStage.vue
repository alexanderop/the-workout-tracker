<script setup lang="ts">
import { ArrowRight, Check } from "@lucide/vue";
import { BaseButton, BaseInputNumber } from "@form/ui";
import type { Entry } from "./types";

defineProps<{
  name: string;
  selected: number;
  sets: Entry[];
  current: Entry | undefined;
  setNumber: number;
  total: number;
  valid: boolean;
}>();
const emit = defineEmits<{
  weight: [value: string];
  reps: [value: string];
  log: [];
  next: [];
}>();
</script>

<template>
  <section class="entry-stage" aria-label="Current exercise">
    <div class="exercise-heading">
      <p class="eyebrow">
        {{ current ? `SET ${setNumber} OF 3` : "EXERCISE COMPLETE" }}
      </p>
      <h3>{{ name }}</h3>
    </div>
    <p class="previous">
      Last time <strong>{{ [60, 45, 20][selected] }} kg × 8</strong
      ><span>Sample reference</span>
    </p>
    <div class="set-trail" aria-label="Exercise sets">
      <div
        v-for="(set, index) in sets"
        :key="index"
        :class="{ logged: set.logged, upcoming: index + 1 === setNumber }"
      >
        <span
          ><Check v-if="set.logged" :size="14" aria-hidden="true" /> Set
          {{ index + 1 }}</span
        >
        <strong>{{ set.weight }} × {{ set.reps }}</strong
        ><small>{{ set.logged ? "Logged" : "Draft" }}</small>
      </div>
    </div>
    <template v-if="current">
      <div class="entry-values">
        <label
          >Weight · kg<BaseInputNumber
            :model-value="current.weight"
            @update:model-value="emit('weight', $event)"
            title="Weight"
            label="Current set weight"
            unit="kg"
            :decimals="2"
            :preset-step="2.5"
        /></label>
        <label
          >Repetitions<BaseInputNumber
            :model-value="current.reps"
            @update:model-value="emit('reps', $event)"
            title="Repetitions"
            label="Current set repetitions"
            :min="1"
        /></label>
      </div>
      <p class="draft-note">
        Confirming a number edits this draft. Log when the set is done.
      </p>
      <BaseButton class="log-action" :disabled="!valid" @click="emit('log')"
        >Log set {{ setNumber }} <Check :size="18" aria-hidden="true"
      /></BaseButton>
    </template>
    <BaseButton v-else-if="total < 9" class="log-action" @click="emit('next')"
      >Next exercise <ArrowRight :size="18" aria-hidden="true"
    /></BaseButton>
    <p v-else class="complete-message">
      All 9 sets logged. Ready to review your workout.
    </p>
  </section>
</template>

<style scoped>
.draft-note,
.previous {
  color: var(--ui-muted-foreground);
  font-size: var(--text-sm);
  line-height: 1.6;
}
.eyebrow {
  margin: 0;
  font-size: var(--text-xs);
}
.entry-stage {
  padding-top: var(--space-6);
}
.exercise-heading h3 {
  font-size: var(--text-2xl);
  line-height: 1.1;
  font-weight: 500;
  letter-spacing: -1.3px;
  margin: var(--space-3) 0 var(--space-4);
  overflow-wrap: anywhere;
}
.previous {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: baseline;
}
.previous strong {
  color: var(--ui-foreground);
  font-weight: 500;
}
.previous span {
  font-size: var(--text-xs);
}
.set-trail {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
  margin: var(--space-6) 0;
}
.set-trail > div {
  border-top: 2px solid var(--ui-border);
  padding-top: var(--space-2);
  color: var(--ui-muted-foreground);
  display: grid;
  gap: var(--space-1);
}
.set-trail span {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
}
.set-trail strong {
  font-size: var(--text-sm);
  font-weight: 500;
}
.set-trail small {
  font-size: var(--text-xs);
}
.set-trail .logged {
  color: var(--ui-primary);
  border-color: var(--ui-primary);
}
.set-trail .upcoming {
  border-color: var(--ui-foreground);
  color: var(--ui-foreground);
}
.entry-values {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}
.entry-values label {
  display: grid;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--ui-muted-foreground);
  min-width: 0;
}
.entry-values :deep(.ui-numeric-trigger) {
  width: 100%;
  min-height: 76px;
  font-size: var(--text-2xl);
  font-variant-numeric: tabular-nums;
}
.draft-note {
  font-size: var(--text-xs);
  margin: var(--space-4) 0 var(--space-6);
}
.log-action {
  width: 100%;
  min-height: 52px;
}
.concept-overview .entry-stage {
  padding-top: var(--space-4);
}
.concept-overview .exercise-heading h3 {
  font-size: var(--text-xl);
}
.complete-message {
  color: var(--ui-primary);
  line-height: 1.6;
}
@media (max-width: 480px) {
  .exercise-heading h3 {
    font-size: var(--text-2xl);
  }
  .entry-values {
    gap: var(--space-2);
  }
}
</style>
