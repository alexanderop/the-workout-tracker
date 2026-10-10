<script setup lang="ts" generic="T extends string">
import type { Component } from "vue";

// A native radio group drawn as a segmented control. The legend is visually
// hidden, so name the choice in the surrounding text as well.
defineProps<{
  legend: string;
  name: string;
  options: readonly { id: T; label: string; icon?: Component }[];
}>();
const model = defineModel<T>({ required: true });
</script>

<template>
  <fieldset class="ui-segmented">
    <legend class="ui-segmented-legend">{{ legend }}</legend>
    <label v-for="option in options" :key="option.id" class="ui-segment">
      <input
        v-model="model"
        type="radio"
        class="ui-segment-input"
        :name="name"
        :value="option.id"
      />
      <component
        :is="option.icon"
        v-if="option.icon"
        :size="18"
        aria-hidden="true"
      />
      {{ option.label }}
    </label>
  </fieldset>
</template>

<style scoped>
.ui-segmented {
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  gap: 4px;
  min-width: 0;
  margin: 0;
  padding: 4px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: color-mix(in srgb, var(--muted) 10%, var(--background));
}
.ui-segmented-legend {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: clip;
  clip-path: inset(50%);
  white-space: nowrap;
}
.ui-segment {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}
.ui-segment:has(:checked) {
  border-color: var(--border);
  background: var(--surface);
  box-shadow: 0 1px 2px var(--ui-shadow-soft);
  color: var(--text);
  font-weight: 600;
}
.ui-segment:has(:focus-visible) {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}
/* The native radio covers its label, so the whole segment is the target. */
.ui-segment-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}
</style>
