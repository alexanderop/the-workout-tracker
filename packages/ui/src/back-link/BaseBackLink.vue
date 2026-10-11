<script setup lang="ts">
import type { Component } from "vue";
import { ChevronLeft } from "@lucide/vue";

// "‹ Settings": the one back affordance. The label names the destination, not
// the word "Back". `as` picks the element or component that renders it (a
// router link, `"button"`), so the package needs no router; attributes such as
// `href`, `to` and listeners fall through to it.
const { as = "a" } = defineProps<{ as?: string | Component }>();
defineSlots<{ default?: () => unknown }>();
</script>

<template>
  <component
    :is="as"
    class="ui-back-link"
    data-slot="back-link"
    :type="as === 'button' ? 'button' : undefined"
  >
    <ChevronLeft :size="20" aria-hidden="true" /><slot />
  </component>
</template>

<style scoped>
.ui-back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  box-sizing: border-box;
  min-height: 44px;
  padding: 0 var(--space-2);
  border: 0;
  border-radius: var(--radius-md);
  background: none;
  color: var(--accent);
  font: inherit;
  font-size: var(--text-base);
  line-height: 1.25;
  text-decoration: none;
  cursor: pointer;
}
.ui-back-link svg {
  flex-shrink: 0;
}
@media (hover: hover) and (pointer: fine) {
  .ui-back-link:hover {
    color: var(--accent-hover);
  }
}
.ui-back-link:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 3px;
}
</style>
