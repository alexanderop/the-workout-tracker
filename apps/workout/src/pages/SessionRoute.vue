<script setup lang="ts">
import { TrainingPage } from "../features/workouts/ui";
import { useWorkoutRouteContext } from "../app/workoutRouteContext";

definePage({ name: "session", path: "/session" });
const { workspace, dialogs, navigate, workoutsHref } = useWorkoutRouteContext();
</script>

<template>
  <TrainingPage
    :workspace="workspace"
    :workouts-href="workoutsHref"
    @finish="dialogs?.openFinish()"
    @pick="dialogs?.openPicker()"
    @options="dialogs?.showOptions($event)"
    @confirm="dialogs?.confirm($event)"
    @navigate="navigate"
  />
</template>
