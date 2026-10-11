<script setup lang="ts">
import { BaseButton, BaseConfirmSheet, BaseNotice } from "@form/ui";
import type { TrainingRow } from "./useTrainingSession";
import { useTranslation } from "../../../i18n";
import SessionStats from "./SessionStats.vue";

const { open, totals, elapsedMs, pending, saving, error } = defineProps<{
  open: boolean;
  totals: { readonly completedSets: number; readonly volumeKg: number };
  elapsedMs: number;
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
const { t } = useTranslation();
</script>

<template>
  <BaseConfirmSheet
    :open="open"
    intent="neutral"
    :title="t('dialogs.finish.title')"
    :description="t('dialogs.finish.description')"
    :cancel-label="t('dialogs.finish.keepTraining')"
    :confirm-label="t('dialogs.finish.save')"
    :busy="saving"
    :confirm-disabled="!!pending.length"
    :error="error"
    @cancel="emit('close')"
    @confirm="emit('finish')"
    @close-auto-focus="emit('close-auto-focus', $event)"
  >
    <SessionStats :totals="totals" :duration-ms="elapsedMs" />
    <BaseNotice v-if="pending.length">
      <p>
        {{ t("dialogs.finish.retained") }}
      </p>
      <ul :aria-label="t('dialogs.finish.retainedList')">
        <li v-for="row in pending" :key="row.set.id">
          {{
            t("dialogs.finish.retainedItem", {
              exercise: row.exercise.name,
              number: row.index + 1,
            })
          }}
        </li>
      </ul>
      <template #action>
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="saving"
          @click="emit('apply')"
        >
          {{ t("dialogs.finish.apply") }}
        </BaseButton>
        <BaseButton
          variant="link"
          size="sm"
          :disabled="saving"
          @click="emit('review')"
        >
          {{ t("dialogs.finish.review") }}
        </BaseButton>
      </template>
    </BaseNotice>
    <BaseNotice v-if="pending.some((row) => row.issue)" tone="danger">
      {{ t("dialogs.finish.attention") }}
    </BaseNotice>
  </BaseConfirmSheet>
</template>
