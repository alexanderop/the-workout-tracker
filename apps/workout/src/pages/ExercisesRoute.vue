<script setup lang="ts">
import { ExercisesPage } from "../features/workouts/ui";
import { useWorkoutRouteContext } from "../app/workoutRouteContext";

definePage({ name: "exercises", path: "/exercises" });
const { workspace, dialogs } = useWorkoutRouteContext();
</script>

<template>
  <ExercisesPage
    :exercises="workspace.catalog.value"
    @create="dialogs?.openCreateExercise()"
  />
</template>
