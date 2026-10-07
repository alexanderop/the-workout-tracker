import { computed, ref, shallowRef } from "vue";
import type { CompletedSession, Snapshot } from "../domain";
import { completedCorrection, completedDraft } from "../domain/completedDrafts";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";

export function useCompletedWorkoutEditor(
  session: CompletedSession,
  workspace: Pick<WorkoutWorkspace, "snapshot" | "saving" | "error" | "run">,
) {
  const baseline = shallowRef(session);
  const revision = ref(workspace.snapshot.value?.revision ?? 0);
  const draft = ref(completedDraft(session));
  const localError = ref("");
  const busy = ref(false);
  const pending = computed(() => busy.value || workspace.saving.value);
  const dirty = computed(() => {
    const correction = completedCorrection(baseline.value, draft.value);
    return (
      !correction || correction.name !== undefined || correction.sets.length > 0
    );
  });
  const saved = computed(() => workspace.snapshot.value?.completed[session.id]);
  const state = computed(() => {
    if (!saved.value) return "missing";
    return workspace.snapshot.value?.revision !== revision.value
      ? "conflict"
      : "ready";
  });
  async function save(): Promise<boolean> {
    if (pending.value || state.value !== "ready") return false;
    const command = completedCorrection(baseline.value, draft.value);
    if (!command) {
      localError.value =
        "Enter a workout name, 0–1,000 kg and 0–1,000 whole reps for each logged set.";
      return false;
    }
    busy.value = true;
    localError.value = "";
    try {
      const result = await workspace.run(command, revision.value);
      if (!result) {
        localError.value =
          workspace.error.value ||
          "Could not save. Your input is still here. Try again.";
        return false;
      }
      adopt(result);
      return true;
    } finally {
      busy.value = false;
    }
  }
  function adopt(snapshot: Snapshot) {
    const next = snapshot.completed[session.id];
    if (!next) return;
    baseline.value = next;
    revision.value = snapshot.revision;
    draft.value = completedDraft(next);
    localError.value = "";
  }
  function reload() {
    const snapshot = workspace.snapshot.value;
    if (!pending.value && snapshot && saved.value) adopt(snapshot);
  }
  return { baseline, draft, dirty, pending, state, localError, save, reload };
}
export type CompletedWorkoutEditor = ReturnType<
  typeof useCompletedWorkoutEditor
>;
