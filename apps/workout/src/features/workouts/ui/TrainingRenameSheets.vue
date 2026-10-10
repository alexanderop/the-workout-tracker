<script setup lang="ts">
import { watch } from "vue";
import { BaseButton, BaseInput, BaseSheet } from "@form/ui";
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
  <BaseSheet
    :open="open"
    :title="t('training.rename.title')"
    @close="close"
  >
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
    <div v-if="nameDirty" class="form-actions">
      <template v-if="nameConflict">
        <p role="status">
          {{ t("training.rename.conflict", { name: active?.name ?? "" }) }}
        </p>
        <BaseButton :disabled="saving" @click="keep">{{
          t("training.rename.keepMine")
        }}</BaseButton>
        <BaseButton variant="secondary" :disabled="saving" @click="adopt">{{
          t("training.rename.useSaved")
        }}</BaseButton>
      </template>
      <template v-else>
        <BaseButton :disabled="saving" @click="save">{{
          t("training.rename.save")
        }}</BaseButton>
        <BaseButton variant="ghost" :disabled="saving" @click="close">{{
          t("training.rename.cancel")
        }}</BaseButton>
      </template>
    </div>
    <p v-if="nameDirty" class="muted small">
      {{ t("training.rename.saveBeforeFinish") }}
    </p>
    <p v-if="nameIssue" class="field-error" role="alert">{{ nameIssue }}</p>
  </BaseSheet>
  <BaseSheet
    :open="dismiss"
    :title="t('training.rename.discardTitle')"
    :description="t('training.rename.discardDescription')"
    @close="settleLeave(false)"
  >
    <div class="form-actions">
      <BaseButton variant="secondary" @click="settleLeave(false)">{{
        t("training.rename.keepEditing")
      }}</BaseButton>
      <BaseButton @click="settleLeave(true)">{{
        t("training.rename.discardAction")
      }}</BaseButton>
    </div>
  </BaseSheet>
</template>
