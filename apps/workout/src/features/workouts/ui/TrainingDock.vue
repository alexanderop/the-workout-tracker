<script setup lang="ts">
import { BaseButton } from "@form/ui";
import { duration } from "./presentation";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
const { workspace } = defineProps<{
  workspace: WorkoutWorkspace;
}>();
const { active, rest, saving, training, run, activeSetCount } = workspace;
const emit = defineEmits<{ finish: []; pick: [] }>();
const next = training.next;
function showNext() {
  if (!next.value || saving.value) return;
  training.selectSet(next.value.set.id);
  training.requestReviewFocus(next.value.set.id);
}
</script>
<template>
  <section v-if="active" class="training-bar" aria-label="Training controls">
    <template v-if="active.rest"
      ><div>
        <strong>{{ rest ? `${duration(rest)} rest` : "Rest complete" }}</strong
        ><small>{{
          next
            ? `Next: ${next.exercise.name} · Set ${next.index + 1}`
            : "All sets logged"
        }}</small>
      </div>
      <BaseButton
        variant="secondary"
        :disabled="saving"
        @click="run({ type: 'stop-rest', sessionId: active.id })"
        >{{ rest ? "Skip" : "Dismiss" }}</BaseButton
      ></template
    >
    <template v-else-if="next"
      ><BaseButton
        unstyled
        class="training-bar-next"
        :disabled="saving"
        @click="showNext"
      >
        <strong>Next: {{ next.exercise.name }}</strong
        ><small
          >Set {{ next.index + 1 }} of {{ next.exercise.sets.length }}</small
        >
      </BaseButton>
    </template>
    <template v-else-if="activeSetCount"
      ><div>
        <strong>All sets logged</strong
        ><small>Review or finish your workout</small>
      </div>
      <BaseButton
        :disabled="saving || workspace.workoutName.dirty.value"
        @click="emit('finish')"
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
