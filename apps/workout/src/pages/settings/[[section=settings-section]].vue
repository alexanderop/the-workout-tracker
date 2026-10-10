<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { BaseScreenHeader } from "@form/ui";
import { ChevronLeft } from "@lucide/vue";
import { useRoute } from "vue-router";
import {
  WorkoutSettingsDelete,
  WorkoutSettingsExport,
  WorkoutSettingsImport,
  WorkoutSettingsTraining,
} from "../../features/workouts/ui";
import { useWorkoutRouteContext } from "../../app/workoutRouteContext";
import AppearanceSettings from "../../app/settings/AppearanceSettings.vue";
import InstallSettings from "../../app/settings/InstallSettings.vue";
import LanguageSettings from "../../app/settings/LanguageSettings.vue";
import SettingsHub from "../../app/settings/SettingsHub.vue";
import { useSectionLink } from "../../app/settings/useSectionLink";
import { useTranslation } from "../../i18n";

// One route for the hub (no section) and every detail page, so the state shared
// between them lives in this component for as long as Settings stays open.
definePage({ name: "settings" });
const route = useRoute("settings");
// The parsed path parameter: a known section, or none for the hub.
const section = computed(() => route.params.section);
const { workspace, installation } = useWorkoutRouteContext();
const { snapshot } = workspace;
const { installed, offlineReady, install } = installation;
const { t } = useTranslation();
const sectionLink = useSectionLink();
// While a backup runs, deleting data waits.
const backupBusy = ref(false);
const setBackupBusy = (busy: boolean) => {
  backupBusy.value = busy;
};
// The page just left, so the hub can give its row focus again.
const previousSection = ref<string | undefined>();
watch(section, (_, previous) => {
  previousSection.value = previous ?? undefined;
});
</script>

<template>
  <SettingsHub
    v-if="!section && snapshot"
    :auto-rest="snapshot.settings.autoRest"
    :rest-seconds="snapshot.settings.restSeconds"
    :installed="installed"
    :offline-ready="offlineReady"
    :returned-from="previousSection"
  />
  <div v-else-if="section" :key="section" class="settings-screen">
    <BaseScreenHeader :title="t(`settings.sections.${section}`)">
      <template #back>
        <a v-bind="sectionLink()"
          ><ChevronLeft :size="22" aria-hidden="true" />{{
            t("settings.back")
          }}</a
        >
      </template>
    </BaseScreenHeader>
    <div class="settings-body">
      <WorkoutSettingsTraining
        v-if="section === 'training'"
        :workspace="workspace"
      />
      <AppearanceSettings v-else-if="section === 'appearance'" />
      <LanguageSettings v-else-if="section === 'language'" />
      <InstallSettings
        v-else-if="section === 'install'"
        :installed="installed"
        :offline-ready="offlineReady"
        :on-install="install"
      />
      <WorkoutSettingsExport
        v-else-if="section === 'export'"
        :workspace="workspace"
        :busy="backupBusy"
        :on-busy-change="setBackupBusy"
      />
      <WorkoutSettingsImport
        v-else-if="section === 'import'"
        :workspace="workspace"
        :busy="backupBusy"
        :on-busy-change="setBackupBusy"
      />
      <WorkoutSettingsDelete v-else :workspace="workspace" :busy="backupBusy" />
    </div>
  </div>
</template>
