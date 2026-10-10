<script setup lang="ts">
import { BaseButton, BaseButtonIcon } from "@form/ui";
import { Pencil } from "@lucide/vue";
import { useFormat, useTranslation } from "../../../i18n";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
const { workspace } = defineProps<{
  workspace: Pick<
    WorkoutWorkspace,
    "active" | "saving" | "activeTotals" | "activeSetCount" | "elapsed" | "canFinish"
  >;
}>();
const emit = defineEmits<{ finish: []; rename: [] }>();
const { active, saving, activeTotals, activeSetCount, elapsed, canFinish } = workspace;
const { t } = useTranslation();
const format = useFormat();
</script>
<template>
  <template v-if="active">
    <header class="active-workout-heading">
      <div>
        <p class="eyebrow">{{ t("training.page.eyebrow", { elapsed }) }}</p>
        <div class="workout-title">
          <h1>{{ active.name }}</h1>
          <BaseButtonIcon :label="t('training.page.renameWorkout')" :disabled="saving" @click="emit('rename')"><Pencil :size="16" /></BaseButtonIcon>
        </div>
      </div>
      <BaseButton
        variant="secondary"
        class="active-workout-finish"
        :disabled="!canFinish"
        @click="emit('finish')"
        >{{ t("training.page.finish") }}</BaseButton
      >
    </header>
    <div class="active-workout-metrics">
      <span v-if="!activeTotals.completedSets">{{ t("training.page.exerciseCount", active.exercises.length) }}</span
      ><span v-else>{{ t("training.page.setsLogged", { logged: activeTotals.completedSets, total: activeSetCount }) }}</span
      ><span v-if="activeTotals.completedSets">{{ t("training.page.lifted", { volume: format.number(activeTotals.volumeKg) }) }}</span>
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
