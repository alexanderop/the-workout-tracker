import { computed, onScopeDispose, ref, shallowRef } from "vue";
import type { Result } from "@form/result";
import type { Translate } from "../../../i18n";
import type { Workouts, ApplicationCommand } from "../application";
import {
  Conflict,
  DraftCleanupPending,
  StoredDataUnreadable,
  type LoadState,
  type Snapshot,
} from "../domain";
import { describeFailure, describeReadFailure } from "./errorMessages";

/**
 * The outcome shown after the latest action. A save confirmation and an error
 * cannot be visible together; a new outcome replaces the previous one. A
 * confirmation is feedback for one event: it disappears after
 * `SAVED_MESSAGE_MS` and when the user leaves the route it belongs to. `page`
 * names that route; without it the confirmation ends on any route change.
 */
export type SaveNotice =
  | { kind: "none" }
  | { kind: "saved"; message: string; page?: string }
  | { kind: "failed"; message: string; reload: boolean };

/** The newer snapshot a conflict or a partial deletion carries, if any. */
function reportedSnapshot(failure: Error): Snapshot | undefined {
  return Conflict.is(failure) || DraftCleanupPending.is(failure)
    ? failure.snapshot
    : undefined;
}

/** How long a save confirmation stays before it clears itself. */
export const SAVED_MESSAGE_MS = 8000;

/** Runs `run` after `ms`; the returned function cancels it. Tests inject their own. */
export type After = (run: () => void, ms: number) => () => void;
const afterTimeout: After = (run, ms) => {
  const id = setTimeout(run, ms);
  return () => {
    clearTimeout(id);
  };
};

export function useWorkouts(
  service: Workouts,
  t: Translate,
  after: After = afterTimeout,
) {
  const state = shallowRef<LoadState>({ kind: "loading" });
  const saving = ref(false);
  const notice = shallowRef<SaveNotice>({ kind: "none" });
  const message = computed(() =>
    notice.value.kind === "saved" ? notice.value.message : "",
  );
  const error = computed(() =>
    notice.value.kind === "failed" ? notice.value.message : "",
  );
  let cancelExpiry: (() => void) | undefined;
  function stopExpiry() {
    cancelExpiry?.();
    cancelExpiry = undefined;
  }
  onScopeDispose(stopExpiry);
  /**
   * Shows a saved confirmation, replacing any previous outcome. It survives
   * arriving on `page` (the route that follows the action) and ends on leaving
   * it, or after `SAVED_MESSAGE_MS`.
   */
  function notify(text: string, page?: string) {
    notice.value = { kind: "saved", message: text, page };
    stopExpiry();
    cancelExpiry = after(clearMessage, SAVED_MESSAGE_MS);
  }
  function clearMessage() {
    stopExpiry();
    if (notice.value.kind === "saved") notice.value = { kind: "none" };
  }
  /** Ends a confirmation that does not belong to the route just entered. */
  function enterPage(page: unknown) {
    if (notice.value.kind === "saved" && notice.value.page !== page)
      clearMessage();
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
  /** Why the journal cannot be shown; a recovery export when data is unreadable. */
  const loadFailure = computed(() => {
    const current = state.value;
    if (current.kind !== "failed") return null;
    return {
      message: describeReadFailure(current.error, t),
      recoveryExport: StoredDataUnreadable.is(current.error)
        ? current.error.rawExport
        : null,
    };
  });
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
      if (result.isOk()) {
        state.value = { kind: "ready", snapshot: result.value };
        notify(t("errors.failures.savedOnDevice"));
        return result.value;
      }
      if (Conflict.is(result.error))
        state.value = { kind: "ready", snapshot: result.error.snapshot };
      const failure = describeFailure(result.error, t);
      fail(failure.message, failure.reload);
      return null;
    } catch {
      fail(t("errors.failures.saveFailed"), true);
      return null;
    } finally {
      saving.value = false;
    }
  }
  /**
   * Runs a data-management command under the shared saving lock and adopts
   * the snapshot it reports, also from a conflict or a partial deletion.
   * Returns null while another save is running.
   */
  async function guarded<E extends Error>(
    task: () => Promise<Result<Snapshot, E>>,
  ): Promise<Result<Snapshot, E> | null> {
    if (saving.value) return null;
    saving.value = true;
    try {
      const result = await task();
      const reported = result.isOk()
        ? result.value
        : reportedSnapshot(result.error);
      if (reported) state.value = { kind: "ready", snapshot: reported };
      return result;
    } finally {
      saving.value = false;
    }
  }
  return {
    service: { exportBackup: () => service.exportBackup() },
    state: computed(() => state.value),
    loadFailure,
    snapshot,
    saving: computed(() => saving.value),
    notice: computed(() => notice.value),
    message,
    error,
    notify,
    clearMessage,
    enterPage,
    clearError,
    fail,
    run,
    deleteAllData: (revision: number) =>
      guarded(() => service.deleteAllData(revision)),
    importBackup: (json: string, revision: number) =>
      guarded(() => service.importBackup(json, revision)),
  };
}
