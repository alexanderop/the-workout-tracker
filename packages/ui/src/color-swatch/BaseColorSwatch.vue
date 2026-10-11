<script setup lang="ts">
// One option of a color choice, such as the accent in Appearance: a round
// swatch with a caption. A native radio covers it, so the whole control is the
// target and arrow keys move between swatches. Give every swatch of a group
// the same `name`, its own `value` and the shared string `v-model`, and wrap
// them in a labelled fieldset. `accent` is the `data-accent` value that paints
// the swatch (it resolves --accent for the dot, so the fill is the color
// itself). The chosen swatch gets the shared selected ring and a check.
import { computed } from "vue";
import { Check } from "@lucide/vue";

const {
  value,
  name,
  accent,
  disabled = false,
} = defineProps<{
  value: string;
  name: string;
  accent: string;
  disabled?: boolean;
}>();
defineSlots<{ default?: () => unknown }>();
const model = defineModel<string>();
const checked = computed(() => model.value === value);
</script>

<template>
  <label
    class="ui-color-swatch"
    data-slot="color-swatch"
    :data-checked="checked ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
  >
    <input
      type="radio"
      class="ui-color-swatch-input"
      :name="name"
      :value="value"
      :checked="checked"
      :disabled="disabled"
      @change="model = value"
    />
    <span class="ui-color-swatch-ring">
      <span class="ui-color-swatch-dot" :data-accent="accent">
        <Check :size="18" stroke-width="3" aria-hidden="true" />
      </span>
    </span>
    <span class="ui-color-swatch-label"><slot /></span>
  </label>
</template>

<style scoped>
.ui-color-swatch {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  min-height: 44px;
  color: var(--muted);
  font-size: var(--text-sm);
  cursor: pointer;
}
.ui-color-swatch[data-checked] {
  color: var(--text);
  font-weight: 600;
}
.ui-color-swatch[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
.ui-color-swatch-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: inherit;
}
.ui-color-swatch:has(.ui-color-swatch-input:focus-visible) {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: var(--radius-md);
}
.ui-color-swatch-ring {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 2px solid transparent;
  border-radius: 50%;
}
.ui-color-swatch[data-checked] .ui-color-swatch-ring {
  border-color: var(--ui-selected-border);
}
.ui-color-swatch-dot {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--on-accent);
}
.ui-color-swatch-dot svg {
  visibility: hidden;
}
.ui-color-swatch[data-checked] .ui-color-swatch-dot svg {
  visibility: visible;
}
</style>
