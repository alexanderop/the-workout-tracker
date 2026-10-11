<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import {
  BaseActions,
  BaseButton,
  BaseFileInput,
  BaseNotice,
  type NoticeTone,
} from "@form/ui";
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
const status = ref<{ tone: NoticeTone; text: string } | null>(null);
const report = (tone: NoticeTone, text: string) => {
  status.value = { tone, text };
};
const importInput =
  useTemplateRef<InstanceType<typeof BaseFileInput>>("importInput");

async function selectBackup(file: File) {
  if (file.size > 20_000_000) {
    report("danger", t("settings.backup.tooLarge"));
    return;
  }
  try {
    backupFile.value = {
      name: file.name,
      json: await file.text(),
      revision: snapshot.value?.revision ?? 0,
    };
    status.value = null;
  } catch {
    report("danger", t("settings.backup.unreadableFile"));
  }
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
      report("success", t("settings.backup.imported"));
      return;
    }
    if (Conflict.is(result.error)) {
      backupFile.value = null;
      report("info", t("settings.backup.changed"));
      return;
    }
    report("danger", describeFailure(result.error, t).message);
  } catch {
    report("danger", t("settings.backup.importFailed"));
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
    @click="importInput?.open()"
  >
    <Upload :size="17" aria-hidden="true" />{{ t("settings.backup.import") }}
  </BaseButton>
  <BaseFileInput
    ref="importInput"
    accept="application/json,.json"
    :label="t('settings.backup.fileLabel')"
    @select="selectBackup"
  />
  <div v-if="backupFile" class="import-preview">
    <strong>{{ backupFile.name }}</strong>
    <p class="settings-help">{{ t("settings.backup.previewHint") }}</p>
    <BaseActions>
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
    </BaseActions>
  </div>
  <BaseNotice v-if="status" :tone="status.tone">{{ status.text }}</BaseNotice>
</template>
