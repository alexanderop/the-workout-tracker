<script setup lang="ts">
import { ExercisesPage } from "../features/workouts/ui";
import { useWorkoutRouteContext } from "../app/workoutRouteContext";

definePage({ name: "exercises", path: "/exercises" });
const { workspace, dialogs, initialExerciseSearch } = useWorkoutRouteContext();
</script>

<template>
  <ExercisesPage
    :exercises="workspace.catalog.value"
    :initial-search="initialExerciseSearch"
    @create="dialogs?.openCreateExercise()"
  />
</template>
