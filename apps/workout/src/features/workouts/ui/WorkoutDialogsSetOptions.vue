<script setup lang="ts">
import { BaseSheet, BaseButton, BaseButtonIcon } from "@form/ui";
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
        <BaseButtonIcon
          variant="secondary"
          :disabled="saving || Number(row.reps) <= 0"
          :label="t('dialogs.setOptions.decreaseReps')"
          @click="emit('adjust', -1)"
        >
          {{ "−" }}</BaseButtonIcon
        ><strong>{{
          t("dialogs.setOptions.reps", { reps: row.reps || "—" })
        }}</strong
        ><BaseButtonIcon
          variant="secondary"
          :disabled="saving || Number(row.reps) >= 1000"
          :label="t('dialogs.setOptions.increaseReps')"
          @click="emit('adjust', 1)"
        >
          +
        </BaseButtonIcon>
      </div>
      <BaseButton
        variant="secondary"
        class="full-width"
        :disabled="saving || row.exercise.sets.length <= 1"
        @click="emit('remove')"
      >
        {{ t("dialogs.setOptions.removeSet") }}
      </BaseButton>
    </template>
  </BaseSheet>
</template>
