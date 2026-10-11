<script setup lang="ts">
import { BaseStat, BaseStatGroup } from "@form/ui";
import { useFormat, useTranslation } from "../../../i18n";

// The three totals of a workout: sets logged, volume and duration. The finish
// sheet and the completed-workout review show them the same way.
defineProps<{
  totals: { readonly completedSets: number; readonly volumeKg: number };
  durationMs: number;
}>();
const { t } = useTranslation();
const format = useFormat();
</script>

<template>
  <BaseStatGroup :aria-label="t('dialogs.stats.group')">
    <BaseStat
      :value="totals.completedSets"
      :label="t('dialogs.stats.setsLogged')"
    />
    <BaseStat
      :value="format.number(totals.volumeKg)"
      :unit="t('workouts.metrics.kilograms')"
      :label="t('dialogs.stats.volume')"
    />
    <BaseStat
      v-bind="format.durationParts(durationMs)"
      :label="t('dialogs.stats.duration')"
    />
  </BaseStatGroup>
</template>
