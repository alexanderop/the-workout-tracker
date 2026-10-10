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
  font-size: 12px;
  line-height: 1.6;
}
.eyebrow {
  margin: 0;
  font-size: 10px;
}
.entry-stage {
  padding-top: 24px;
}
.exercise-heading h3 {
  font-size: 32px;
  line-height: 1.1;
  font-weight: 500;
  letter-spacing: -1.3px;
  margin: 12px 0 18px;
  overflow-wrap: anywhere;
}
.previous {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: baseline;
}
.previous strong {
  color: var(--ui-foreground);
  font-weight: 500;
}
.previous span {
  font-size: 10px;
}
.set-trail {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 24px 0;
}
.set-trail > div {
  border-top: 2px solid var(--ui-border);
  padding-top: 10px;
  color: var(--ui-muted-foreground);
  display: grid;
  gap: 6px;
}
.set-trail span {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}
.set-trail strong {
  font-size: 13px;
  font-weight: 500;
}
.set-trail small {
  font-size: 10px;
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
  gap: 16px;
}
.entry-values label {
  display: grid;
  gap: 10px;
  font-size: 12px;
  color: var(--ui-muted-foreground);
  min-width: 0;
}
.entry-values :deep(.ui-numeric-trigger) {
  width: 100%;
  min-height: 76px;
  font-size: 32px;
  font-variant-numeric: tabular-nums;
}
.draft-note {
  font-size: 11px;
  margin: 16px 0 24px;
}
.log-action {
  width: 100%;
  min-height: 52px;
}
.concept-overview .entry-stage {
  padding-top: 18px;
}
.concept-overview .exercise-heading h3 {
  font-size: 24px;
}
.complete-message {
  color: var(--ui-primary);
  line-height: 1.6;
}
@media (max-width: 480px) {
  .exercise-heading h3 {
    font-size: 28px;
  }
  .entry-values {
    gap: 10px;
  }
}
</style>
