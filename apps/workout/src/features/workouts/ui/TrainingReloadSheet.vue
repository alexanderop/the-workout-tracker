<script setup lang="ts">
import { BaseConfirmSheet } from "@form/ui";
import { useTranslation } from "../../../i18n";

// Opens once when another tab deleted this workout's data: new input cannot
// be saved until the page reloads. Not now leaves the row notice in place.
const open = defineModel<boolean>("open", { required: true });
const { t } = useTranslation();
function reload() {
  window.location.reload();
}
</script>

<template>
  <BaseConfirmSheet
    v-model:open="open"
    intent="neutral"
    :title="t('training.reloadRequired.title')"
    :description="t('training.reloadRequired.description')"
    :cancel-label="t('training.reloadRequired.later')"
    :confirm-label="t('training.reloadRequired.reload')"
    @confirm="reload"
  />
</template>
