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
  const message = computed(() =>
    notice.value.kind === "saved" ? notice.value.message : "",
  );
  const error = computed(() =>
    notice.value.kind === "failed" ? notice.value.message : "",
  );
  /** Shows a saved confirmation, replacing any previous outcome. */
  function notify(text: string) {
    notice.value = { kind: "saved", message: text };
  }
  function clearMessage() {
    if (notice.value.kind === "saved") notice.value = { kind: "none" };
  }
  function clearError() {
    if (notice.value.kind === "failed") notice.value = { kind: "none" };
  }
  function fail(text: string, reload = false) {
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
        notify("Saved on this device");
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
  /**
   * Runs a data-management command under the shared saving lock and adopts
   * the snapshot it reports. Returns null while another save is running.
   */
  async function guarded<R extends { kind: string; snapshot?: Snapshot }>(
    task: () => Promise<R>,
  ): Promise<R | null> {
    if (saving.value) return null;
    saving.value = true;
    try {
      const result = await task();
      if (result.snapshot) state.value = { kind: "ready", snapshot: result.snapshot };
      return result;
    } finally {
      saving.value = false;
    }
  }
  return {
    service: { exportBackup: () => service.exportBackup() },
    state: computed(() => state.value),
    snapshot,
    saving: computed(() => saving.value),
    notice: computed(() => notice.value),
    message,
    error,
    notify,
    clearMessage,
    clearError,
    fail,
    run,
    deleteAllData: (revision: number) =>
      guarded(() => service.deleteAllData(revision)),
    importBackup: (json: string, revision: number) =>
      guarded(() => service.importBackup(json, revision)),
  };
}
