<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue";

// A detail screen's pinned bar: a back control on the left and the screen
// title as the page heading. The heading takes focus when the bar appears, so
// arriving readers hear where they are.
defineProps<{ title: string }>();
defineSlots<{ back?: () => unknown }>();
const heading = useTemplateRef<HTMLElement>("heading");
onMounted(() => heading.value?.focus({ preventScroll: true }));
</script>

<template>
  <header class="ui-screen-header">
    <div class="ui-screen-header-back"><slot name="back" /></div>
    <h1 ref="heading" class="ui-screen-header-title" tabindex="-1">
      {{ title }}
    </h1>
    <span />
  </header>
</template>

<style scoped>
.ui-screen-header {
  position: sticky;
  inset-block-start: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: minmax(max-content, 1fr) auto minmax(0, 1fr);
  align-items: center;
  margin-block: calc(-1 * env(safe-area-inset-top, 0px)) 20px;
  padding-block: env(safe-area-inset-top, 0px) 8px;
  border-block-end: 1px solid var(--text);
  background: var(--background);
}
.ui-screen-header-back {
  justify-self: start;
}
.ui-screen-header-back :deep(a),
.ui-screen-header-back :deep(button) {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  min-height: 44px;
  margin-inline-start: -8px;
  padding: 0 8px;
  border-radius: 8px;
  color: var(--accent);
  font-size: 16px;
  text-decoration: none;
}
.ui-screen-header-title {
  max-width: none;
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.2px;
  line-height: 1.3;
  text-align: center;
}
.ui-screen-header-title:focus-visible {
  outline: none;
}
</style>
