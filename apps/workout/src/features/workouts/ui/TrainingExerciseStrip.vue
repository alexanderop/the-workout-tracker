<script setup lang="ts">
import { BaseMediaTab } from "@form/ui";
import { Plus, Check } from "@lucide/vue";
import { useTranslation } from "../../../i18n";
import ExerciseThumbnail from "./ExerciseThumbnail.vue";
import { isExerciseComplete } from "./presentation";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
const { workspace } = defineProps<{
  workspace: Pick<
    WorkoutWorkspace,
    "active" | "snapshot" | "saving" | "training"
  >;
}>();
const emit = defineEmits<{ pick: [] }>();
const { active, snapshot, saving, training } = workspace;
const { t } = useTranslation();
const selectedExercise = training.currentExercise;
</script>
<template>
  <nav
    v-if="active?.exercises.length"
    class="workout-exercise-strip"
    :aria-label="t('training.page.exercisesNav')"
  >
    <BaseMediaTab
      v-for="exercise in active.exercises"
      :key="exercise.id"
      class="workout-exercise-tab"
      :current="selectedExercise?.id === exercise.id"
      :aria-label="
        isExerciseComplete(exercise)
          ? t('training.page.tabAllLogged', { exercise: exercise.name })
          : exercise.name
      "
      @click="training.selectExercise(exercise.id)"
    >
      <template #media
        ><ExerciseThumbnail
          :exercise="snapshot?.exercises[exercise.exerciseId]"
          :size="56"
          plain
      /></template>
      <template v-if="isExerciseComplete(exercise)" #badge
        ><Check :size="14"
      /></template>
      {{ exercise.name }}
    </BaseMediaTab>
    <BaseMediaTab
      class="workout-exercise-tab"
      :disabled="saving || active.exercises.length >= 50"
      :aria-label="t('training.page.addExercises')"
      @click="emit('pick')"
    >
      <template #media><Plus :size="24" /></template>
      {{ t("training.page.addShort") }}
    </BaseMediaTab>
  </nav>
</template>
