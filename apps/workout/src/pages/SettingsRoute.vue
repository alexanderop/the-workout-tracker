<script setup lang="ts">
import { BaseButton } from "@form/ui";
import { WorkoutSettings } from "../features/workouts/ui";
import { useWorkoutRouteContext } from "../app/workoutRouteContext";
import AppearanceSettings from "../app/AppearanceSettings.vue";
import LanguageSettings from "../app/LanguageSettings.vue";
import { useTranslation } from "../i18n";

definePage({ name: "settings", path: "/settings" });
const { workspace, installation } = useWorkoutRouteContext();
const { installed, offlineReady, install } = installation;
const { t } = useTranslation();
</script>

<template>
  <WorkoutSettings :workspace="workspace">
    <AppearanceSettings />
    <LanguageSettings />
    <section class="settings-section">
      <h2>{{ t("shell.install.settings.title") }}</h2>
      <div class="settings-row">
        <span
          >{{ t("shell.install.settings.home")
          }}<small>{{ t("shell.install.settings.hint") }}</small></span
        ><BaseButton
          unstyled
          class="btn secondary"
          :disabled="installed"
          @click="install"
        >
          {{
            installed
              ? t("shell.install.settings.installed")
              : t("shell.install.settings.install")
          }}
        </BaseButton>
      </div>
      <p class="muted small">
        {{
          offlineReady
            ? t("shell.install.settings.offlineReady")
            : t("shell.install.settings.offlineLater")
        }}
        {{ t("shell.install.settings.privacy") }}
      </p>
    </section>
  </WorkoutSettings>
</template>
