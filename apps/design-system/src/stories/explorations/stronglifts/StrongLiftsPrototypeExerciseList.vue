<script setup lang="ts">
import { nextTick, useTemplateRef } from "vue";
import { BaseButton } from "@form/ui";
import StrongLiftsPrototypeExerciseListCircles from "./StrongLiftsPrototypeExerciseListCircles.vue";
import type { CircleExercise, CircleSet } from "./useCircleWorkout";
const { active, completed, editing } = defineProps<{
  active: CircleExercise[];
  completed: CircleExercise[];
  editing: boolean;
}>();
const emit = defineEmits<{
  weight: [exercise: CircleExercise];
  tap: [set: CircleSet];
  edit: [set: CircleSet, index: number, exercise: CircleExercise];
  add: [];
  finish: [];
}>();
const heading = useTemplateRef<HTMLHeadingElement>("heading");
async function log(set: CircleSet, exercise: CircleExercise) {
  const last =
    set.reps === null &&
    exercise.sets.filter((item) => item.reps === null).length === 1;
  emit("tap", set);
  if (!last) return;
  await nextTick();
  heading.value?.focus({ preventScroll: true });
}
</script>
<template>
  <div class="sl-worklist">
    <div class="sl-stage">
      <h3 ref="heading" tabindex="-1">
        {{ active.length || !completed.length ? "To do" : "All sets logged" }}
      </h3>
      <span>{{ active.length }} remaining</span>
    </div>
    <div v-if="!active.length && !completed.length" class="sl-start">
      <h3>Make it your workout.</h3>
      <p>Add your first exercise. Your session builds from here.</p>
    </div>
    <div v-if="!active.length && completed.length" class="sl-start">
      <h3>That’s your last set.</h3>
      <p>Review your work below, or add another exercise.</p>
      <BaseButton @click="emit('finish')">Finish workout</BaseButton>
    </div>
    <StrongLiftsPrototypeExerciseListCircles
      v-for="exercise in active"
      :key="exercise.name"
      :exercise="exercise"
      :editing="editing"
      @weight="emit('weight', exercise)"
      @tap="(set) => log(set, exercise)"
      @edit="(set, index) => emit('edit', set, index, exercise)"
    />
    <BaseButton class="sl-add" variant="secondary" @click="emit('add')"
      >+ Add exercise</BaseButton
    >
    <section
      v-if="completed.length"
      class="sl-completed"
      aria-label="Completed exercises"
    >
      <header>
        <h3>Completed</h3>
        <span
          >{{ completed.length }}
          {{ completed.length === 1 ? "exercise" : "exercises" }}</span
        >
      </header>
      <details v-for="exercise in completed" :key="exercise.name">
        <summary>
          <span
            >✓ {{ exercise.name
            }}<small
              >{{ exercise.sets.length }} sets logged ·
              {{ exercise.sets.reduce((sum, set) => sum + (set.reps ?? 0), 0) }}
              reps</small
            ></span
          ><span>Review</span>
        </summary>
        <StrongLiftsPrototypeExerciseListCircles
          :exercise="exercise"
          editing
          @weight="emit('weight', exercise)"
          @edit="(set, index) => emit('edit', set, index, exercise)"
        />
      </details>
      <p>
        All planned sets recorded, including missed reps. Open to correct or
        clear a set.
      </p>
    </section>
  </div>
</template>
