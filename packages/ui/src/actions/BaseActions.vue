<script setup lang="ts">
// The button row of a sheet, dialog or form. Put the primary action last.
// Phones stack the buttons full width in source order, so the primary ends at
// the bottom, within thumb reach, like the sticky "Start" action of the exercise
// picker. Wider screens lay them in one right-aligned row with the primary on
// the right. Every button gets the same 44px height.
defineProps<{
  /** Pin the row to the bottom edge of a BaseSheet while its content scrolls. */
  sticky?: boolean;
}>();
defineSlots<{ default?: () => unknown }>();
</script>

<template>
  <div class="ui-actions" :data-sticky="sticky ? '' : undefined">
    <slot />
  </div>
</template>

<style scoped>
.ui-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-2);
  margin-block-start: var(--space-4);
}
.ui-actions > :deep(.ui-button) {
  width: 100%;
  height: auto;
  min-height: 44px;
}
@media (min-width: 651px) {
  .ui-actions {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-3);
  }
  .ui-actions > :deep(.ui-button) {
    width: auto;
    min-width: calc(var(--space-8) * 2);
  }
}
</style>
