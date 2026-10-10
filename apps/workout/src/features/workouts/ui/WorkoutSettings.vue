<script setup lang="ts">
import { useTemplateRef, ref } from "vue";
import { BaseButton, BaseSelectNative, BaseSwitch, BaseSheet } from "@form/ui";
import { ArrowDownToLine, Upload, Trash2 } from "@lucide/vue";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import type { DeleteError } from "../application";
import { Conflict, DraftCleanupPending } from "../domain";
import { describeFailure } from "./errorMessages";
import { download } from "./presentation";
import { useTranslation } from "../../../i18n";

const { workspace } = defineProps<{
  workspace: Pick<
    WorkoutWorkspace,
    "service" | "snapshot" | "saving" | "run" | "deleteAllData" | "importBackup"
  >;
}>();
defineSlots<{ default?: () => unknown }>();
const { t } = useTranslation();
const {
  service,
  snapshot,
  saving,
  run,
  deleteAllData: deleteData,
  importBackup: importData,
} = workspace;
const backupFile = ref<{ name: string; json: string; revision: number } | null>(
  null,
);
const backupBusy = ref(false);
type Deletion = { revision: number; issue: string; conflict: boolean };
const deletion = ref<Deletion | null>(null);
const deletionMessage = ref("");
function requestDeletion() {
  if (!snapshot.value || saving.value || backupBusy.value) return;
  deletion.value = {
    revision: snapshot.value.revision,
    issue: "",
    conflict: false,
  };
  deletionMessage.value = "";
}
function completeDeletion(
  request: Deletion,
  pending: DraftCleanupPending | null,
) {
  backupFile.value = null;
  backupMessage.value = "";
  deletionMessage.value = t("settings.deleteData.done");
  if (pending) {
    request.revision = pending.snapshot.revision;
    request.issue = describeFailure(pending, t).message;
    return;
  }
  deletion.value = null;
}
function rejectDeletion(request: Deletion, failure: DeleteError) {
  if (Conflict.is(failure)) {
    request.conflict = true;
    request.issue = t("settings.deleteData.conflict");
    return;
  }
  request.issue = describeFailure(failure, t).message;
}
async function deleteAllData() {
  const request = deletion.value;
  // The workspace command owns the saving lock and returns null while busy.
  if (!request || request.conflict || backupBusy.value) return;
  request.issue = "";
  try {
    const result = await deleteData(request.revision);
    if (!result) return;
    const failure = result.isErr() ? result.error : null;
    if (failure && !DraftCleanupPending.is(failure)) {
      rejectDeletion(request, failure);
      return;
    }
    completeDeletion(request, failure);
  } catch {
    request.issue = t("settings.deleteData.failed");
  }
}
const backupMessage = ref("");
const importInput = useTemplateRef<HTMLInputElement>("importInput");

async function exportBackup() {
  backupBusy.value = true;
  backupMessage.value = "";
  try {
    const exported = await service.exportBackup();
    if (exported.isErr()) {
      backupMessage.value = t("settings.backup.exportFailed");
      return;
    }
    download(
      exported.value,
      `the-workout-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`,
    );
    backupMessage.value = t("settings.backup.downloaded");
  } catch {
    backupMessage.value = t("settings.backup.exportFailed");
  } finally {
    backupBusy.value = false;
  }
}
async function selectBackup(event: Event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  const file = input.files?.[0];
  if (!file) return;
  if (file.size > 20_000_000) {
    backupMessage.value = t("settings.backup.tooLarge");
    input.value = "";
    return;
  }
  try {
    backupFile.value = {
      name: file.name,
      json: await file.text(),
      revision: snapshot.value?.revision ?? 0,
    };
    backupMessage.value = "";
  } catch {
    backupMessage.value = t("settings.backup.unreadableFile");
  }
  input.value = "";
}
async function importBackup() {
  const file = backupFile.value;
  if (!file || backupBusy.value || saving.value) return;
  backupBusy.value = true;
  try {
    const result = await importData(file.json, file.revision);
    if (!result) return;
    if (result.isOk()) {
      backupFile.value = null;
      backupMessage.value = t("settings.backup.imported");
      return;
    }
    if (Conflict.is(result.error)) {
      backupFile.value = null;
      backupMessage.value = t("settings.backup.changed");
      return;
    }
    backupMessage.value = describeFailure(result.error, t).message;
  } catch {
    backupMessage.value = t("settings.backup.importFailed");
  } finally {
    backupBusy.value = false;
  }
}
function changeAutoRest(autoRest: boolean) {
  if (!snapshot.value) return;
  void run({
    type: "settings",
    settings: { ...snapshot.value.settings, autoRest },
  });
}
function changeRestDuration(event: Event) {
  if (event.target instanceof HTMLSelectElement && snapshot.value)
    void run({
      type: "settings",
      settings: {
        ...snapshot.value.settings,
        restSeconds: Number(event.target.value),
      },
    });
}
</script>

