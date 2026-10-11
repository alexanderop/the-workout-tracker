<script setup lang="ts">
import { computed, useTemplateRef } from "vue";

export type EmptyStateSize = "compact" | "panel";

// Names what is missing and offers the next action. `panel` fills a page or
// card region; `compact` sits inside a list or section. Show real data, never
// fabricated statistics.
const { size = "panel", headingLevel = 2 } = defineProps<{
  title: string;
  body?: string;
  size?: EmptyStateSize;
  /** Heading level of the title; pick the one that fits the page outline. Use 1 when the state replaces the whole page. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}>();
defineSlots<{ icon?: () => unknown; action?: () => unknown }>();
const heading = computed(() => `h${headingLevel}`);
const titleElement = useTemplateRef<HTMLElement>("titleElement");
// The title is a programmatic focus target (tabindex -1), so a page-level
// failure can move focus to it.
defineExpose({
  focus: () => titleElement.value?.focus({ preventScroll: true }),
});
</script>

<template>
  <div class="ui-empty-state" data-slot="empty-state" :data-size="size">
    <span v-if="$slots.icon" class="ui-empty-state-icon" aria-hidden="true"
      ><slot name="icon"
    /></span>
    <component
      :is="heading"
      ref="titleElement"
      class="ui-empty-state-title"
      tabindex="-1"
      >{{ title }}</component
    >
    <p v-if="body" class="ui-empty-state-body">{{ body }}</p>
    <div v-if="$slots.action" class="ui-empty-state-action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.ui-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  box-sizing: border-box;
  text-align: center;
  color: var(--text);
}
.ui-empty-state[data-size="panel"] {
  gap: var(--space-3);
  min-height: calc(var(--space-8) * 5);
  padding: var(--space-7) var(--space-6);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
}
.ui-empty-state[data-size="compact"] {
  padding: var(--space-5) var(--space-4);
}
.ui-empty-state-icon {
  display: inline-flex;
  color: var(--accent);
}
.ui-empty-state-title {
  margin: 0;
  font-size: var(--text-base);
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.2px;
}
.ui-empty-state[data-size="panel"] .ui-empty-state-title {
  font-size: var(--text-lg);
}
.ui-empty-state-title:focus {
  outline: none;
}
.ui-empty-state-body {
  max-width: calc(var(--space-8) * 8);
  margin: 0;
  color: var(--muted);
  font-size: var(--text-sm);
  line-height: 1.5;
  text-wrap: balance;
}
.ui-empty-state-action {
  margin-block-start: var(--space-1);
}
</style>
