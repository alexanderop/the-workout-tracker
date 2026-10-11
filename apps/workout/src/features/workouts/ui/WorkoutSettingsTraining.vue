<script setup lang="ts">
import {
  BaseButton,
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
      <BaseSwitch
        :aria-label="t('settings.training.autoRest.label')"
        :model-value="snapshot.settings.autoRest"
        :disabled="saving"
        @update:model-value="changeAutoRest"
      />
    </BaseListRow>
    <BaseListRow
      as="label"
      :label="t('settings.training.restDuration.label')"
      :description="t('settings.training.restDuration.hint')"
    >
      <BaseSelectNative
        class="input rest-select"
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
      <BaseSelectNative
        class="input rest-select"
        :aria-label="t('settings.training.bar.ariaLabel')"
        :model-value="barbell.barKg"
        :disabled="saving"
        @change="changeBar"
      >
        <option v-for="kg in barWeightsKg" :key="kg" :value="kg">
          {{ t("settings.training.bar.option", { weight: format.number(kg) }) }}
        </option>
      </BaseSelectNative>
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
        <BaseButton
          v-for="kg in plateSizesKg"
          :key="kg"
          type="button"
          variant="secondary"
          class="plate-option"
          :aria-pressed="barbell.platesKg.includes(kg)"
          :aria-label="
            t('settings.training.plates.toggleLabel', {
              weight: format.number(kg),
            })
          "
          :disabled="saving"
          @click="togglePlate(kg)"
          >{{
            t("settings.training.plates.toggle", { weight: format.number(kg) })
          }}</BaseButton
        >
      </div>
    </div>
  </BaseListGroup>
</template>

<style scoped>
.plate-settings {
  display: grid;
  gap: 4px;
  padding: 12px 16px 16px;
  border-block-start: 1px solid var(--rule);
}
.plate-settings-label {
  margin: 0;
  color: var(--text);
  font-size: 16px;
}
.plate-settings-hint {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.45;
}
.plate-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
  gap: 8px;
  margin-block-start: 8px;
}
.plate-option {
  min-height: 44px;
  font-variant-numeric: tabular-nums;
}
.plate-option[aria-pressed="true"] {
  background: var(--ui-primary);
  color: var(--ui-primary-foreground);
}
.rest-select {
  width: 104px;
  flex-shrink: 0;
  font-size: 16px;
}
</style>
