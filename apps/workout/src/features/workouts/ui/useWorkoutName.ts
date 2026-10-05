import { computed, ref, watch, type Ref } from "vue";
import type { ActiveSession } from "../domain";
import type { useWorkouts } from "./useWorkouts";

type NameDraft = {
  sessionId: string;
  text: string;
  baseName: string;
  revision: number;
};

export function useWorkoutName(
  workspace: Pick<
    ReturnType<typeof useWorkouts>,
    "snapshot" | "run" | "saving"
  > & {
    active: Readonly<Ref<ActiveSession | null>>;
  },
) {
  const draft = ref<NameDraft | null>(null);
  const issue = ref("");
  const submitting = ref(false);
  const dirty = computed(
    () => !!draft.value && draft.value.text !== workspace.active.value?.name,
  );
  const conflict = computed(
    () => dirty.value && workspace.active.value?.name !== draft.value?.baseName,
  );
  const canSave = computed(
    () => dirty.value && !conflict.value && !workspace.saving.value,
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
  watch(
    () => workspace.snapshot.value,
    (_snapshot, previous) => {
      if (
        canAdoptSaved(previous?.active?.name) ||
        draft.value?.sessionId !== workspace.active.value?.id
      ) {
        useSaved();
        return;
      }
      if (!conflict.value && draft.value && workspace.snapshot.value) {
        draft.value.revision = workspace.snapshot.value.revision;
      }
    },
    { immediate: true, flush: "sync" },
  );
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
    if (!saved) {
      issue.value = "Name not saved. Your input is still here.";
      return;
    }
    if (draft.value?.sessionId !== submitted.sessionId) return;
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
  return { text, issue, dirty, conflict, save, keepMine, useSaved };
}
