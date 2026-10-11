<script setup lang="ts">
import { computed } from "vue";
import { useFormat, useTranslation } from "../../../i18n";
import type { CompletedSession } from "../domain";
import { lastExercisePerformance } from "../domain/exerciseHistory";

// What the lifter did the last time they trained this exercise.
const { exerciseId, completed } = defineProps<{
  exerciseId: string;
  completed: Readonly<Record<string, CompletedSession>>;
}>();
const { t } = useTranslation();
const format = useFormat();
const lastTime = computed(() => lastExercisePerformance(completed, exerciseId));
</script>

<template>
  <section
    v-if="lastTime"
    class="workout-last-time"
    :aria-label="t('training.page.lastTime')"
  >
    <header>
      <h3>{{ t("training.page.lastTime") }}</h3>
      <span>{{ format.longDate(lastTime.finishedAt) }}</span>
    </header>
    <p v-for="(set, index) in lastTime.sets" :key="set.id">
      <span>{{ t("training.page.lastTimeSet", { n: index + 1 }) }}</span
      ><strong>{{
        t("training.page.lastTimeResult", {
          weight: format.number(set.weightKg),
          reps: set.reps,
        })
      }}</strong>
    </p>
  </section>
</template>
