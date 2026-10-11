<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue";

export type PageHeaderVariant = "root" | "detail";

// The heading of a screen. `root` is the large title of a tab root (Workouts,
// Exercises, Progress, Settings): no back link. `detail` is a bar pinned to the
// top of a screen reached from a root, with a back link on the left; it also
// covers the device safe area. The title is the page's h1 and uses the text
// color, never the accent. The title slot replaces the title text inside the
// h1, so it must still render some text.
const { variant } = defineProps<{
  variant: PageHeaderVariant;
  title?: string;
}>();
defineSlots<{
  back?: () => unknown;
  title?: () => unknown;
  action?: () => unknown;
}>();
const heading = useTemplateRef<HTMLElement>("heading");
const focus = () => heading.value?.focus({ preventScroll: true });
// A detail screen's heading takes focus when it appears, so arriving readers
// hear where they are. A tab root leaves focus to the shell.
onMounted(() => {
  if (variant === "detail") focus();
});
defineExpose({ focus });
</script>

<template>
  <header
    class="ui-page-header"
    data-slot="page-header"
    :data-variant="variant"
  >
    <div v-if="variant === 'detail'" class="ui-page-header-back">
      <slot name="back" />
    </div>
    <h1 ref="heading" class="ui-page-header-title" tabindex="-1">
      <slot name="title">{{ title }}</slot>
    </h1>
    <div class="ui-page-header-action"><slot name="action" /></div>
  </header>
</template>

<style scoped>
.ui-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
/* The 44px floor keeps the title at one height whether or not the screen has
   an action, so titles sit at the same place on every tab. */
.ui-page-header[data-variant="root"] {
  min-height: 44px;
  margin-block-end: var(--space-4);
}
.ui-page-header[data-variant="root"] .ui-page-header-title {
  min-width: 0;
  font-size: var(--text-2xl);
  line-height: 1.15;
  letter-spacing: -0.8px;
}
.ui-page-header[data-variant="detail"] {
  position: sticky;
  inset-block-start: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: minmax(max-content, 1fr) auto minmax(0, 1fr);
  gap: 0;
  margin-block: calc(-1 * env(safe-area-inset-top, 0px)) var(--space-5);
  padding-block: env(safe-area-inset-top, 0px) var(--space-2);
  border-block-end: 1px solid var(--text);
  background: var(--background);
}
.ui-page-header-back {
  justify-self: start;
}
/* Optical alignment: the link text lines up with the page gutter. */
.ui-page-header-back :deep(.ui-back-link) {
  margin-inline-start: calc(-1 * var(--space-2));
}
.ui-page-header-title {
  max-width: none;
  margin: 0;
  color: var(--text);
  font-size: var(--text-base);
  font-weight: 600;
  letter-spacing: -0.2px;
  line-height: 1.3;
  overflow-wrap: anywhere;
}
/* A long name shows two lines at most, so the pinned bar stays short. */
.ui-page-header[data-variant="detail"] .ui-page-header-title {
  display: -webkit-box;
  padding-inline: var(--space-2);
  overflow: hidden;
  text-align: center;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
.ui-page-header-title:focus-visible {
  outline: none;
}
.ui-page-header-action {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
}
.ui-page-header[data-variant="detail"] .ui-page-header-action {
  justify-self: end;
}
</style>
