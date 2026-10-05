<script setup lang="ts">
import { useTemplateRef } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { TrainingPage } from "../features/workouts/ui";
import { useWorkoutRouteContext } from "../app/workoutRouteContext";

definePage({ name: "session", path: "/session" });
const { workspace, dialogs, navigate, workoutsHref } = useWorkoutRouteContext();
const trainingPage = useTemplateRef<InstanceType<typeof TrainingPage>>("trainingPage");
onBeforeRouteLeave(() => trainingPage.value?.requestLeave() ?? true);
</script>

<template>
  <TrainingPage
    ref="trainingPage"
    :workspace="workspace"
    :workouts-href="workoutsHref"
    @finish="dialogs?.openFinish()"
    @pick="dialogs?.openPicker()"
    @options="dialogs?.showOptions($event)"
    @confirm="dialogs?.confirm($event)"
    @navigate="navigate"
  />
</template>
