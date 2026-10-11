<script setup lang="ts">
// One day in a calendar: an optional weekday caption, the day number and a dot
// that marks a day with activity. A native button, 44px at least (64px with a
// weekday). `selected` makes it a toggle (`aria-pressed`) drawn with the shared
// selected tokens; leave it unset for a cell that only acts. `today` is
// separate on purpose: a neutral outline and an underlined, bold number, so
// today and the selected day differ even when they are the same date. Name the
// cell with `aria-label` (the full date and what happened on it); it must start
// with or contain the visible weekday and number.
const {
  day,
  weekday,
  today,
  marked,
  // Left undefined on purpose: a Boolean prop would default to false and put
  // aria-pressed="false" on a cell that is not a toggle.
  selected = undefined,
} = defineProps<{
  day: number | string;
  weekday?: string;
  today?: boolean;
  marked?: boolean;
  selected?: boolean;
}>();
</script>

<template>
  <button
    type="button"
    class="ui-day-cell"
    data-slot="day-cell"
    :aria-current="today ? 'date' : undefined"
    :aria-pressed="selected"
    :data-today="today ? '' : undefined"
    :data-marked="marked ? '' : undefined"
    :data-tall="weekday ? '' : undefined"
  >
    <small v-if="weekday" class="ui-day-cell-weekday">{{
      `${weekday} `
    }}</small>
    <span class="ui-day-cell-number">{{ day }}</span>
    <i class="ui-day-cell-dot" aria-hidden="true" />
  </button>
</template>

<style scoped>
.ui-day-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  box-sizing: border-box;
  min-width: 44px;
  min-height: 44px;
  margin: 0;
  padding: 0;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: none;
  color: var(--muted);
  font: inherit;
  font-size: var(--text-xs);
  cursor: pointer;
}
.ui-day-cell[data-tall] {
  min-height: 64px;
}
.ui-day-cell-weekday {
  font-size: var(--text-xs);
}
.ui-day-cell-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--border);
}
.ui-day-cell[data-marked] .ui-day-cell-dot {
  background: var(--accent);
}
.ui-day-cell[data-today] {
  border-color: var(--muted);
  color: var(--text);
}
.ui-day-cell[data-today] .ui-day-cell-number {
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: var(--space-1);
}
.ui-day-cell[aria-pressed="true"] {
  border-color: var(--ui-selected-border);
  box-shadow: inset 0 0 0 1px var(--ui-selected-border);
  background: var(--ui-selected-bg);
  color: var(--ui-selected-text);
}
.ui-day-cell:disabled {
  opacity: 0.35;
  cursor: default;
}
.ui-day-cell:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: -2px;
}
</style>
