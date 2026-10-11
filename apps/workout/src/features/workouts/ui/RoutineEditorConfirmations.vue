<script setup lang="ts">
import { BaseConfirmSheet } from "@form/ui";
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
  <BaseConfirmSheet
    :open="discardOpen"
    intent="destructive"
    :title="t('dialogs.routineEditor.discardTitle')"
    :description="t('dialogs.routineEditor.discardDescription')"
    :cancel-label="t('dialogs.actions.keepEditing')"
    :confirm-label="t('dialogs.actions.discardChanges')"
    :busy="busy"
    @cancel="emit('keep-editing')"
    @confirm="emit('discard')"
  />
  <BaseConfirmSheet
    :open="removal !== null"
    intent="destructive"
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
    :cancel-label="t('dialogs.actions.cancel')"
    :confirm-label="t('dialogs.routineEditor.remove')"
    :busy="busy"
    @cancel="emit('cancel-removal')"
    @confirm="emit('confirm-removal')"
  />
</template>
