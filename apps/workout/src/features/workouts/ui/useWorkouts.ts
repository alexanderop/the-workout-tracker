import { computed, onScopeDispose, ref, shallowRef } from "vue";
import type { Workouts, LoadState, ApplicationCommand } from "../application";
import type { Snapshot } from "../domain";

export function useWorkouts(service: Workouts) {
  const state = shallowRef<LoadState>({ kind: "loading" });
  const saving = ref(false);
  const message = ref("");
  const error = ref("");
  const snapshot = computed(() =>
    state.value.kind === "ready" ? state.value.snapshot : null,
  );
  const stop = service.subscribe((value) => {
    state.value = value;
  });
  onScopeDispose(() => {
    stop();
  });
  async function run(
    command: ApplicationCommand,
    expectedRevision = snapshot.value?.revision,
  ): Promise<Snapshot | null> {
    if (saving.value || expectedRevision === undefined) return null;
    saving.value = true;
    error.value = "";
    try {
      const result = await service.execute(command, expectedRevision);
      if (result.kind === "saved") {
        state.value = { kind: "ready", snapshot: result.snapshot };
        message.value = "Saved on this device";
        return result.snapshot;
      }
      if (result.kind === "conflict") {
        state.value = { kind: "ready", snapshot: result.snapshot };
        error.value =
          "This workout changed in another tab. Your draft is still visible. Reload to use the latest saved values.";
        return null;
      }
      error.value = result.message;
      return null;
    } catch {
      error.value =
        "Could not save. Your previous saved workout is safe. Try again.";
      return null;
    } finally {
      saving.value = false;
    }
  }
  const dataManagement = {
    deleteAllData: (revision: number) => service.deleteAllData(revision),
    exportBackup: () => service.exportBackup(),
    importBackup: (json: string, revision: number) => service.importBackup(json, revision),
  };
  return { service: dataManagement, state, snapshot, saving, message, error, run };
}
