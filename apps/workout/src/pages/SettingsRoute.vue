<script setup lang="ts">
import { BaseButton } from "@form/ui";
import { WorkoutSettings } from "../features/workouts/ui";
import { useWorkoutRouteContext } from "../app/workoutRouteContext";

definePage({ name: "settings", path: "/settings" });
const { workspace, installation } = useWorkoutRouteContext();
const { installed, offlineReady, message, install } = installation;
</script>

<template>
  <WorkoutSettings :workspace="workspace">
    <section class="settings-section">
      <h2>Install app</h2>
      <div class="settings-row">
        <span
          >The Workout Tracker on your home screen<small
            >Open your journal like any other app.</small
          ></span
        ><BaseButton
          unstyled
          class="btn secondary"
          :disabled="installed"
          @click="install"
        >
          {{ installed ? "Installed" : "Install app" }}
        </BaseButton>
      </div>
      <p v-if="message" class="small" role="status">{{ message }}</p>
      <p class="muted small">
        {{
          offlineReady
            ? "Ready for offline use."
            : "Offline availability starts after the first complete load."
        }}
        No account. No cloud sync.
      </p>
    </section>
  </WorkoutSettings>
</template>
