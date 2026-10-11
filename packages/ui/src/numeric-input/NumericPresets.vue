<script setup lang="ts">
import { onMounted, useTemplateRef, watch } from "vue";
import BaseButton from "../button/BaseButton.vue";
import { useNumericText } from "./useNumericText";

const { presets, unit, selected, anchor } = defineProps<{
  presets: number[];
  unit: string;
  /** The preset matching the draft, highlighted while it matches. */
  selected: number | null;
  /** The value the list opens centred on. */
  anchor: number | null;
}>();
const emit = defineEmits<{ pick: [preset: number] }>();
const { text, show } = useNumericText();
const list = useTemplateRef<HTMLElement>("list");

function nearest(target: number | null): number {
  if (target === null) return 0;
  let best = 0;
  presets.forEach((preset, index) => {
    const current = presets[best] ?? preset;
    if (Math.abs(preset - target) < Math.abs(current - target)) best = index;
  });
  return best;
}
// Centres a value in the list without scrolling the page around it.
function reveal(target: number | null) {
  const container = list.value;
  const item =
    container?.querySelectorAll<HTMLElement>("button")[nearest(target)];
  if (!container || !item) return;
  container.scrollTop =
    item.offsetTop - container.clientHeight / 2 + item.offsetHeight / 2;
}
onMounted(() => reveal(anchor));
// Typing a listed value brings it into view, as a picker wheel would.
watch(
  () => selected,
  (value) => {
    if (value !== null) reveal(value);
  },
  { flush: "post" },
);
</script>

<template>
  <section
    ref="list"
    class="ui-numeric-suggestions"
    :aria-label="text.suggestions"
  >
    <BaseButton
      v-for="preset in presets"
      :key="preset"
      type="button"
      variant="secondary"
      class="ui-numeric-preset"
      :aria-current="preset === selected ? 'true' : undefined"
      @click="emit('pick', preset)"
      >{{ show(preset) }} <small v-if="unit">{{ unit }}</small></BaseButton
    >
  </section>
</template>

<style scoped>
.ui-numeric-suggestions {
  position: relative;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-block: 4px;
  scrollbar-width: none;
  scroll-behavior: smooth;
}
@media (prefers-reduced-motion: reduce) {
  .ui-numeric-suggestions {
    scroll-behavior: auto;
  }
}

.ui-numeric-preset {
  flex-shrink: 0;
  width: min(100%, 220px);
  min-height: 56px;
  padding: 8px 12px;
  border-radius: 14px;
  background: var(--ui-secondary);
  color: var(--ui-foreground);
  font-size: 20px;
  font-weight: 550;
  font-variant-numeric: tabular-nums;
  touch-action: manipulation;
}

.ui-numeric-preset small {
  font-size: inherit;
  font-weight: inherit;
}

.ui-numeric-preset[aria-current="true"] {
  background: color-mix(
    in oklch,
    var(--ui-secondary) 75%,
    var(--ui-foreground)
  );
}
@media (hover: hover) and (pointer: fine) {
  .ui-numeric-preset:hover {
    background: color-mix(
      in oklch,
      var(--ui-secondary) 85%,
      var(--ui-foreground)
    );
  }
}
@media (max-height: 600px) {
  .ui-numeric-preset {
    min-height: 48px;
    font-size: 18px;
  }
}
</style>
