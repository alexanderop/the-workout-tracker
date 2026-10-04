<script setup lang="ts">
import { Button } from "@form/ui";
import { computed } from "vue";
import { ArrowLeft } from "@lucide/vue";
import { duration } from "./presentation";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
const { workspace } = defineProps<{
  workspace: Pick<
    WorkoutWorkspace,
    "active" | "rest" | "saving" | "training" | "activeSetCount" | "run"
  >;
}>();
const { active, rest, saving, training, activeSetCount, run } = workspace;
const emit = defineEmits<{ finish: []; pick: [] }>();
const nextExercise = computed(() =>
  active.value?.exercises.find((exercise) =>
    exercise.sets.some((set) => !set.completed),
  ),
);
function advance() {
  if (nextExercise.value) {
    training.selectExercise(nextExercise.value.id);
    return;
  }
  emit("finish");
}
</script>

<template>
  <section v-if="active" class="training-bar" aria-label="Training controls">
    <a href="#/workouts" class="training-bar-back" aria-label="Back to workouts"
      ><ArrowLeft :size="20" aria-hidden="true"
    /></a>
    <template v-if="rest > 0 && nextExercise">
      <div>
        <strong>{{ duration(rest) }} rest</strong>
        <small
          >Next:
          {{
            training.current.value?.exercise.name ?? nextExercise.name
          }}</small
        >
      </div>
      <Button
        class="btn primary"
        :disabled="saving"
        @click="run({ type: 'stop-rest', sessionId: active.id })"
      >
        End rest
      </Button>
    </template>
    <template v-else-if="training.current.value">
      <div>
        <strong>{{ training.current.value.exercise.name }}</strong
        ><small
          >Set {{ training.current.value.index + 1 }} of
          {{ training.current.value.exercise.sets.length }} ·
          {{ training.current.value.weight || "—" }} kg ×
          {{ training.current.value.reps || "—" }}</small
        >
      </div>
      <Button
        class="btn primary"
        type="submit"
        :form="`set-form-${training.current.value.set.id}`"
        :disabled="saving"
      >
        {{
          training.current.value.set.completed
            ? training.dirty(training.current.value)
              ? "Update set"
              : "Undo set"
            : "Log set"
        }}
      </Button>
    </template>
    <template v-else-if="activeSetCount">
      <div>
        <strong>{{
          active.exercises.every((exercise) =>
            exercise.sets.every((set) => set.completed),
          )
            ? "All sets logged"
            : "Exercise complete"
        }}</strong
        ><small
          v-if="
            active.exercises.some((exercise) =>
              exercise.sets.some((set) => !set.completed),
            )
          "
          >Next: {{ nextExercise?.name }}</small
        >
      </div>
      <Button class="btn primary" :disabled="saving" @click="advance">
        {{ nextExercise ? "Next exercise" : "Finish workout" }}
      </Button>
    </template>
    <template v-else>
      <div>
        <strong>Choose your first exercise</strong>
      </div>
      <Button class="btn primary" @click="emit('pick')">Choose exercise</Button>
    </template>
  </section>
</template>
