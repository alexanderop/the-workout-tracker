<script setup lang="ts">
import {
  BaseListGroup,
  BaseListRow,
  BaseSelectNative,
  BaseSwitch,
} from "@form/ui";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import { useTranslation } from "../../../i18n";

const { workspace } = defineProps<{
  workspace: Pick<WorkoutWorkspace, "snapshot" | "saving" | "run">;
}>();
const { t } = useTranslation();
const { snapshot, saving, run } = workspace;
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
  </BaseListGroup>
</template>

<style scoped>
.rest-select {
  width: 104px;
  flex-shrink: 0;
  font-size: 16px;
}
</style>
