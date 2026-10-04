<script setup lang="ts">
import { useRoute } from "vue-router";
import { WorkoutsPage } from "../features/workouts/ui";
import { useWorkoutRouteContext } from "../app/workoutRouteContext";

definePage({
  name: "workouts",
  path: "/workouts",
  params: {
    query: {
      view: { parser: "workout-view", format: "value", default: "history" },
    },
  },
});

const route = useRoute("workouts");
const { workspace, dialogs, navigate, selectWorkoutView } =
  useWorkoutRouteContext();
const { snapshot, routines, history, active, saving } = workspace;
</script>

<template>
  <WorkoutsPage
    v-if="snapshot"
    :view="route.params.view"
    :routines="routines"
    :history="history"
    :active="active"
    :exercises="snapshot.exercises"
    :saving="saving"
    @update:view="selectWorkoutView"
    @start="dialogs?.startWorkout($event)"
    @edit="dialogs?.editRoutine($event)"
    @detail="dialogs?.showDetail($event)"
    @repeat="dialogs?.repeatWorkout($event)"
    @convert="dialogs?.convertWorkout($event)"
    @navigate="navigate"
  />
</template>
