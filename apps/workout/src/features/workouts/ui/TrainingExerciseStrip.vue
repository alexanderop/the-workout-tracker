<script setup lang="ts">
import { BaseButton } from "@form/ui";
import { Plus, Check } from "@lucide/vue";
import { useTranslation } from "../../../i18n";
import ExerciseThumbnail from "./ExerciseThumbnail.vue";
import { isExerciseComplete } from "./presentation";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
const { workspace } = defineProps<{
  workspace: Pick<WorkoutWorkspace, "active" | "snapshot" | "saving" | "training">;
}>();
const emit = defineEmits<{ pick: [] }>();
const { active, snapshot, saving, training } = workspace;
const { t } = useTranslation();
const selectedExercise = training.currentExercise;
</script>
<template>
  <nav v-if="active?.exercises.length" class="workout-exercise-strip" :aria-label="t('training.page.exercisesNav')">
    <BaseButton
      v-for="exercise in active.exercises" :key="exercise.id" unstyled
      class="workout-exercise-tab"
      :aria-current="selectedExercise?.id === exercise.id ? 'true' : undefined"
      :aria-label="isExerciseComplete(exercise) ? t('training.page.tabAllLogged', { exercise: exercise.name }) : exercise.name"
      @click="training.selectExercise(exercise.id)"
    >
      <ExerciseThumbnail :exercise="snapshot?.exercises[exercise.exerciseId]" />
      <span class="workout-exercise-tab-name">{{ exercise.name }}</span>
      <Check v-if="isExerciseComplete(exercise)" class="workout-exercise-tab-check" :size="15" />
    </BaseButton>
    <BaseButton unstyled class="workout-exercise-tab workout-exercise-tab-add" :disabled="saving || active.exercises.length >= 50" :aria-label="t('training.page.addExercises')" @click="emit('pick')"><span><Plus :size="24" /></span><span class="workout-exercise-tab-name">{{ t("training.page.addShort") }}</span></BaseButton>
  </nav>
</template>
