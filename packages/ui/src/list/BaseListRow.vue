<script setup lang="ts">
import type { Component } from "vue";
import { ChevronRight } from "@lucide/vue";

export type ListRowTone = "primary" | "muted" | "destructive";
export type ListRowDensity = "compact" | "comfortable";

// `as` picks the element or component that renders the row: a link, a button,
// a label around a control, or the default plain row. Attributes fall through
// to it. `icon` draws a tile in the leading position, `description` and `value`
// are plain-text shortcuts for the `subtitle` and `trailing` slots. Each span
// in `subtitle` is one muted line.
const {
  as = "div",
  tone = "muted",
  density = "comfortable",
} = defineProps<{
  label: string;
  as?: string | Component;
  icon?: Component;
  tone?: ListRowTone;
  description?: string;
  value?: string;
  chevron?: boolean;
  density?: ListRowDensity;
  selected?: boolean;
}>();
defineSlots<{
  leading?: () => unknown;
  subtitle?: () => unknown;
  trailing?: () => unknown;
}>();
// Hover and press feedback belong to rows that do something when chosen.
const interactive = (chevron: boolean | undefined) =>
  chevron || (as !== "div" && as !== "label");
</script>

<template>
  <component
    :is="as"
    class="ui-list-row"
    data-slot="list-row"
    :type="as === 'button' ? 'button' : undefined"
    :data-density="density"
    :data-interactive="interactive(chevron) || undefined"
    :data-selected="selected || undefined"
  >
    <slot name="leading"
      ><span v-if="icon" class="ui-list-row-tile" :data-tone="tone"
        ><component :is="icon" :size="18" aria-hidden="true" /></span
    ></slot>
    <span class="ui-list-row-text"
      ><span class="ui-list-row-label">{{ label }}</span
      ><span v-if="description || $slots.subtitle" class="ui-list-row-subtitle"
        ><slot name="subtitle">{{ description }}</slot></span
      ></span
    >
    <slot name="trailing"
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
  gap: var(--space-3);
  width: 100%;
  min-height: 56px;
  margin: 0;
  padding: var(--space-2) var(--space-4);
  border: 0;
  background: transparent;
  color: var(--text);
  font: inherit;
  text-align: start;
  text-decoration: none;
}
/* Compact rows keep the 44px touch floor and trade padding for density. */
.ui-list-row[data-density="compact"] {
  gap: var(--space-3);
  min-height: 44px;
  padding-block: var(--space-1);
  padding-inline: var(--space-3);
}
/* One hairline between rows, the same token in every list. */
.ui-list-row + .ui-list-row {
  border-block-start: 1px solid var(--rule);
}
.ui-list-row[data-selected] {
  background: var(--ui-selected-bg);
  color: var(--ui-selected-text);
  box-shadow: inset 0 0 0 1px var(--ui-selected-border);
}
@media (hover: hover) and (pointer: fine) {
  .ui-list-row[data-interactive]:hover:not([data-selected], :disabled) {
    background: var(--hover);
  }
}
.ui-list-row[data-interactive] {
  cursor: pointer;
}
.ui-list-row:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.ui-list-row[data-interactive]:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: -3px;
}
.ui-list-row-tile {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
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
  gap: calc(var(--space-1) / 2);
  min-width: 0;
}
.ui-list-row-label {
  font-size: var(--text-base);
  hyphens: auto;
  overflow-wrap: break-word;
}
/* Plain text or several spans: each span in the slot is one line. */
.ui-list-row-subtitle {
  display: grid;
  gap: calc(var(--space-1) / 2);
  color: var(--muted);
  font-size: var(--text-sm);
  line-height: 1.45;
}
/* At most half the row, so a long value never squeezes the label. */
.ui-list-row-value {
  max-width: 50%;
  color: var(--muted);
  font-size: var(--text-sm);
  text-align: end;
  overflow-wrap: anywhere;
}
.ui-list-row-chevron {
  flex-shrink: 0;
  color: var(--muted);
}
</style>
