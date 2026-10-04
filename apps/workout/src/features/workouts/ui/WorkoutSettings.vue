<script setup lang="ts">
import { ref } from "vue";
import { Sheet, Button, NativeSelect, Switch } from "@form/ui";
import { ArrowDownToLine, Upload } from "@lucide/vue";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import { download } from "./presentation";
const props = defineProps<{
  workspace: Pick<
    WorkoutWorkspace,
    "service" | "snapshot" | "state" | "saving" | "run"
  >;
}>();
const { service, snapshot, state, saving, run } = props.workspace;
const settingsOpen = defineModel<boolean>("open", { required: true });
const backupFile = ref<{ name: string; json: string; revision: number } | null>(
  null,
);
const backupBusy = ref(false);
const backupMessage = ref("");
const importInput = ref<HTMLInputElement | null>(null);

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
    } else if (result.kind === "conflict")
      backupMessage.value =
        "Your data changed. Select the backup again to review the current import.";
    else backupMessage.value = result.message;
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
</script>

<template>
  <Sheet
    :open="settingsOpen"
    title="Make it your space"
    description="Your training preferences and local data."
    @close="settingsOpen = false"
    ><template v-if="snapshot"
      ><section class="settings-section">
        <h3>Training preferences</h3>
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
        <h3>Keep a copy of your progress</h3>
        <p class="muted small">
          Workouts live in this browser. Export a backup to keep them safe or
          move them to another device.
        </p>
        <div class="backup-actions">
          <Button
            class="btn secondary"
            :disabled="backupBusy || saving"
            @click="exportBackup"
          >
            <ArrowDownToLine :size="17" />Export backup</Button
          ><Button
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
            A new install restores your backup, including edited starter
            routines. Otherwise, import adds missing records and rejects
            conflicts. Your current settings stay unchanged.
          </p>
          <div class="form-actions">
            <Button
              class="btn ghost"
              :disabled="backupBusy"
              @click="backupFile = null"
            >
              Cancel import</Button
            ><Button
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
      <p class="settings-signoff">
        <span class="brand small">The Workout Tracker</span
        ><span class="muted small">A quieter space to get stronger.</span>
      </p></template
    ></Sheet
  >
</template>
