<script setup lang="ts">
import type { Component } from "vue";
import { ChevronRight } from "@lucide/vue";

export type ListRowTone = "primary" | "muted" | "destructive";

// `as` picks the element or component that renders the row: a link, a label
// around a control, or the default plain row. Attributes fall through to it.
const { as = "div", tone = "muted" } = defineProps<{
  label: string;
  as?: string | Component;
  icon?: Component;
  tone?: ListRowTone;
  description?: string;
  value?: string;
  chevron?: boolean;
}>();
defineSlots<{ default?: () => unknown }>();
</script>

<template>
  <component :is="as" class="ui-list-row" :data-link="chevron || undefined">
    <span v-if="icon" class="ui-list-row-tile" :data-tone="tone"
      ><component :is="icon" :size="18" aria-hidden="true"
    /></span>
    <span class="ui-list-row-text"
      ><span class="ui-list-row-label">{{ label }}</span
      ><span v-if="description" class="ui-list-row-description">{{
        description
      }}</span></span
    >
    <slot
      ><span v-if="value" class="ui-list-row-value">{{ value }}</span></slot
    >
    <ChevronRight
      v-if="chevron"
      class="ui-list-row-chevron"
      :size="18"
      aria-hidden="true"
    />
  </component>
</template>

<style scoped>
.ui-list-row {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 56px;
  padding: 8px 16px;
  color: var(--text);
  text-decoration: none;
}
.ui-list-row + .ui-list-row {
  border-block-start: 1px solid var(--rule);
}
@media (hover: hover) and (pointer: fine) {
  .ui-list-row[data-link]:hover {
    background: var(--hover);
  }
}
.ui-list-row[data-link]:focus-visible {
  outline-offset: -3px;
}
.ui-list-row-tile {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--tone);
  color: var(--surface);
}
.ui-list-row-tile[data-tone="primary"] {
  --tone: var(--accent);
}
.ui-list-row-tile[data-tone="muted"] {
  --tone: var(--muted);
}
.ui-list-row-tile[data-tone="destructive"] {
  --tone: var(--danger);
}
.ui-list-row-text {
  display: grid;
  flex: 1;
  gap: 2px;
  min-width: 0;
}
.ui-list-row-label {
  font-size: 16px;
  hyphens: auto;
  overflow-wrap: break-word;
}
.ui-list-row-description {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.45;
}
.ui-list-row-value {
  color: var(--muted);
  font-size: 14px;
  text-align: end;
  overflow-wrap: anywhere;
}
.ui-list-row-chevron {
  flex-shrink: 0;
  color: var(--muted);
}
</style>
