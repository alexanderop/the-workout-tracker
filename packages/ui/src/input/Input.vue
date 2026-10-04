<script setup lang="ts">
import { onMounted, onBeforeUnmount, useTemplateRef } from "vue";
const props = defineProps<{
  modelValue?: string | number;
  defaultValue?: string | number;
}>();
const emit = defineEmits<{ "update:modelValue": [value: string | number] }>();
const input = useTemplateRef<HTMLInputElement>("input");
let form: HTMLFormElement | null = null;
let composing = false;
function reset(event: Event) {
  queueMicrotask(() => {
    if (
      !event.defaultPrevented &&
      input.value &&
      props.modelValue !== undefined
    ) {
      emit("update:modelValue", props.defaultValue ?? "");
    }
  });
}
function finishComposition(event: CompositionEvent) {
  composing = false;
  update(event);
}
function update(event: Event) {
  if (composing) return;
  const target = event.target;
  if (target instanceof HTMLInputElement) {
    const numeric =
      target.type === "number" ? Number.parseFloat(target.value) : NaN;
    emit("update:modelValue", Number.isNaN(numeric) ? target.value : numeric);
  }
}
onMounted(() => {
  form = input.value?.form ?? null;
  form?.addEventListener("reset", reset);
});
onBeforeUnmount(() => form?.removeEventListener("reset", reset));
</script>
<template>
  <input
    ref="input"
    class="ui-input"
    data-slot="input"
    :defaultValue.prop="defaultValue"
    v-bind="modelValue === undefined ? {} : { value: modelValue }"
    @compositionstart="composing = true"
    @compositionend="finishComposition"
    @input="update"
  />
</template>
