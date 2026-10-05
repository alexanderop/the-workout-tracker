<script setup lang="ts">
import {
  onMounted,
  onBeforeUnmount,
  useTemplateRef,
  type ObjectDirective,
} from "vue";
const { modelValue, defaultValue } = defineProps<{
  modelValue?: string | number;
  defaultValue?: string | number;
}>();
const emit = defineEmits<{ "update:modelValue": [value: string | number] }>();
const input = useTemplateRef<HTMLInputElement>("input");
let resetRoot: Node | undefined;
let composing = false;
function syncValue(
  element: HTMLInputElement,
  value: string | number | undefined,
) {
  if (!composing && value !== undefined && element.value !== String(value)) {
    element.value = String(value);
  }
}
const vControlledValue: ObjectDirective<
  HTMLInputElement,
  string | number | undefined
> = {
  mounted: (element, binding) => syncValue(element, binding.value),
  updated: (element, binding) => syncValue(element, binding.value),
};
function reset(event: Event) {
  if (event.target !== input.value?.form) return;
  setTimeout(() => {
    if (
      !event.defaultPrevented &&
      input.value &&
      event.target === input.value.form &&
      modelValue !== undefined
    ) {
      emit("update:modelValue", defaultValue ?? "");
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
  resetRoot = input.value?.getRootNode();
  resetRoot?.addEventListener("reset", reset, true);
});
onBeforeUnmount(() => resetRoot?.removeEventListener("reset", reset, true));
</script>
<template>
  <input
    ref="input"
    class="ui-input"
    data-slot="input"
    :defaultValue.prop="defaultValue"
    v-controlled-value="modelValue"
    @compositionstart="composing = true"
    @compositionend="finishComposition"
    @input="update"
  />
</template>
