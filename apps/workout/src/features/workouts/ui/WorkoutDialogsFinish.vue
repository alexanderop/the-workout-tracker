<script setup lang="ts">
import { BaseSheet, BaseButton } from "@form/ui";
import { Check } from "@lucide/vue";
import type { TrainingRow } from "./useTrainingSession";
import { useFormat, useTranslation } from "../../../i18n";

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
const { t } = useTranslation();
const format = useFormat();
</script>

<template>
  <BaseSheet
    :open="open"
    :title="t('dialogs.finish.title')"
    :description="t('dialogs.finish.description')"
    @close="emit('close')"
    @close-auto-focus="emit('close-auto-focus', $event)"
    ><div class="finish-stats">
      <div>
        <strong>{{ totals.completedSets }}</strong
        ><span>{{ t("dialogs.stats.setsLogged") }}</span>
      </div>
      <div>
        <strong>{{ format.number(totals.volumeKg) }}</strong
        ><span>{{ t("dialogs.stats.kgVolume") }}</span>
      </div>
      <div>
        <strong>{{ elapsed }}</strong
        ><span>{{ t("dialogs.stats.elapsed") }}</span>
      </div>
    </div>
    <div v-if="pending.length" class="draft-finish-notice">
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
      <BaseButton
        unstyled
        class="btn secondary"
        :disabled="saving"
        @click="emit('apply')"
      >
        {{ t("dialogs.finish.apply") }}
      </BaseButton>
      <BaseButton
        unstyled
        class="text-button"
        :disabled="saving"
        @click="emit('review')"
      >
        {{ t("dialogs.finish.review") }}
      </BaseButton>
      <p
        v-if="pending.some((row) => row.issue)"
        class="field-error"
        role="alert"
      >
        {{ t("dialogs.finish.attention") }}
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
        {{ t("dialogs.finish.keepTraining") }}</BaseButton
      ><BaseButton
        unstyled
        class="btn primary"
        :disabled="saving || !!pending.length"
        @click="emit('finish')"
      >
        {{ t("dialogs.finish.save") }}<Check :size="17" />
      </BaseButton></div
  ></BaseSheet>
</template>
