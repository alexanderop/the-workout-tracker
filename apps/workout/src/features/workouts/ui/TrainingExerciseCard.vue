<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";
import { BaseButton, BaseButtonIcon } from "@form/ui";
import { ChevronRight, Check, Ellipsis } from "@lucide/vue";
import { setTargetReps, type SessionExercise } from "../domain";
import type { useTrainingSession } from "./useTrainingSession";
import TrainingSetCircle from "./TrainingSetCircle.vue";
import { fmt } from "./presentation";
const { exercise, training, busy, completed, pinned } = defineProps<{
  exercise: SessionExercise;
  training: ReturnType<typeof useTrainingSession>;
  busy: boolean;
  completed: boolean;
  pinned: boolean;
}>();
const emit = defineEmits<{
  configure: [];
  edit: [setId: string];
  tap: [setId: string];
  release: [];
}>();
const open = ref(false);
const optionsButton =
  useTemplateRef<InstanceType<typeof BaseButtonIcon>>("optionsButton");
const circles =
  useTemplateRef<InstanceType<typeof TrainingSetCircle>[]>("circles");
const review = computed(() =>
  exercise.sets.some((set) => {
    const row = training.rows.get(set.id);
    return !!row && (row.touched || !!row.issue || !!row.storageIssue);
  }),
);
const expanded = computed(
  () => !completed || pinned || open.value || review.value,
);
const prescription = computed(() => {
  const planned = exercise.sets;
  const first = planned[0] ?? exercise.sets[0]!;
  const same = planned.every(
    (set) =>
      setTargetReps(set) === setTargetReps(first) &&
      set.weightKg === first.weightKg,
  );
  if (!same) return `${exercise.sets.length} sets · varied targets`;
  return `${exercise.sets.length} × ${setTargetReps(first)} · ${fmt(first.weightKg)} kg`;
});
defineExpose({
  exerciseId: exercise.id,
  focusOptions: () => {
    const element = optionsButton.value?.$el;
    if (element instanceof HTMLElement) element.focus({ preventScroll: true });
  },
  focusSet: (id: string) => {
    circles.value?.find((circle) => circle.setId === id)?.focus();
  },
});
</script>
<template>
  <article
    class="workout-exercise"
    :class="{ 'is-completed': completed && !pinned }"
  >
    <header>
      <div>
        <h2><Check v-if="completed" :size="16" />{{ exercise.name }}</h2>
        <p v-if="completed && !pinned" class="muted">
          {{ exercise.sets.length }}
          {{ exercise.sets.length === 1 ? "set" : "sets" }} logged
        </p>
      </div>
      <BaseButton
        v-if="completed && !pinned"
        variant="ghost"
        :aria-expanded="expanded"
        :aria-label="`Review ${exercise.name}`"
        @click="open = !open"
        >{{ expanded ? "Close" : "Review" }}</BaseButton
      >
      <BaseButtonIcon
        ref="optionsButton"
        :label="`Options for ${exercise.name}`"
        :disabled="busy"
        @click="emit('configure')"
        ><Ellipsis :size="18"
      /></BaseButtonIcon>
    </header>
    <p v-if="exercise.note" class="workout-exercise-note muted small">
      {{ exercise.note }}
    </p>
    <div v-if="expanded" class="workout-exercise-content">
      <BaseButton
        unstyled
        class="workout-prescription"
        :disabled="busy"
        :aria-label="`Edit sets, reps and weight for ${exercise.name}`"
        @click="emit('configure')"
        >{{ prescription }} <ChevronRight :size="14"
      /></BaseButton>
      <div class="workout-circles">
        <TrainingSetCircle
          v-for="set in exercise.sets"
          ref="circles"
          :key="set.id"
          :row="training.rows.get(set.id)!"
          :busy="busy"
          :needs-review="training.rows.get(set.id)!.touched"
          @tap="emit('tap', set.id)"
          @edit="emit('edit', set.id)"
        />
      </div>
      <div class="workout-exercise-actions">
        <BaseButton
          variant="ghost"
          :disabled="busy"
          @click="emit('edit', exercise.sets[0]!.id)"
          >Edit sets</BaseButton
        ><BaseButton
          v-if="pinned"
          variant="secondary"
          :disabled="busy"
          @click="emit('release')"
          >Move to completed</BaseButton
        >
      </div>
      <p v-if="pinned" class="muted small">
        All sets logged. You can still tap to correct reps before moving on.
      </p>
      <p v-if="review" class="workout-draft-alert" role="status">
        Input needs review. Open Edit sets to save or discard it.
      </p>
    </div>
  </article>
</template>

<style scoped>
.workout-exercise-note {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  margin-block: 12px;
}
</style>
