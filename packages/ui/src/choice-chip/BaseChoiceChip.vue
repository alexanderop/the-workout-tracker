<script setup lang="ts">
import { computed } from "vue";
import { Check } from "@lucide/vue";

export type ChoiceChipMode = "toggle" | "radio";
export type ChoiceChipSize = "compact" | "card";

// The one "selected" look, read from the --ui-selected-* tokens: a soft accent
// surface with an accent border and text (a filled accent is reserved for the
// primary action). The border gains
// an inner ring and `card` shows a check, so selection is not color alone.
//
// `toggle` is a button with aria-pressed; `v-model` is a boolean. `radio` is a
// native radio: give every chip of a group the same `name`, its own `value`
// and the shared `v-model`, and wrap them in a labelled fieldset or
// role="radiogroup". Arrow keys then move between chips natively.
const {
  mode = "toggle",
  size = "compact",
  value,
  name,
  disabled = false,
} = defineProps<{
  mode?: ChoiceChipMode;
  size?: ChoiceChipSize;
  /** Radio mode: the value this chip stands for. */
  value?: string;
  /** Radio mode: the shared group name. */
  name?: string;
  disabled?: boolean;
}>();
defineSlots<{ default?: () => unknown; media?: () => unknown }>();
const model = defineModel<boolean | string>();
const selected = computed(() =>
  mode === "radio" ? model.value === value : model.value === true,
);
</script>

<template>
  <label
    v-if="mode === 'radio'"
    class="ui-choice-chip"
    data-slot="choice-chip"
    :data-size="size"
    :data-selected="selected ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
  >
    <input
      type="radio"
      class="ui-choice-chip-input"
      :name="name"
      :value="value"
      :checked="selected"
      :disabled="disabled"
      @change="model = value"
    />
    <span v-if="$slots.media" class="ui-choice-chip-media"
      ><slot name="media"
    /></span>
    <span class="ui-choice-chip-label"><slot /></span>
    <Check
      v-if="size === 'card'"
      class="ui-choice-chip-check"
      :size="18"
      aria-hidden="true"
    />
  </label>
  <button
    v-else
    type="button"
    class="ui-choice-chip"
    data-slot="choice-chip"
    :data-size="size"
    :data-selected="selected ? '' : undefined"
    :aria-pressed="selected"
    :disabled="disabled"
    @click="model = !selected"
  >
    <span v-if="$slots.media" class="ui-choice-chip-media"
      ><slot name="media"
    /></span>
    <span class="ui-choice-chip-label"><slot /></span>
    <Check
      v-if="size === 'card'"
      class="ui-choice-chip-check"
      :size="18"
      aria-hidden="true"
    />
  </button>
</template>

<style scoped>
.ui-choice-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  box-sizing: border-box;
  min-width: 44px;
  min-height: 44px;
  margin: 0;
  padding: 0 var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: var(--text-sm);
  font-weight: 550;
  line-height: 1.25;
  text-align: center;
  cursor: pointer;
  overflow-wrap: anywhere;
}
.ui-choice-chip[data-size="card"] {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: calc(var(--space-8) * 3);
  padding: var(--space-4) var(--space-3);
}
.ui-choice-chip[data-selected] {
  border-color: var(--ui-selected-border);
  box-shadow: inset 0 0 0 1px var(--ui-selected-border);
  background: var(--ui-selected-bg);
  color: var(--ui-selected-text);
}
@media (hover: hover) and (pointer: fine) {
  .ui-choice-chip:not([data-selected]):not(:disabled):not(
      [data-disabled]
    ):hover {
    background: var(--hover);
  }
}
.ui-choice-chip:focus-visible,
.ui-choice-chip:has(:focus-visible) {
  outline: 3px solid var(--focus-ring);
  outline-offset: 3px;
}
.ui-choice-chip:disabled,
.ui-choice-chip[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
/* The native radio covers the chip, so the whole chip is the target. */
.ui-choice-chip-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: inherit;
}
.ui-choice-chip-media {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
}
.ui-choice-chip-media :deep(img) {
  display: block;
  width: 100%;
  max-height: calc(var(--space-8) * 2);
  object-fit: contain;
}
/* A card's artwork gets one height, so labels line up across a grid. */
.ui-choice-chip[data-size="card"] .ui-choice-chip-media :deep(img) {
  height: calc(var(--space-8) * 2);
}
.ui-choice-chip-check {
  display: none;
}
.ui-choice-chip[data-selected] .ui-choice-chip-check {
  position: absolute;
  inset-block-start: var(--space-2);
  inset-inline-end: var(--space-2);
  display: block;
  color: var(--ui-selected-text);
}
</style>
