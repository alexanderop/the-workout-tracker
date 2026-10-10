<script setup lang="ts">
import { BaseSheet, BaseButton } from "@form/ui";
import type { TrainingRow } from "./useTrainingSession";
import { useTranslation } from "../../../i18n";

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
const { t } = useTranslation();
</script>

<template>
  <BaseSheet
    :open="!!row"
    :title="
      row
        ? t('dialogs.setOptions.title', {
            number: row.index + 1,
            exercise: row.exercise.name,
          })
        : t('dialogs.setOptions.fallbackTitle')
    "
    :description="t('dialogs.setOptions.description')"
    @close="emit('close')"
  >
    <template v-if="row">
      <BaseButton
        v-if="row.set.completed"
        variant="secondary"
        :disabled="saving || row.touched"
        @click="emit('undo', row.set.id)"
        >{{ t("dialogs.setOptions.undoLog") }}</BaseButton
      >
      <div class="repetition-adjuster">
        <BaseButton
          unstyled
          class="btn secondary"
          :disabled="saving || Number(row.reps) <= 0"
          :aria-label="t('dialogs.setOptions.decreaseReps')"
          @click="emit('adjust', -1)"
        >
          {{ "−" }}</BaseButton
        ><strong>{{
          t("dialogs.setOptions.reps", { reps: row.reps || "—" })
        }}</strong
        ><BaseButton
          unstyled
          class="btn secondary"
          :disabled="saving || Number(row.reps) >= 1000"
          :aria-label="t('dialogs.setOptions.increaseReps')"
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
        {{ t("dialogs.setOptions.removeSet") }}
      </BaseButton>
    </template>
  </BaseSheet>
</template>
