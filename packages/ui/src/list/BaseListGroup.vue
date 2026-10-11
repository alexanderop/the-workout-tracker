<script setup lang="ts">
import { useSlots, useTemplateRef } from "vue";

// A bordered card of rows with an optional uppercase label. The `action` slot
// sits opposite the label (a "View history" link). `scroll` makes the card the
// scroll container, for a long list inside a sheet whose height is fixed; give
// the group a bounded height there. Rows go in the default slot.
const { scroll = false } = defineProps<{ label?: string; scroll?: boolean }>();
defineSlots<{ default?: () => unknown; action?: () => unknown }>();
const slots = useSlots();
const card = useTemplateRef<HTMLElement>("card");
defineExpose({
  scrollToTop: () => {
    if (card.value) card.value.scrollTop = 0;
  },
});
</script>

<template>
  <div
    class="ui-list-group"
    data-slot="list-group"
    :data-scroll="scroll || undefined"
  >
    <div v-if="label || slots.action" class="ui-list-group-header">
      <h2 v-if="label" class="ui-list-group-label">{{ label }}</h2>
      <slot name="action" />
    </div>
    <div ref="card" class="ui-list-group-card"><slot /></div>
  </div>
</template>

<style scoped>
.ui-list-group {
  display: grid;
  gap: var(--space-2);
}
.ui-list-group[data-scroll] {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.ui-list-group-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.ui-list-group-label {
  margin: 0;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}
.ui-list-group-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  box-shadow: 0 1px 2px var(--ui-shadow-soft);
}
.ui-list-group[data-scroll] .ui-list-group-card {
  flex: 0 1 auto;
  overflow: hidden auto;
  min-height: 0;
  overscroll-behavior: contain;
}
</style>
