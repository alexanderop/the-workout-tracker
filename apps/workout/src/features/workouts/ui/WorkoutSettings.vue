<script setup lang="ts">
import { useTemplateRef, ref } from "vue";
import { Button, NativeSelect, Switch, Sheet } from "@form/ui";
import { ArrowDownToLine, Upload, Trash2 } from "@lucide/vue";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import { download } from "./presentation";
const { workspace } = defineProps<{
  workspace: Pick<
    WorkoutWorkspace,
    "service" | "snapshot" | "state" | "saving" | "run"
  >;
}>();
const { service, snapshot, state, saving, run } = workspace;
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
async function deleteAllData() {
  const request = deletion.value;
  if (!request || request.conflict || saving.value || backupBusy.value) return;
  saving.value = true;
  request.issue = "";
  try {
    const result = await service.deleteAllData(request.revision);
    if (result.kind === "saved" || result.kind === "cleanup-pending") {
      state.value = { kind: "ready", snapshot: result.snapshot };
      backupFile.value = null;
      backupMessage.value = "";
      if (result.kind === "cleanup-pending") {
        request.revision = result.snapshot.revision;
        request.issue = result.message;
        return;
      }
      deletion.value = null;
      deletionMessage.value =
        "All your data has been deleted from this browser.";
      return;
    }
    if (result.kind === "conflict") {
      state.value = { kind: "ready", snapshot: result.snapshot };
      request.conflict = true;
      request.issue =
        "Your data changed in another tab. Close this dialog and review the deletion again.";
      return;
    }
    request.issue = result.message;
  } catch {
    request.issue = "Deletion could not finish. Try again.";
  } finally {
    saving.value = false;
  }
}
const backupMessage = ref("");
const importInput = useTemplateRef<HTMLInputElement>("importInput");

async function exportBackup() {
  backupBusy.value = true;
  backupMessage.value = "";
  try {
    download(
      await service.exportBackup(),
      `the-workout-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`,
    );
    backupMessage.value = "Backup downloaded.";
  } catch {
    backupMessage.value = "Could not export your backup. Try again.";
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
    backupMessage.value = "Choose a backup smaller than 20 MB.";
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
    backupMessage.value = "Could not read that file.";
  }
  input.value = "";
}
async function importBackup() {
  const file = backupFile.value;
  if (!file) return;
  backupBusy.value = true;
  try {
    const result = await service.importBackup(file.json, file.revision);
    if (result.kind === "saved") {
      state.value = { kind: "ready", snapshot: result.snapshot };
      backupFile.value = null;
      backupMessage.value =
        "Backup imported. Your existing workouts are preserved.";
      return;
    }
    if (result.kind === "conflict") {
      backupMessage.value =
        "Your data changed. Select the backup again to review the current import.";
      return;
    }
    backupMessage.value = result.message;
  } catch {
    backupMessage.value =
      "Import failed. Your saved workouts have not been replaced.";
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
defineSlots<{ default?: () => unknown }>();
</script>

<template>
  <section class="settings-page" aria-labelledby="settings-title">
    <header class="page-heading">
      <h1 id="settings-title">Settings</h1>
    </header>
    <template v-if="snapshot">
      <section class="settings-section">
        <h2>Training preferences</h2>
        <label class="settings-row"
          ><span
            >Automatic rest timer<small
              >Start counting down after a logged set.</small
            ></span
          ><Switch
            aria-label="Automatic rest timer"
            :model-value="snapshot.settings.autoRest"
            :disabled="saving"
            @update:model-value="changeAutoRest" /></label
        ><label class="settings-row"
          ><span
            >Rest between sets<small
              >Choose the pace that suits your session.</small
            ></span
          ><NativeSelect
            class="input rest-select"
            aria-label="Rest duration"
            :model-value="snapshot.settings.restSeconds"
            :disabled="saving"
            @change="changeRestDuration"
          >
            <option
              v-for="seconds in [30, 60, 90, 120, 180, 300]"
              :key="seconds"
              :value="seconds"
            >
              {{ seconds }} sec
            </option>
          </NativeSelect></label
        >
        <div class="settings-row">
          <span>Weight unit</span><span class="muted">Kilograms · kg</span>
        </div>
      </section>
      <section class="settings-section">
        <h2>Keep a copy of your progress</h2>
        <p class="muted small">
          Workouts live in this browser. Export a backup to keep them safe or
          move them to another device.
        </p>
        <div class="backup-actions">
          <Button
            unstyled
            class="btn secondary"
            :disabled="backupBusy || saving"
            @click="exportBackup"
          >
            <ArrowDownToLine :size="17" />Export backup</Button
          ><Button
            unstyled
            class="btn secondary"
            :disabled="backupBusy || saving"
            @click="importInput?.click()"
          >
            <Upload :size="17" />Import backup</Button
          ><input
            ref="importInput"
            class="sr-only"
            tabindex="-1"
            type="file"
            accept="application/json,.json"
            aria-label="Choose backup file"
            @change="selectBackup"
          />
        </div>
        <div v-if="backupFile" class="import-preview">
          <strong>{{ backupFile.name }}</strong>
          <p class="muted small">
            An empty journal with default settings and exercises restores your
            backup. Otherwise, import adds missing records and rejects
            conflicts. Your current settings stay unchanged.
          </p>
          <div class="form-actions">
            <Button
              unstyled
              class="btn ghost"
              :disabled="backupBusy"
              @click="backupFile = null"
            >
              Cancel import</Button
            ><Button
              unstyled
              class="btn primary"
              :disabled="backupBusy || saving"
              @click="importBackup"
            >
              {{ backupBusy ? "Importing…" : "Import this backup" }}
            </Button>
          </div>
        </div>
        <p v-if="backupMessage" role="status" class="small">
          {{ backupMessage }}
        </p>
      </section>
      <slot />
      <section class="settings-section">
        <h2>Delete your data</h2>
        <p class="muted small">
          Permanently delete your workouts, templates, custom exercises and
          preferences from this browser. Export a backup first if you want to
          keep a copy.
        </p>
        <Button
          variant="secondary"
          :disabled="saving || backupBusy"
          @click="requestDeletion"
        >
          <Trash2 :size="17" />Delete all data
        </Button>
        <p v-if="deletionMessage" role="status" class="small">
          {{ deletionMessage }}
        </p>
      </section>
      <p class="settings-signoff">
        <span class="brand small">The Workout Tracker</span
        ><span class="muted small">A quieter space to get stronger.</span>
      </p>
    </template>
  </section>
  <Sheet
    :open="deletion !== null"
    title="Delete all your data?"
    description="This permanently deletes your workout history, active workout, input drafts, templates and custom exercises from this browser, and resets your preferences. This cannot be undone. Downloaded backups stay on your device."
    @close="!saving && (deletion = null)"
  >
    <p v-if="deletion?.issue" role="alert" class="field-error">
      {{ deletion.issue }}
    </p>
    <div class="form-actions">
      <Button
        variant="secondary"
        :disabled="saving"
        @click="deletion = null"
      >
        Cancel
      </Button>
      <Button
        :disabled="saving || deletion?.conflict"
        @click="deleteAllData"
      >
        {{ saving ? "Deleting…" : "Delete all data" }}
      </Button>
    </div>
  </Sheet>
</template>
