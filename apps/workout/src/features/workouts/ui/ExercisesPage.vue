<script setup lang="ts">
import { BaseButton } from "@form/ui";
import type { Exercise } from "../domain";
import ExerciseCatalog from "./ExerciseCatalog.vue";
defineProps<{ exercises: readonly Exercise[]; initialSearch?: string }>();
const emit = defineEmits<{ create: [] }>();
</script>
<template>
  <div class="page-heading exercise-library-heading">
    <div>
      <h1>Exercises</h1>
    </div>
    <BaseButton
      type="button"
      unstyled
      class="text-button"
      @click="emit('create')"
    >
      Create
    </BaseButton>
  </div>
  <section class="catalog-panel">
    <ExerciseCatalog :exercises="exercises" :initial-search="initialSearch" />
  </section>
</template>
