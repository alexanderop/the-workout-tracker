<script setup lang="ts">
import { computed } from "vue";
import { BaseButton, BaseButtonIcon } from "@form/ui";
import { Check, History, Repeat } from "@lucide/vue";
import { useFormat, useTranslation } from "../../../i18n";
import type { SetSuggestion } from "../domain/exerciseHistory";

// Earlier values for the current set, aligned under its weight and reps.
// Tapping the values fills the set; the check fills and logs it at once.
const { suggestion, setNumber, exercise, busy } = defineProps<{
  suggestion: SetSuggestion;
  setNumber: number;
  exercise: string;
  busy: boolean;
}>();
const emit = defineEmits<{ fill: []; log: [] }>();
const { t } = useTranslation();
const format = useFormat();
const names = computed(() => {
  const values = {
    n: setNumber,
    exercise,
    values: t("training.setRow.suggestion", {
      weight: format.value.number(suggestion.weightKg),
      reps: suggestion.reps,
    }),
    source: t(
      suggestion.source === "previous"
        ? "training.setRow.suggestionPrevious"
        : "training.setRow.suggestionLastTime",
    ),
  };
  return {
    fill: t("training.setRow.suggestionFill", values),
    log: t("training.setRow.suggestionLog", values),
  };
});
</script>

<template>
  <div class="set-suggestion">
    <div class="set-suggestion-bar">
      <BaseButton
        type="button"
        variant="ghost"
        class="set-suggestion-fill"
        :aria-label="names.fill"
        :disabled="busy"
        @click="emit('fill')"
      >
        <span class="set-suggestion-source" aria-hidden="true">
          <Repeat v-if="suggestion.source === 'previous'" :size="18" />
          <History v-else :size="18" />
        </span>
        <span aria-hidden="true">{{ format.number(suggestion.weightKg) }}</span>
        <span aria-hidden="true">{{ suggestion.reps }}</span>
      </BaseButton>
      <BaseButtonIcon
        class="set-suggestion-log"
        :label="names.log"
        :disabled="busy"
        @click="emit('log')"
      >
        <Check :size="19" />
      </BaseButtonIcon>
    </div>
  </div>
</template>
