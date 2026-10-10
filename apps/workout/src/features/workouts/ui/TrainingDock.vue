<script setup lang="ts">
import { BaseButton } from "@form/ui";
import { useTranslation } from "../../../i18n";
import { nextSetLabel, restLabel } from "./trainingLabels";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
const { workspace } = defineProps<{
  workspace: WorkoutWorkspace;
}>();
const emit = defineEmits<{ finish: []; pick: [] }>();
const { t } = useTranslation();
const { active, saving, training, run, trainingMode, canFinish } = workspace;
function showNext() {
  const next = training.next.value;
  if (!next || saving.value) return;
  training.selectSet(next.set.id);
  training.requestReviewFocus(next.set.id);
}
</script>
<template>
  <section
    v-if="active && trainingMode"
    class="training-bar"
    :aria-label="t('training.dock.label')"
  >
    <template v-if="trainingMode.kind === 'resting'"
      ><div>
        <strong>{{ restLabel(trainingMode.remaining, t) }}</strong
        ><small>{{ nextSetLabel(trainingMode.next, t) }}</small>
      </div>
      <BaseButton
        variant="secondary"
        :disabled="saving"
        @click="run({ type: 'stop-rest', sessionId: active.id })"
        >{{
          trainingMode.remaining
            ? t("training.dock.skip")
            : t("training.dock.dismiss")
        }}</BaseButton
      ></template
    >
    <template v-else-if="trainingMode.kind === 'next'"
      ><BaseButton
        unstyled
        class="training-bar-next"
        :disabled="saving"
        @click="showNext"
      >
        <strong>{{
          t("training.dock.next", { exercise: trainingMode.row.exercise.name })
        }}</strong
        ><small>{{
          t("training.dock.setOf", {
            set: trainingMode.row.index + 1,
            total: trainingMode.row.exercise.sets.length,
          })
        }}</small>
      </BaseButton>
    </template>
    <template v-else-if="trainingMode.kind === 'all-logged'"
      ><div>
        <strong>{{ t("training.dock.allLogged") }}</strong
        ><small>{{ t("training.dock.reviewOrFinish") }}</small>
      </div>
      <BaseButton :disabled="!canFinish" @click="emit('finish')">{{
        t("training.dock.finish")
      }}</BaseButton></template
    >
    <template v-else
      ><div>
        <strong>{{ t("training.dock.chooseFirst") }}</strong>
      </div>
      <BaseButton :disabled="saving" @click="emit('pick')">{{
        t("training.dock.addExercise")
      }}</BaseButton></template
    >
  </section>
</template>
