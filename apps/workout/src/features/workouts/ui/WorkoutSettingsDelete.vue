<script setup lang="ts">
import { ref } from "vue";
import { BaseButton, BaseConfirmSheet, BaseNotice } from "@form/ui";
import { Trash2 } from "@lucide/vue";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import type { DeleteError } from "../application";
import { Conflict, DraftCleanupPending } from "../domain";
import { describeFailure } from "./errorMessages";
import { useTranslation } from "../../../i18n";

const { workspace, busy } = defineProps<{
  workspace: Pick<WorkoutWorkspace, "snapshot" | "saving" | "deleteAllData">;
  busy: boolean;
}>();
const { t } = useTranslation();
const { snapshot, saving, deleteAllData: deleteData } = workspace;
type Deletion = { revision: number; issue: string; conflict: boolean };
const deletion = ref<Deletion | null>(null);
const deleted = ref(false);
function requestDeletion() {
  if (!snapshot.value || saving.value || busy) return;
  deletion.value = {
    revision: snapshot.value.revision,
    issue: "",
    conflict: false,
  };
  deleted.value = false;
}
function completeDeletion(
  request: Deletion,
  pending: DraftCleanupPending | null,
) {
  deleted.value = true;
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
  if (!request || request.conflict || busy) return;
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
</script>

<template>
  <p class="settings-help">{{ t("settings.deleteData.intro") }}</p>
  <BaseButton
    variant="secondary"
    class="settings-action"
    :disabled="saving || busy"
    @click="requestDeletion"
  >
    <Trash2 :size="17" aria-hidden="true" />{{
      t("settings.deleteData.button")
    }}
  </BaseButton>
  <BaseNotice v-if="deleted" tone="success">{{
    t("settings.deleteData.done")
  }}</BaseNotice>
  <BaseConfirmSheet
    :open="deletion !== null"
    intent="destructive"
    :title="t('settings.deleteData.sheetTitle')"
    :description="t('settings.deleteData.sheetDescription')"
    :cancel-label="t('dialogs.actions.cancel')"
    :confirm-label="
      saving
        ? t('settings.deleteData.deleting')
        : t('settings.deleteData.button')
    "
    :busy="saving"
    :confirm-disabled="deletion?.conflict"
    :error="deletion?.issue"
    @cancel="deletion = null"
    @confirm="deleteAllData"
  />
</template>
