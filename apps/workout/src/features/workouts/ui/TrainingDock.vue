<script setup lang="ts">
import { Button } from "@form/ui";
import { ArrowLeft } from "@lucide/vue";
import { duration } from "./presentation";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
const { workspace, workoutsHref } = defineProps<{
  workspace: WorkoutWorkspace;
  workoutsHref: string;
}>();
const { active, rest, saving, training, run, activeSetCount } = workspace;
const emit = defineEmits<{ finish: []; pick: [] }>();
const next = training.next;
</script>
<template>
  <section v-if="active" class="training-bar" aria-label="Training controls">
    <a :href="workoutsHref" class="training-bar-back" aria-label="Back to workouts"
      ><ArrowLeft :size="20"
    /></a>
    <template v-if="active.rest"
      ><div>
        <strong>{{ rest ? `${duration(rest)} rest` : "Rest complete" }}</strong
        ><small
          >{{ next ? `Next: ${next.exercise.name} · Set ${next.index + 1}` : "All sets logged" }}</small
        >
      </div>
      <Button
        variant="secondary"
        :disabled="saving"
        @click="run({ type: 'stop-rest', sessionId: active.id })"
        >{{ rest ? "Skip" : "Dismiss" }}</Button
      ></template
    >
    <template v-else-if="next"
      ><div>
        <strong>Next: {{ next.exercise.name }}</strong
        ><small>Set {{ next.index + 1 }} of {{ next.exercise.sets.length }}</small>
      </div>
      </template
    >
    <template v-else-if="activeSetCount"
      ><div>
        <strong>All sets logged</strong
        ><small>Review or finish your workout</small>
      </div>
      <Button :disabled="saving" @click="emit('finish')"
        >Finish</Button
      ></template
    >
    <template v-else
      ><div><strong>Choose your first exercise</strong></div>
      <Button :disabled="saving" @click="emit('pick')"
        >Add exercise</Button
      ></template
    >
  </section>
</template>
