<script setup lang="ts">
import { BaseButton } from "@form/ui";
import { nextSetLabel, restLabel } from "./presentation";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
const { workspace } = defineProps<{
  workspace: WorkoutWorkspace;
}>();
const emit = defineEmits<{ finish: []; pick: [] }>();
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
    aria-label="Training controls"
  >
    <template v-if="trainingMode.kind === 'resting'"
      ><div>
        <strong>{{ restLabel(trainingMode.remaining) }}</strong
        ><small>{{ nextSetLabel(trainingMode.next) }}</small>
      </div>
      <BaseButton
        variant="secondary"
        :disabled="saving"
        @click="run({ type: 'stop-rest', sessionId: active.id })"
        >{{ trainingMode.remaining ? "Skip" : "Dismiss" }}</BaseButton
      ></template
    >
    <template v-else-if="trainingMode.kind === 'next'"
      ><BaseButton
        unstyled
        class="training-bar-next"
        :disabled="saving"
        @click="showNext"
      >
        <strong>Next: {{ trainingMode.row.exercise.name }}</strong
        ><small
          >Set {{ trainingMode.row.index + 1 }} of
          {{ trainingMode.row.exercise.sets.length }}</small
        >
      </BaseButton>
    </template>
    <template v-else-if="trainingMode.kind === 'all-logged'"
      ><div>
        <strong>All sets logged</strong
        ><small>Review or finish your workout</small>
      </div>
      <BaseButton :disabled="!canFinish" @click="emit('finish')"
        >Finish</BaseButton
      ></template
    >
    <template v-else
      ><div><strong>Choose your first exercise</strong></div>
      <BaseButton :disabled="saving" @click="emit('pick')"
        >Add exercise</BaseButton
      ></template
    >
  </section>
</template>
