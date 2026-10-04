<script setup lang="ts">
import { Plus } from "@lucide/vue";
import type { Exercise } from "../domain";
import ExerciseCatalog from "./ExerciseCatalog.vue";
defineProps<{ exercises: readonly Exercise[] }>();
const emit = defineEmits<{ create: [] }>();
</script>
<template>
  <div class="page-heading">
    <div>
      <span class="eyebrow">YOUR MOVEMENT LIBRARY</span>
      <h1>Exercises</h1>
      <p class="muted">Find your next movement. Make it your own.</p>
    </div>
    <button class="btn secondary" @click="emit('create')">
      <Plus :size="17" />Create exercise
    </button>
  </div>
  <section class="panel catalog-panel">
    <ExerciseCatalog :exercises="exercises" />
  </section>
</template>
