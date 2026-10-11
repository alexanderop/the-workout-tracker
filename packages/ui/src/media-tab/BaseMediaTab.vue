<script setup lang="ts">
// A tab-like button with a picture tile above a short caption: the active
// workout's exercise strip. `current` marks the tab that is showing (it uses
// the shared selected tokens and `aria-current`), the optional `badge` slot
// draws a small accent badge on the tile's corner (a done check), and
// `media` is the tile's content (artwork, an icon). The caller names the
// button with `aria-label` when the caption is not enough. The tile is
// decorative (the caption names the tab), so the badge cannot carry meaning on
// its own: say "done" in the `aria-label`.
defineProps<{ current?: boolean }>();
defineSlots<{
  default?: () => unknown;
  media?: () => unknown;
  badge?: () => unknown;
}>();
</script>

<template>
  <button
    type="button"
    class="ui-media-tab"
    data-slot="media-tab"
    :aria-current="current ? 'true' : undefined"
    :data-current="current ? '' : undefined"
  >
    <span class="ui-media-tab-media" aria-hidden="true"
      ><slot name="media" /><span v-if="$slots.badge" class="ui-media-tab-badge"
        ><slot name="badge" /></span
    ></span>
    <span class="ui-media-tab-label"><slot /></span>
  </button>
</template>

<style scoped>
.ui-media-tab {
  display: flex;
  flex: 0 0 calc(var(--space-8) * 1.5 + var(--space-1));
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  box-sizing: border-box;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--muted);
  font: inherit;
  cursor: pointer;
}
.ui-media-tab[data-current] {
  color: var(--ui-selected-text);
}
.ui-media-tab-media {
  position: relative;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: calc(var(--space-8) * 1.5);
  height: calc(var(--space-8) + var(--space-4));
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  background: var(--surface);
}
.ui-media-tab[data-current] .ui-media-tab-media {
  border-color: var(--ui-selected-border);
  background: var(--ui-selected-bg);
}
.ui-media-tab-badge {
  position: absolute;
  inset-block-end: 0;
  inset-inline-end: calc(var(--space-1) * -1);
  display: grid;
  place-items: center;
  width: var(--space-5);
  height: var(--space-5);
  border-radius: 50%;
  background: var(--accent);
  color: var(--on-accent);
}
.ui-media-tab-label {
  display: block;
  max-width: 100%;
  overflow: clip;
  font-size: var(--text-xs);
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ui-media-tab:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}
.ui-media-tab:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
