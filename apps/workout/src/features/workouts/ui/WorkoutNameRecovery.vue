<script setup lang="ts">
import { ref, watch } from "vue";
import { BaseButton, BaseInput, BaseNotice, BaseSheet } from "@form/ui";
import { useTranslation } from "../../../i18n";
import type { useWorkoutName } from "./useWorkoutName";
import { useUnsavedChangesWarning } from "./useUnsavedChangesWarning";
const { controller } = defineProps<{
  controller: ReturnType<typeof useWorkoutName>;
}>();
const { t } = useTranslation();
const open = ref(false);
const { recoveries, recoveryIssues, recoveryBusy } = controller;
useUnsavedChangesWarning(
  () => controller.dirty.value || recoveries.value.length > 0,
);
watch(
  () => recoveries.value.length,
  (count) => {
    if (!count) open.value = false;
  },
);
</script>
<template>
  <aside
    v-if="recoveries.length"
    class="name-recovery-notice"
    :aria-label="t('training.recovery.label')"
  >
    <BaseNotice>
      {{ t("training.recovery.stillHere") }}
      <template #action>
        <BaseButton size="sm" @click="open = true">{{
          t("training.recovery.review")
        }}</BaseButton>
      </template>
    </BaseNotice>
  </aside>
  <BaseSheet
    :open="open"
    :title="t('training.recovery.title')"
    :description="t('training.recovery.description')"
    @close="open = false"
  >
    <section
      v-for="entry in recoveries"
      :key="entry.sessionId"
      class="name-recovery-entry"
    >
      <h3>{{ entry.baseName }}</h3>
      <label>
        {{ t("training.recovery.yourName") }}
        <BaseInput :model-value="entry.text" readonly />
      </label>
      <p v-if="entry.state === 'missing'" class="muted">
        {{ t("training.recovery.missing") }}
      </p>
      <p v-else-if="entry.state === 'conflict'" class="muted">
        {{ t("training.recovery.conflict", { savedName: entry.savedName }) }}
      </p>
      <p v-else class="muted">{{ t("training.recovery.ready") }}</p>
      <BaseNotice v-if="recoveryIssues.get(entry.sessionId)" tone="danger">
        {{ recoveryIssues.get(entry.sessionId) }}
      </BaseNotice>
      <div class="name-recovery-actions">
        <BaseButton
          v-if="entry.state !== 'missing'"
          :disabled="recoveryBusy"
          @click="
            controller.resolveRecovery(
              entry.sessionId,
              entry.state === 'conflict' ? 'keep-mine' : 'save',
            )
          "
          >{{
            entry.state === "conflict"
              ? t("training.recovery.keepMine")
              : t("training.recovery.save")
          }}</BaseButton
        >
        <BaseButton
          variant="secondary"
          :disabled="recoveryBusy"
          @click="controller.resolveRecovery(entry.sessionId, 'discard')"
          >{{ t("training.recovery.discard") }}</BaseButton
        >
      </div>
    </section>
  </BaseSheet>
</template>
<style scoped>
/* Positions the notice; BaseNotice draws the surface. */
.name-recovery-notice {
  position: fixed;
  z-index: 40;
  inset-block-end: calc(
    var(--space-8) + var(--space-7) + env(safe-area-inset-bottom, 0px)
  );
  inset-inline: var(--space-4);
  margin-inline: auto;
  max-width: calc(var(--space-8) * 10);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 24px var(--ui-shadow-dialog);
}
.name-recovery-entry {
  display: grid;
  gap: var(--space-3);
  padding-block: var(--space-3);
}
.name-recovery-entry label {
  display: grid;
  gap: var(--space-2);
}
.name-recovery-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>
