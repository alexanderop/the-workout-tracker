<script setup lang="ts">
import { ChevronRight } from "@lucide/vue";
import StrongLiftsPrototypeExerciseListCirclesSet from "./StrongLiftsPrototypeExerciseListCirclesSet.vue";
import type { CircleExercise, CircleSet } from "./useCircleWorkout";
const { exercise, editing } = defineProps<{
  exercise: CircleExercise;
  editing: boolean;
}>();
const emit = defineEmits<{
  weight: [];
  tap: [set: CircleSet];
  edit: [set: CircleSet, index: number];
}>();
</script>
<template>
  <section class="sl-exercise">
    <header>
      <h3>{{ exercise.name }}</h3>
      <button
        class="sl-weight"
        :aria-label="`Configure ${exercise.name}: ${exercise.sets.length} sets, ${exercise.target} target reps, ${exercise.weight} kg`"
        @click="emit('weight')"
      >
        <small>{{ exercise.sets.length }} × {{ exercise.target }}</small>
        {{ exercise.weight }} kg <ChevronRight :size="15" />
      </button>
    </header>
    <div class="sl-set-row">
      <StrongLiftsPrototypeExerciseListCirclesSet
        v-for="(set, index) in exercise.sets"
        :key="set.id"
        :set="set"
        :exercise="exercise.name"
        :number="index + 1"
        :editing="editing"
        @tap="emit('tap', set)"
        @edit="emit('edit', set, index)"
      />
    </div>
    <p
      v-if="exercise.sets.some((set) => set.weight !== exercise.weight)"
      class="sl-set-weights"
    >
      Set weights:
      {{ exercise.sets.map((set) => `${set.weight}`).join(" · ") }} kg
    </p>
  </section>
</template>
