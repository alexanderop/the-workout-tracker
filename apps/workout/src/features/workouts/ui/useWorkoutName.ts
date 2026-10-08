import { computed, reactive, ref, watch, type Ref } from "vue";
import type { ActiveSession } from "../domain";
import type { useWorkouts } from "./useWorkouts";

type NameDraft = {
  sessionId: string;
  text: string;
  baseName: string;
  revision: number;
};

type DetachedNameDraft = Readonly<Omit<NameDraft, "revision">>;
type NameRecovery = DetachedNameDraft &
  ({ state: "ready" | "conflict"; savedName: string } | { state: "missing" });

export function useWorkoutName(
  workspace: Pick<
    ReturnType<typeof useWorkouts>,
    "snapshot" | "run"
  > & {
    saving: Readonly<Ref<boolean>>;
    active: Readonly<Ref<ActiveSession | null>>;
  },
) {
  const draft = ref<NameDraft | null>(null);
  const detached = reactive(new Map<string, DetachedNameDraft>());
  const recoveryIssues = reactive(new Map<string, string>());
  const recovering = ref<string | null>(null);
  const recoveries = computed<NameRecovery[]>(() =>
    [...detached.values()].map((entry) => {
      const completed = workspace.snapshot.value?.completed[entry.sessionId];
      if (!completed) return { ...entry, state: "missing" };
      return {
        ...entry,
        savedName: completed.name,
        state:
          completed.name === entry.baseName || completed.name === entry.text
            ? "ready"
            : "conflict",
      };
    }),
  );
  const issue = ref("");
  const submitting = ref(false);
  const dirty = computed(
    () =>
      !!draft.value &&
      draft.value.sessionId === workspace.active.value?.id &&
      draft.value.text !== workspace.active.value.name,
  );
  const conflict = computed(
    () => dirty.value && workspace.active.value?.name !== draft.value?.baseName,
  );
  const canSave = computed(
    () =>
      dirty.value &&
      !conflict.value &&
      !submitting.value &&
      !workspace.saving.value,
  );
  const recoveryBusy = computed(
    () => !!recovering.value || workspace.saving.value,
  );
  const text = computed({
    get: () => draft.value?.text ?? "",
    set: (value: string) => {
      if (!dirty.value && !submitting.value) useSaved();
      if (draft.value) draft.value.text = value;
    },
  });
  function useSaved() {
    const active = workspace.active.value;
    const revision = workspace.snapshot.value?.revision;
    draft.value =
      active && revision !== undefined
        ? {
            sessionId: active.id,
            text: active.name,
            baseName: active.name,
            revision,
          }
        : null;
    issue.value = "";
  }
  function canAdoptSaved(previousName: string | undefined) {
    return (
      !submitting.value && (!dirty.value || draft.value?.text === previousName)
    );
  }
  function detachOutgoing(previousName: string | undefined) {
    const outgoing = draft.value;
    if (!outgoing || outgoing.text === previousName) return;
    recoveryIssues.delete(outgoing.sessionId);
    detached.set(outgoing.sessionId, {
      sessionId: outgoing.sessionId,
      text: outgoing.text,
      baseName: outgoing.baseName,
    });
  }
  /** A detached name that already reached its completed workout needs no recovery. */
  function pruneSavedRecoveries() {
    const completed = workspace.snapshot.value?.completed ?? {};
    for (const [sessionId, entry] of detached)
      if (completed[sessionId]?.name === entry.text) {
        detached.delete(sessionId);
        recoveryIssues.delete(sessionId);
      }
  }
  watch(
    () => workspace.snapshot.value,
    (_snapshot, previous) => {
      pruneSavedRecoveries();
      if (draft.value?.sessionId !== workspace.active.value?.id) {
        detachOutgoing(previous?.active?.name);
        pruneSavedRecoveries();
        useSaved();
        return;
      }
      if (canAdoptSaved(previous?.active?.name)) {
        useSaved();
        return;
      }
      rebaseRevision();
    },
    { immediate: true, flush: "sync" },
  );
  function rebaseRevision() {
    if (!conflict.value && draft.value && workspace.snapshot.value) {
      draft.value.revision = workspace.snapshot.value.revision;
    }
  }
  async function save() {
    if (!draft.value || !canSave.value) return;
    const submitted = { ...draft.value };
    if (!submitted.text.trim()) {
      issue.value = "Give this workout a name.";
      return;
    }
    submitting.value = true;
    const saved = await workspace.run(
      { type: "rename", sessionId: submitted.sessionId, name: submitted.text },
      submitted.revision,
    );
    submitting.value = false;
    if (draft.value?.sessionId !== submitted.sessionId) return;
    if (!saved) {
      issue.value = "Name not saved. Your input is still here.";
      return;
    }
    const active = saved.active;
    if (!active || active.id !== submitted.sessionId) return;
    draft.value = {
      ...draft.value,
      baseName: active.name,
      revision: saved.revision,
    };
    if (draft.value.text === submitted.text) draft.value.text = active.name;
    issue.value = "";
  }
  async function keepMine() {
    const active = workspace.active.value;
    if (
      !draft.value ||
      !active ||
      !workspace.snapshot.value ||
      workspace.saving.value
    )
      return;
    draft.value = {
      ...draft.value,
      baseName: active.name,
      revision: workspace.snapshot.value.revision,
    };
    await save();
  }
  async function resolveRecovery(
    sessionId: string,
    action: "save" | "keep-mine" | "discard",
  ) {
    const submitted = detached.get(sessionId);
    if (!submitted) return;
    if (action === "discard") {
      detached.delete(sessionId);
      recoveryIssues.delete(sessionId);
      return;
    }
    const snapshot = workspace.snapshot.value;
    const recovery = recoveries.value.find((entry) => entry.sessionId === sessionId);
    if (!snapshot || !recovery || recovery.state === "missing") return;
    if (workspace.saving.value || recovering.value) return;
    if (action === "save" && recovery.state === "conflict") return;
    await saveRecovery(submitted, snapshot.revision);
  }
  async function saveRecovery(submitted: DetachedNameDraft, revision: number) {
    const { sessionId } = submitted;
    if (!submitted.text.trim()) {
      recoveryIssues.set(sessionId, "Give this workout a name.");
      return;
    }
    recovering.value = sessionId;
    const saved = await workspace.run(
      { type: "rename-completed", sessionId, name: submitted.text },
      revision,
    );
    recovering.value = null;
    if (detached.get(sessionId) !== submitted) return;
    if (!saved) {
      recoveryIssues.set(
        sessionId,
        "Name not saved. Your input is still here.",
      );
      return;
    }
    detached.delete(sessionId);
    recoveryIssues.delete(sessionId);
  }
  return {
    text,
    issue,
    dirty,
    conflict,
    save,
    keepMine,
    useSaved,
    recoveries,
    resolveRecovery,
    recoveryIssues,
    recovering,
    recoveryBusy,
  };
}
