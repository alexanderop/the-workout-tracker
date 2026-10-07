<script setup lang="ts">
import { ref, watch } from "vue";
import { BaseButton, BaseInput, BaseSheet } from "@form/ui";
import type { useWorkoutName } from "./useWorkoutName";
import { useUnsavedChangesWarning } from "./useUnsavedChangesWarning";
const { controller } = defineProps<{
  controller: ReturnType<typeof useWorkoutName>;
}>();
const open = ref(false);
const { recoveries, recoveryIssues, recovering } = controller;
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
    aria-label="Unsaved workout names"
  >
    <p role="status">Your unsaved workout name is still here.</p>
    <BaseButton size="sm" @click="open = true">Review unsaved names</BaseButton>
  </aside>
  <BaseSheet
    :open="open"
    title="Unsaved workout names"
    description="These workouts are no longer active. Your name changes have been preserved in this tab."
    @close="open = false"
  >
    <section
      v-for="entry in recoveries"
      :key="entry.sessionId"
      class="name-recovery-entry"
    >
      <h3>{{ entry.baseName }}</h3>
      <label>
        Your unsaved name
        <BaseInput :model-value="entry.text" readonly />
      </label>
      <p v-if="entry.state === 'missing'" class="muted">
        This workout is no longer available. Copy your name before discarding
        it.
      </p>
      <p v-else-if="entry.state === 'conflict'" class="muted">
        The saved name changed to “{{ entry.savedName }}”. Choose whether to
        replace it.
      </p>
      <p v-else class="muted">Save this name to the completed workout.</p>
      <p
        v-if="recoveryIssues.get(entry.sessionId)"
        class="field-error"
        role="alert"
      >
        {{ recoveryIssues.get(entry.sessionId) }}
      </p>
      <div class="name-recovery-actions">
        <BaseButton
          v-if="entry.state !== 'missing'"
          :disabled="!!recovering"
          @click="
            controller.resolveRecovery(
              entry.sessionId,
              entry.state === 'conflict' ? 'keep-mine' : 'save',
            )
          "
          >{{
            entry.state === "conflict" ? "Keep my name" : "Save name"
          }}</BaseButton
        >
        <BaseButton
          variant="secondary"
          :disabled="!!recovering"
          @click="controller.resolveRecovery(entry.sessionId, 'discard')"
          >Discard name</BaseButton
        >
      </div>
    </section>
  </BaseSheet>
</template>
<style scoped>
.name-recovery-notice {
  position: fixed;
  z-index: 40;
  inset-block-end: calc(5rem + env(safe-area-inset-bottom, 0px));
  inset-inline-start: 1rem;
  inset-inline-end: 1rem;
  margin-inline: auto;
  max-width: 30rem;
  padding: 1rem;
  border: 1px solid var(--muted);
  border-radius: 1rem;
  background: var(--surface);
  box-shadow: 0 4px 24px var(--ui-shadow-dialog);
}
.name-recovery-notice p {
  margin: 0 0 0.5rem;
}
.name-recovery-entry {
  display: grid;
  gap: 0.75rem;
  padding-block: 1rem;
}
.name-recovery-entry label {
  display: grid;
  gap: 0.5rem;
}
.name-recovery-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
