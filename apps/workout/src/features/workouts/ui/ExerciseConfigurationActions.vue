<script setup lang="ts">
import { BaseButton } from "@form/ui";
import { ArrowLeftRight, List, Plus, StickyNote, Trash2 } from "@lucide/vue";
import { useTranslation } from "../../../i18n";
import type { SessionExercise } from "../domain";
const { exercise, saving, canAdd, repsSummary, weightSummary } = defineProps<{
  exercise: SessionExercise;
  saving: boolean;
  canAdd: boolean;
  repsSummary: string;
  weightSummary: string;
}>();
const emit = defineEmits<{
  configure: [field?: "targetReps" | "workingWeight"];
  note: [];
  replace: [];
  remove: [exercise: SessionExercise];
  edit: [setId: string];
  add: [];
}>();
const { t } = useTranslation();
</script>
<template>
  <div class="exercise-option-targets">
    <BaseButton
      variant="secondary"
      :disabled="saving"
      @click="emit('configure')"
      >{{ t("training.config.setCount", exercise.sets.length) }}</BaseButton
    >
    <BaseButton
      variant="secondary"
      :disabled="saving"
      @click="emit('configure', 'targetReps')"
      >{{ repsSummary }}</BaseButton
    >
    <BaseButton
      variant="secondary"
      :disabled="saving"
      @click="emit('configure', 'workingWeight')"
      >{{ weightSummary }}</BaseButton
    >
  </div>
  <div class="exercise-option-group">
    <BaseButton
      variant="secondary"
      :disabled="saving"
      @click="exercise.sets[0] && emit('edit', exercise.sets[0].id)"
      ><List :size="18" />{{ t("training.config.editSets") }}</BaseButton
    >
    <BaseButton variant="secondary" :disabled="saving" @click="emit('note')"
      ><StickyNote :size="18" />{{
        exercise.note
          ? t("training.config.editNote")
          : t("training.config.addNote")
      }}</BaseButton
    >
  </div>
  <div class="exercise-option-group">
    <BaseButton variant="secondary" :disabled="saving" @click="emit('replace')"
      ><ArrowLeftRight :size="18" />{{
        t("training.config.replaceExercise")
      }}</BaseButton
    >
    <BaseButton
      variant="secondary"
      :disabled="saving"
      @click="emit('remove', exercise)"
      ><Trash2 :size="18" />{{ t("training.config.removeExercise") }}</BaseButton
    >
  </div>
  <BaseButton
    variant="ghost"
    :disabled="saving || !canAdd"
    @click="emit('add')"
    ><Plus :size="18" />{{ t("training.config.addExercises") }}</BaseButton
  >
</template>
<style scoped>
.exercise-option-targets {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.exercise-option-targets :deep(button) {
  padding-inline: 8px;
}
.exercise-option-targets :deep(button) {
  border-radius: 12px;
  min-height: 58px;
}
.exercise-option-group {
  display: grid;
  overflow: clip;
  background: var(--surface);
  border-radius: 10px;
}
.exercise-option-group :deep(button) {
  justify-content: flex-start;
  gap: 14px;
  min-height: 52px;
  padding-inline: 18px;
  border: 0;
  border-radius: 0;
  font-size: 16px;
  font-weight: 450;
}
.exercise-option-group :deep(button + button) {
  border-block-start: 1px solid var(--background);
}
.exercise-option-group :deep(button svg) {
  color: var(--muted);
}
</style>
