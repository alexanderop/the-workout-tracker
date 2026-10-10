<script setup lang="ts">
import { ref } from "vue";
import { BaseButton } from "@form/ui";
import { ArrowDownToLine } from "@lucide/vue";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import { download } from "./presentation";
import { useTranslation } from "../../../i18n";

const { workspace, busy, onBusyChange } = defineProps<{
  workspace: Pick<WorkoutWorkspace, "service" | "saving">;
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
}>();
const { t } = useTranslation();
const message = ref("");

async function exportBackup() {
  onBusyChange(true);
  message.value = "";
  try {
    const exported = await workspace.service.exportBackup();
    if (exported.isErr()) {
      message.value = t("settings.backup.exportFailed");
      return;
    }
    download(
      exported.value,
      `the-workout-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`,
    );
    message.value = t("settings.backup.downloaded");
  } catch {
    message.value = t("settings.backup.exportFailed");
  } finally {
    onBusyChange(false);
  }
}
</script>

<template>
  <p class="settings-help">{{ t("settings.backup.intro") }}</p>
  <BaseButton
    class="settings-action"
    :disabled="busy || workspace.saving.value"
    @click="exportBackup"
  >
    <ArrowDownToLine :size="17" aria-hidden="true" />{{
      t("settings.backup.export")
    }}
  </BaseButton>
  <p role="status" class="settings-notice">{{ message }}</p>
</template>
