<script setup lang="ts">
// A labelled native checkbox for an option inside a form (not an immediate
// setting: that is `BaseSwitch`). The whole row is the 44px target and the
// default slot is the label. `v-model` is a boolean.
defineProps<{ disabled?: boolean }>();
defineSlots<{ default?: () => unknown }>();
const model = defineModel<boolean>({ default: false });
</script>

<template>
  <label class="ui-checkbox" data-slot="checkbox">
    <input v-model="model" type="checkbox" :disabled="disabled" />
    <span><slot /></span>
  </label>
</template>

<style scoped>
.ui-checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 44px;
  font-size: var(--text-sm);
  line-height: 1.5;
  cursor: pointer;
}
.ui-checkbox input {
  flex-shrink: 0;
  width: var(--space-5);
  height: var(--space-5);
  margin: 0;
  accent-color: var(--accent);
  cursor: inherit;
}
.ui-checkbox:has(input:focus-visible) {
  outline: 3px solid var(--focus-ring);
  outline-offset: 3px;
  border-radius: var(--radius-md);
}
.ui-checkbox:has(input:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
