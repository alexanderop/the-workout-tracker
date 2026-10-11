<script setup lang="ts">
import {
  BaseChoiceChip,
  BaseListGroup,
  BaseListRow,
  BaseSelectNative,
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
function changeBar(event: Event) {
  if (event.target instanceof HTMLSelectElement)
    changeBarbell({ barKg: Number(event.target.value) });
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
function changeRestDuration(event: Event) {
  if (event.target instanceof HTMLSelectElement && snapshot.value)
    void run({
      type: "settings",
      settings: {
        ...snapshot.value.settings,
        restSeconds: Number(event.target.value),
      },
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
      as="label"
      :label="t('settings.training.restDuration.label')"
      :description="t('settings.training.restDuration.hint')"
    >
      <template #trailing>
        <BaseSelectNative
          class="rest-select"
          :aria-label="t('settings.training.restDuration.ariaLabel')"
          :model-value="snapshot.settings.restSeconds"
          :disabled="saving"
          @change="changeRestDuration"
        >
          <option
            v-for="seconds in [30, 60, 90, 120, 180, 300]"
            :key="seconds"
            :value="seconds"
          >
            {{ t("settings.training.restDuration.option", { seconds }) }}
          </option>
        </BaseSelectNative>
      </template>
    </BaseListRow>
    <BaseListRow
      :label="t('settings.training.weightUnit.label')"
      :value="t('settings.training.weightUnit.value')"
    />
    <BaseListRow
      v-if="barbell"
      as="label"
      :label="t('settings.training.bar.label')"
      :description="t('settings.training.bar.hint')"
    >
      <template #trailing>
        <BaseSelectNative
          class="rest-select"
          :aria-label="t('settings.training.bar.ariaLabel')"
          :model-value="barbell.barKg"
          :disabled="saving"
          @change="changeBar"
        >
          <option v-for="kg in barWeightsKg" :key="kg" :value="kg">
            {{
              t("settings.training.bar.option", { weight: format.number(kg) })
            }}
          </option>
        </BaseSelectNative>
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
  width: 104px;
  flex-shrink: 0;
  font-size: var(--text-base);
}
</style>