<template>
  <section class="settings-page" aria-labelledby="settings-title">
    <header class="page-heading">
      <h1 id="settings-title">{{ t("settings.title") }}</h1>
    </header>
    <template v-if="snapshot">
      <section class="settings-section">
        <h2>{{ t("settings.training.title") }}</h2>
        <div class="settings-rows">
          <label class="settings-row"
            ><span
              >{{ t("settings.training.autoRest.label")
              }}<small>{{ t("settings.training.autoRest.hint") }}</small></span
            ><BaseSwitch
              :aria-label="t('settings.training.autoRest.label')"
              :model-value="snapshot.settings.autoRest"
              :disabled="saving"
              @update:model-value="changeAutoRest" /></label
          ><label class="settings-row"
            ><span
              >{{ t("settings.training.restDuration.label")
              }}<small>{{
                t("settings.training.restDuration.hint")
              }}</small></span
            ><BaseSelectNative
              class="input rest-select"
              :aria-label="t('settings.training.restDuration.ariaLabel')"
              :model-value="snapshot.settings.restSeconds"
              :disabled="saving"
              @change="changeRestDuration"
            >
              <option
                v-for="seconds in [30, 60, 90, 120, 180, 300]"
                :key="seconds"
                :value="seconds"
              >
                {{ t("settings.training.restDuration.option", { seconds }) }}
              </option>
            </BaseSelectNative></label
          >
          <div class="settings-row">
            <span>{{ t("settings.training.weightUnit.label") }}</span
            ><span class="muted">{{
              t("settings.training.weightUnit.value")
            }}</span>
          </div>
        </div>
      </section>
      <section class="settings-section">
        <h2>{{ t("settings.backup.title") }}</h2>
        <p class="muted small">
          {{ t("settings.backup.intro") }}
        </p>
        <div class="backup-actions">
          <BaseButton
            unstyled
            class="btn secondary"
            :disabled="backupBusy || saving"
            @click="exportBackup"
          >
            <ArrowDownToLine :size="17" />{{
              t("settings.backup.export")
            }}</BaseButton
          ><BaseButton
            unstyled
            class="btn secondary"
            :disabled="backupBusy || saving"
            @click="importInput?.click()"
          >
            <Upload :size="17" />{{ t("settings.backup.import") }}</BaseButton
          ><input
            ref="importInput"
            class="sr-only"
            tabindex="-1"
            type="file"
            accept="application/json,.json"
            :aria-label="t('settings.backup.fileLabel')"
            @change="selectBackup"
          />
        </div>
        <div v-if="backupFile" class="import-preview">
          <strong>{{ backupFile.name }}</strong>
          <p class="muted small">
            {{ t("settings.backup.previewHint") }}
          </p>
          <div class="form-actions">
            <BaseButton
              unstyled
              class="btn ghost"
              :disabled="backupBusy"
              @click="backupFile = null"
            >
              {{ t("settings.backup.cancelImport") }}</BaseButton
            ><BaseButton
              unstyled
              class="btn primary"
              :disabled="backupBusy || saving"
              @click="importBackup"
            >
              {{
                backupBusy
                  ? t("settings.backup.importing")
                  : t("settings.backup.importThis")
              }}
            </BaseButton>
          </div>
        </div>
        <p v-if="backupMessage" role="status" class="small">
          {{ backupMessage }}
        </p>
      </section>
      <slot />
      <section class="settings-section">
        <h2>{{ t("settings.deleteData.title") }}</h2>
        <p class="muted small">
          {{ t("settings.deleteData.intro") }}
        </p>
        <BaseButton
          variant="secondary"
          :disabled="saving || backupBusy"
          @click="requestDeletion"
        >
          <Trash2 :size="17" />{{ t("settings.deleteData.button") }}
        </BaseButton>
        <p v-if="deletionMessage" role="status" class="small">
          {{ deletionMessage }}
        </p>
      </section>
      <p class="settings-signoff">
        <span class="brand small">{{ t("settings.signoff.brand") }}</span
        ><span class="muted small">{{ t("settings.signoff.tagline") }}</span>
      </p>
    </template>
  </section>
  <BaseSheet
    :open="deletion !== null"
    :title="t('settings.deleteData.sheetTitle')"
    :description="t('settings.deleteData.sheetDescription')"
    @close="!saving && (deletion = null)"
  >
    <p v-if="deletion?.issue" role="alert" class="field-error">
      {{ deletion.issue }}
    </p>
    <div class="form-actions">
      <BaseButton
        variant="secondary"
        :disabled="saving"
        @click="deletion = null"
      >
        {{ t("settings.deleteData.cancel") }}
      </BaseButton>
      <BaseButton
        :disabled="saving || deletion?.conflict"
        @click="deleteAllData"
      >
        {{
          saving
            ? t("settings.deleteData.deleting")
            : t("settings.deleteData.button")
        }}
      </BaseButton>
    </div>
  </BaseSheet>
</template>
