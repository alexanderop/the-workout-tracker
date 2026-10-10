<script setup lang="ts">
import { BaseButton } from "@form/ui";
import { Clock3, ShieldCheck } from "@lucide/vue";
import { useTranslation } from "../../../i18n";
import { nextSetLabel, restLabel } from "./trainingLabels";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
const { workspace } = defineProps<{
  workspace: Pick<
    WorkoutWorkspace,
    "active" | "snapshot" | "saving" | "training" | "run" | "trainingMode"
  >;
}>();
const { t } = useTranslation();
const { active, snapshot, saving, training, run, trainingMode } = workspace;
</script>
<template>
  <aside v-if="active" class="workout-rest-panel">
    <Clock3 :size="20" /><strong>{{
      trainingMode?.kind === "resting"
        ? restLabel(trainingMode.remaining, t)
        : t("training.rest.ready")
    }}</strong>
    <p>{{ nextSetLabel(training.next.value, t) }}</p>
    <small>{{
      snapshot?.settings.autoRest
        ? t("training.rest.autoOn")
        : t("training.rest.autoOff")
    }}</small
    ><BaseButton
      v-if="trainingMode?.kind === 'resting'"
      variant="secondary"
      :disabled="saving"
      @click="run({ type: 'stop-rest', sessionId: active.id })"
      >{{
        trainingMode.remaining
          ? t("training.rest.skipRest")
          : t("training.rest.dismissTimer")
      }}</BaseButton
    >
    <p class="saved-indicator">
      <ShieldCheck :size="14" />{{
        saving ? t("training.rest.saving") : t("training.rest.saved")
      }}
    </p>
  </aside>
</template>
