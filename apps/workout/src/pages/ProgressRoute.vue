<script setup lang="ts">
import { ProgressPage } from "../features/workouts/ui";
import { useWorkoutRouteContext } from "../app/workoutRouteContext";

definePage({ name: "progress", path: "/progress" });
const { workspace, progressExercise, navigate } = useWorkoutRouteContext();
</script>

<template>
  <ProgressPage
    v-model:exercise="progressExercise"
    :history="workspace.history.value"
    @navigate="navigate"
  />
</template>
