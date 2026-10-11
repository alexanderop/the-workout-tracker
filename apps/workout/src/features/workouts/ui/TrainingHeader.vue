<script setup lang="ts">
import { BaseButton, BaseButtonIcon, BasePageHeader } from "@form/ui";
import { Pencil } from "@lucide/vue";
import { useFormat, useTranslation } from "../../../i18n";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
const { workspace } = defineProps<{
  workspace: Pick<
    WorkoutWorkspace,
    | "active"
    | "saving"
    | "activeTotals"
    | "activeSetCount"
    | "elapsed"
    | "canFinish"
  >;
}>();
const emit = defineEmits<{ finish: []; rename: [] }>();
defineSlots<{ back?: () => unknown }>();
const { active, saving, activeTotals, activeSetCount, elapsed, canFinish } =
  workspace;
const { t } = useTranslation();
const format = useFormat();
</script>
<template>
  <template v-if="active">
    <BasePageHeader variant="detail" :title="active.name">
      <template #back><slot name="back" /></template>
      <template #action>
        <BaseButton
          variant="secondary"
          class="active-workout-finish"
          :disabled="!canFinish"
          @click="emit('finish')"
          >{{ t("training.page.finish") }}</BaseButton
        >
      </template>
    </BasePageHeader>
    <div class="active-workout-heading">
      <p class="eyebrow">{{ t("training.page.eyebrow", { elapsed }) }}</p>
      <BaseButtonIcon
        :label="t('training.page.renameWorkout')"
        :disabled="saving"
        @click="emit('rename')"
        ><Pencil :size="16"
      /></BaseButtonIcon>
    </div>
    <div class="active-workout-metrics">
      <span v-if="!activeTotals.completedSets">{{
        t("training.page.exerciseCount", active.exercises.length)
      }}</span
      ><span v-else>{{
        t("training.page.setsLogged", {
          logged: activeTotals.completedSets,
          total: activeSetCount,
        })
      }}</span
      ><span v-if="activeTotals.completedSets">{{
        t("training.page.lifted", {
          volume: format.number(activeTotals.volumeKg),
        })
      }}</span>
    </div>
    <div class="workout-progress-space">
      <progress
        v-if="activeTotals.completedSets"
        class="active-workout-progress"
        :value="activeTotals.completedSets"
        :max="activeSetCount"
        :aria-label="t('training.page.loggedSetsProgress')"
      />
    </div>
  </template>
</template>
