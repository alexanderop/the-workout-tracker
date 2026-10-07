import { computed, onScopeDispose, ref, shallowRef } from "vue";
import type { Workouts, LoadState, ApplicationCommand } from "../application";
import type { Snapshot } from "../domain";

/**
 * The outcome shown after the latest action. A save confirmation and an error
 * cannot be visible together; a new outcome replaces the previous one.
 */
export type SaveNotice =
  | { kind: "none" }
  | { kind: "saved"; message: string }
  | { kind: "failed"; message: string; reload: boolean };

export function useWorkouts(service: Workouts) {
  const state = shallowRef<LoadState>({ kind: "loading" });
  const saving = ref(false);
  const notice = shallowRef<SaveNotice>({ kind: "none" });
  const message = computed({
    get: () => (notice.value.kind === "saved" ? notice.value.message : ""),
    set: (text: string) => {
      if (text) {
        notice.value = { kind: "saved", message: text };
        return;
      }
      if (notice.value.kind === "saved") notice.value = { kind: "none" };
    },
  });
  const error = computed({
    get: () => (notice.value.kind === "failed" ? notice.value.message : ""),
    set: (text: string) => fail(text, false),
  });
  function fail(text: string, reload: boolean) {
    if (text) {
      notice.value = { kind: "failed", message: text, reload };
      return;
    }
    if (notice.value.kind === "failed") notice.value = { kind: "none" };
  }
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
    notice.value = { kind: "none" };
    try {
      const result = await service.execute(command, expectedRevision);
      if (result.kind === "saved") {
        state.value = { kind: "ready", snapshot: result.snapshot };
        message.value = "Saved on this device";
        return result.snapshot;
      }
      if (result.kind === "conflict") {
        state.value = { kind: "ready", snapshot: result.snapshot };
        fail(
          "This workout changed in another tab. Your draft is still visible. Reload to use the latest saved values.",
          true,
        );
        return null;
      }
      fail(result.message, result.kind === "unavailable");
      return null;
    } catch {
      fail(
        "Could not save. Your previous saved workout is safe. Try again.",
        true,
      );
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
  return {
    service: dataManagement,
    state,
    snapshot,
    saving,
    notice,
    message,
    error,
    fail,
    run,
  };
}
