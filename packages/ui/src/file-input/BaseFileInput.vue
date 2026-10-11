<script setup lang="ts">
import { useTemplateRef } from "vue";

// A visually hidden native file input, opened by a button of the caller's
// choice (`open()`), so the page keeps its own button and the browser keeps its
// native file picker. It is not in the tab order: the button is the control.
// `select` carries the chosen file. The input then clears itself, so choosing
// the same file again still fires. `label` names the input for assistive
// technology and tests.
defineProps<{ label: string; accept?: string; disabled?: boolean }>();
const emit = defineEmits<{ select: [file: File] }>();
const input = useTemplateRef<HTMLInputElement>("input");
function onChange() {
  const element = input.value;
  const file = element?.files?.[0];
  if (!element || !file) return;
  emit("select", file);
  element.value = "";
}
defineExpose({ open: () => input.value?.click() });
</script>

<template>
  <input
    ref="input"
    type="file"
    class="ui-file-input"
    data-slot="file-input"
    tabindex="-1"
    :accept="accept"
    :disabled="disabled"
    :aria-label="label"
    @change="onChange"
  />
</template>

<style scoped>
.ui-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  border: 0;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
