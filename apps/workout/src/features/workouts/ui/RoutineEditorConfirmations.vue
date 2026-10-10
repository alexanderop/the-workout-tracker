<script setup lang="ts">
import { BaseSheet, BaseButton } from "@form/ui";
import { useTranslation } from "../../../i18n";

/** The two confirmations of the template editor: leaving and removing. */
defineProps<{
  discardOpen: boolean;
  removal: "exercise" | "set" | null;
  busy: boolean;
}>();
const emit = defineEmits<{
  "keep-editing": [];
  discard: [];
  "cancel-removal": [];
  "confirm-removal": [];
}>();
const { t } = useTranslation();
</script>

<template>
  <BaseSheet
    :open="discardOpen"
    :title="t('dialogs.routineEditor.discardTitle')"
    :description="t('dialogs.routineEditor.discardDescription')"
    @close="emit('keep-editing')"
  >
    <div class="form-actions">
      <BaseButton variant="secondary" @click="emit('keep-editing')">
        {{ t("dialogs.actions.keepEditing") }}
      </BaseButton>
      <BaseButton :disabled="busy" @click="emit('discard')">
        {{ t("dialogs.actions.discardChanges") }}
      </BaseButton>
    </div>
  </BaseSheet>
  <BaseSheet
    :open="removal !== null"
    :title="
      removal === 'exercise'
        ? t('dialogs.routineEditor.removeExerciseTitle')
        : t('dialogs.removeSet.title')
    "
    :description="
      removal === 'exercise'
        ? t('dialogs.routineEditor.removeExerciseDescription')
        : t('dialogs.routineEditor.removeSetDescription')
    "
    @close="emit('cancel-removal')"
  >
    <div class="form-actions">
      <BaseButton variant="secondary" @click="emit('cancel-removal')">
        {{ t("dialogs.actions.cancel") }}
      </BaseButton>
      <BaseButton :disabled="busy" @click="emit('confirm-removal')">
        {{ t("dialogs.routineEditor.remove") }}
      </BaseButton>
    </div>
  </BaseSheet>
</template>
