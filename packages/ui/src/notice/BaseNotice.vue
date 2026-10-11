<script setup lang="ts">
import { computed } from "vue";
import { CircleAlert, CircleCheck, Info, X } from "@lucide/vue";
import BaseButtonIcon from "../button/BaseButtonIcon.vue";

export type NoticeTone = "info" | "success" | "danger";

// A message about a page region. The palette has no warning color, so tone is
// carried by the icon and shape as well as color. `danger` interrupts screen
// readers (role alert); `info` and `success` wait their turn (role status).
const { tone = "info", dismissLabel } = defineProps<{
  tone?: NoticeTone;
  /** Names the dismiss button. The button only shows when this is set. */
  dismissLabel?: string;
}>();
const emit = defineEmits<{ dismiss: [] }>();
defineSlots<{ default?: () => unknown; action?: () => unknown }>();
const icon = computed(
  () => ({ info: Info, success: CircleCheck, danger: CircleAlert })[tone],
);
</script>

<template>
  <div
    class="ui-notice"
    data-slot="notice"
    :data-tone="tone"
    :role="tone === 'danger' ? 'alert' : 'status'"
  >
    <component
      :is="icon"
      class="ui-notice-icon"
      :size="20"
      aria-hidden="true"
    />
    <div class="ui-notice-body"><slot /></div>
    <div v-if="$slots.action" class="ui-notice-action">
      <slot name="action" />
    </div>
    <BaseButtonIcon
      v-if="dismissLabel"
      class="ui-notice-dismiss"
      :label="dismissLabel"
      @click="emit('dismiss')"
      ><X :size="18"
    /></BaseButtonIcon>
  </div>
</template>

<style scoped>
.ui-notice {
  --notice-tone: var(--accent);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-3);
  box-sizing: border-box;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--notice-tone);
  border-radius: var(--radius-md);
  background: var(--accent-soft);
  color: var(--text);
  font-size: var(--text-sm);
  line-height: 1.5;
}
.ui-notice[data-tone="success"] {
  background: var(--surface);
}
.ui-notice[data-tone="danger"] {
  --notice-tone: var(--danger);
  background: color-mix(in srgb, var(--danger) 10%, var(--surface));
}
.ui-notice-icon {
  flex-shrink: 0;
  color: var(--notice-tone);
}
.ui-notice-body {
  flex: 1 1 0;
  min-width: calc(var(--space-8) * 3);
  overflow-wrap: anywhere;
}
.ui-notice-action {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: var(--space-2);
}
.ui-notice-dismiss {
  /* The 44px target would otherwise grow the notice around one line of text. */
  margin-block: calc(-1 * var(--space-2));
  margin-inline-end: calc(-1 * var(--space-2));
}
</style>
