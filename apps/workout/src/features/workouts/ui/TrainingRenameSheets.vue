<script setup lang="ts">
import { watch } from "vue";
import {
  BaseActions,
  BaseButton,
  BaseConfirmSheet,
  BaseInput,
  BaseSheet,
  BaseNotice,
} from "@form/ui";
import { useTranslation } from "../../../i18n";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import { useLeaveConfirmation } from "./useLeaveConfirmation";
const { workspace } = defineProps<{
  workspace: Pick<WorkoutWorkspace, "active" | "saving" | "workoutName">;
}>();
const open = defineModel<boolean>("open", { required: true });
const { t } = useTranslation();
const { active, saving } = workspace;
const {
  text: name,
  issue: nameIssue,
  dirty: nameDirty,
  conflict: nameConflict,
  save: rename,
  keepMine,
  useSaved,
} = workspace.workoutName;
const leave = useLeaveConfirmation();
const dismiss = leave.open;
async function close() {
  if (saving.value) return;
  if (await requestDiscard()) open.value = false;
}
async function save() {
  await rename();
  if (!nameDirty.value) open.value = false;
}
async function keep() {
  await keepMine();
  if (!nameDirty.value) open.value = false;
}
function adopt() {
  useSaved();
  open.value = false;
}
function settleLeave(discard: boolean) {
  if (discard) useSaved();
  leave.settle(discard);
}
/** Resolves true when there is no unsaved name or the user discards it. */
function requestDiscard(): Promise<boolean> {
  if (!nameDirty.value) return Promise.resolve(true);
  return leave.request();
}
watch(
  () => active.value?.id,
  () => {
    settleLeave(false);
    open.value = false;
  },
);
defineExpose({ requestDiscard });
</script>
<template>
  <BaseSheet :open="open" :title="t('training.rename.title')" @close="close">
    <label class="field"
      ><span>{{ t("training.rename.label") }}</span>
      <BaseInput
        v-model="name"
        :aria-label="t('training.rename.label')"
        maxlength="80"
        :disabled="saving"
        @keydown.enter.prevent="save"
      />
    </label>
    <p v-if="nameDirty && nameConflict" role="status">
      {{ t("training.rename.conflict", { name: active?.name ?? "" }) }}
    </p>
    <BaseActions v-if="nameDirty">
      <template v-if="nameConflict">
        <BaseButton variant="secondary" :disabled="saving" @click="adopt">{{
          t("training.rename.useSaved")
        }}</BaseButton>
        <BaseButton :disabled="saving" @click="keep">{{
          t("training.rename.keepMine")
        }}</BaseButton>
      </template>
      <template v-else>
        <BaseButton variant="secondary" :disabled="saving" @click="close">{{
          t("training.rename.cancel")
        }}</BaseButton>
        <BaseButton :disabled="saving" @click="save">{{
          t("training.rename.save")
        }}</BaseButton>
      </template>
    </BaseActions>
    <p v-if="nameDirty" class="muted small">
      {{ t("training.rename.saveBeforeFinish") }}
    </p>
    <BaseNotice v-if="nameIssue" tone="danger">{{ nameIssue }}</BaseNotice>
  </BaseSheet>
  <BaseConfirmSheet
    :open="dismiss"
    intent="destructive"
    :title="t('training.rename.discardTitle')"
    :description="t('training.rename.discardDescription')"
    :cancel-label="t('dialogs.actions.keepEditing')"
    :confirm-label="t('training.rename.discardAction')"
    @cancel="settleLeave(false)"
    @confirm="settleLeave(true)"
  />
</template>
