<script setup lang="ts">
// Wraps one BaseInput with an icon or action on either side, such as a search
// field. The group draws the border and the focus ring so both wrap the icon
// and the input together. The leading slot is decorative: give the input its
// own accessible name. Put interactive controls (a clear button) in `trailing`.
defineSlots<{
  default?: () => unknown;
  leading?: () => unknown;
  trailing?: () => unknown;
}>();
</script>

<template>
  <div class="ui-input-group" data-slot="input-group">
    <span
      v-if="$slots.leading"
      class="ui-input-group-leading"
      aria-hidden="true"
      ><slot name="leading"
    /></span>
    <slot />
    <span v-if="$slots.trailing" class="ui-input-group-trailing"
      ><slot name="trailing"
    /></span>
  </div>
</template>

<style scoped>
.ui-input-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  box-sizing: border-box;
  min-height: 44px;
  padding-inline: var(--space-3);
  border: 1px solid var(--ui-input);
  border-radius: var(--radius-md);
  background: var(--ui-card);
  color: var(--muted);
  box-shadow: 0 1px 2px var(--ui-shadow-soft);
}
.ui-input-group:focus-within {
  border-color: var(--accent);
}
.ui-input-group:has(.ui-input:focus-visible) {
  outline: 3px solid var(--focus-ring);
  outline-offset: 3px;
}
.ui-input-group :deep(.ui-input) {
  flex: 1;
  height: auto;
  min-height: 42px;
  padding-inline: 0;
  border: 0;
  background: none;
  box-shadow: none;
  outline-color: transparent;
}
.ui-input-group-leading,
.ui-input-group-trailing {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
}
.ui-input-group-trailing {
  margin-inline-end: calc(-1 * var(--space-2));
}
</style>
