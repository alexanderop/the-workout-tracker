<script setup lang="ts">
import {
  BaseChoiceChip,
  BaseListGroup,
  BaseListRow,
  BaseSelect,
  BaseSwitch,
} from "@form/ui";
import { computed, useId } from "vue";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import {
  barbellSettings,
  barWeightsKg,
  plateSizesKg,
  type Barbell,
} from "../domain";
import { useFormat, useTranslation } from "../../../i18n";

const { workspace } = defineProps<{
  workspace: Pick<WorkoutWorkspace, "snapshot" | "saving" | "run">;
}>();
const { t } = useTranslation();
const format = useFormat();
const platesId = useId();
const { snapshot, saving, run } = workspace;
const barbell = computed(() =>
  snapshot.value ? barbellSettings(snapshot.value.settings) : null,
);
function changeBarbell(change: Partial<Barbell>) {
  if (!snapshot.value || !barbell.value) return;
  void run({
    type: "settings",
    settings: {
      ...snapshot.value.settings,
      barbell: { ...barbell.value, ...change },
    },
  });
}
function changeBar(barKg: number | undefined) {
  if (barKg !== undefined) changeBarbell({ barKg });
}
function togglePlate(kg: number) {
  const owned = barbell.value?.platesKg ?? [];
  const next = owned.includes(kg)
    ? owned.filter((size) => size !== kg)
    : [...owned, kg];
  changeBarbell({
    platesKg: plateSizesKg.filter((size) => next.includes(size)),
  });
}
function changeAutoRest(autoRest: boolean) {
  if (!snapshot.value) return;
  void run({
    type: "settings",
    settings: { ...snapshot.value.settings, autoRest },
  });
}
const restDurations = computed(() =>
  [30, 60, 90, 120, 180, 300].map((seconds) => ({
    value: seconds,
    label: t("settings.training.restDuration.option", { seconds }),
  })),
);
const barWeights = computed(() =>
  barWeightsKg.map((kg) => ({
    value: kg,
    label: t("settings.training.bar.option", {
      weight: format.value.number(kg),
    }),
  })),
);
function changeRestDuration(restSeconds: number | undefined) {
  if (restSeconds !== undefined && snapshot.value)
    void run({
      type: "settings",
      settings: { ...snapshot.value.settings, restSeconds },
    });
}
</script>

<template>
  <BaseListGroup v-if="snapshot">
    <BaseListRow
      as="label"
      :label="t('settings.training.autoRest.label')"
      :description="t('settings.training.autoRest.hint')"
    >
      <template #trailing>
        <BaseSwitch
          :aria-label="t('settings.training.autoRest.label')"
          :model-value="snapshot.settings.autoRest"
          :disabled="saving"
          @update:model-value="changeAutoRest"
        />
      </template>
    </BaseListRow>
    <BaseListRow
      :label="t('settings.training.restDuration.label')"
      :description="t('settings.training.restDuration.hint')"
    >
      <template #trailing>
        <div class="rest-select">
          <BaseSelect
            :aria-label="t('settings.training.restDuration.ariaLabel')"
            :options="restDurations"
            :model-value="snapshot.settings.restSeconds"
            :disabled="saving"
            @update:model-value="changeRestDuration"
          />
        </div>
      </template>
    </BaseListRow>
    <BaseListRow
      :label="t('settings.training.weightUnit.label')"
      :value="t('settings.training.weightUnit.value')"
    />
    <BaseListRow
      v-if="barbell"
      :label="t('settings.training.bar.label')"
      :description="t('settings.training.bar.hint')"
    >
      <template #trailing>
        <div class="rest-select">
          <BaseSelect
            :aria-label="t('settings.training.bar.ariaLabel')"
            :options="barWeights"
            :model-value="barbell.barKg"
            :disabled="saving"
            @update:model-value="changeBar"
          />
        </div>
      </template>
    </BaseListRow>
    <div
      v-if="barbell"
      class="plate-settings"
      role="group"
      :aria-labelledby="`${platesId}-label`"
      :aria-describedby="`${platesId}-hint`"
    >
      <p :id="`${platesId}-label`" class="plate-settings-label">
        {{ t("settings.training.plates.label") }}
      </p>
      <p :id="`${platesId}-hint`" class="plate-settings-hint">
        {{ t("settings.training.plates.hint") }}
      </p>
      <div class="plate-options">
        <BaseChoiceChip
          v-for="kg in plateSizesKg"
          :key="kg"
          class="plate-option"
          :model-value="barbell.platesKg.includes(kg)"
          :aria-label="
            t('settings.training.plates.toggleLabel', {
              weight: format.number(kg),
            })
          "
          :disabled="saving"
          @update:model-value="togglePlate(kg)"
          >{{
            t("settings.training.plates.toggle", { weight: format.number(kg) })
          }}</BaseChoiceChip
        >
      </div>
    </div>
  </BaseListGroup>
</template>

<style scoped>
.plate-settings {
  display: grid;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4) var(--space-4);
  border-block-start: 1px solid var(--rule);
}
.plate-settings-label {
  margin: 0;
  color: var(--text);
  font-size: var(--text-base);
}
.plate-settings-hint {
  margin: 0;
  color: var(--muted);
  font-size: var(--text-sm);
  line-height: 1.45;
}
.plate-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
  gap: var(--space-2);
  margin-block-start: var(--space-2);
}
.plate-option {
  font-variant-numeric: tabular-nums;
}
.rest-select {
  min-width: 8.5em;
  flex-shrink: 0;
  font-size: var(--text-base);
}
</style>
