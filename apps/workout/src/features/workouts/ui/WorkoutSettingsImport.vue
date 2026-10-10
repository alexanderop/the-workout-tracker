<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { BaseButton } from "@form/ui";
import { Upload } from "@lucide/vue";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import { Conflict } from "../domain";
import { describeFailure } from "./errorMessages";
import { useTranslation } from "../../../i18n";

const { workspace, busy, onBusyChange } = defineProps<{
  workspace: Pick<WorkoutWorkspace, "snapshot" | "saving" | "importBackup">;
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
}>();
const { t } = useTranslation();
const { snapshot, saving, importBackup: importData } = workspace;
// The pending selection lives only as long as this page: leaving it drops the file.
const backupFile = ref<{ name: string; json: string; revision: number } | null>(
  null,
);
const message = ref("");
const importInput = useTemplateRef<HTMLInputElement>("importInput");

async function selectBackup(event: Event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  const file = input.files?.[0];
  if (!file) return;
  if (file.size > 20_000_000) {
    message.value = t("settings.backup.tooLarge");
    input.value = "";
    return;
  }
  try {
    backupFile.value = {
      name: file.name,
      json: await file.text(),
      revision: snapshot.value?.revision ?? 0,
    };
    message.value = "";
  } catch {
    message.value = t("settings.backup.unreadableFile");
  }
  input.value = "";
}
async function importBackup() {
  const file = backupFile.value;
  if (!file || busy || saving.value) return;
  onBusyChange(true);
  try {
    const result = await importData(file.json, file.revision);
    if (!result) return;
    if (result.isOk()) {
      backupFile.value = null;
      message.value = t("settings.backup.imported");
      return;
    }
    if (Conflict.is(result.error)) {
      backupFile.value = null;
      message.value = t("settings.backup.changed");
      return;
    }
    message.value = describeFailure(result.error, t).message;
  } catch {
    message.value = t("settings.backup.importFailed");
  } finally {
    onBusyChange(false);
  }
}
</script>

<template>
  <p class="settings-help">{{ t("settings.backup.importIntro") }}</p>
  <BaseButton
    variant="secondary"
    class="settings-action"
    :disabled="busy || saving"
    @click="importInput?.click()"
  >
    <Upload :size="17" aria-hidden="true" />{{ t("settings.backup.import") }}
  </BaseButton>
  <input
    ref="importInput"
    class="sr-only"
    tabindex="-1"
    type="file"
    accept="application/json,.json"
    :aria-label="t('settings.backup.fileLabel')"
    @change="selectBackup"
  />
  <div v-if="backupFile" class="import-preview">
    <strong>{{ backupFile.name }}</strong>
    <p class="settings-help">{{ t("settings.backup.previewHint") }}</p>
    <div class="form-actions">
      <BaseButton
        variant="secondary"
        :disabled="busy"
        @click="backupFile = null"
      >
        {{ t("settings.backup.cancelImport") }}
      </BaseButton>
      <BaseButton :disabled="busy || saving" @click="importBackup">
        {{
          busy
            ? t("settings.backup.importing")
            : t("settings.backup.importThis")
        }}
      </BaseButton>
    </div>
  </div>
  <p role="status" class="settings-notice">{{ message }}</p>
</template>
