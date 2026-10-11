<script setup lang="ts" generic="T extends string | number">
import { Check, ChevronDown } from "@lucide/vue";
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
  type AcceptableValue,
} from "reka-ui";

// A single choice drawn by the app instead of the browser: a trigger with the
// current label and a chevron opens a listbox anchored below it. Reka supplies
// the combobox and listbox roles, arrow keys, typeahead, Escape and focus
// return. `id`, `class` and `aria-*` reach the trigger button, so name it with
// a visible label's `for` or `aria-label`.
defineOptions({ inheritAttrs: false });
const {
  options,
  disabled = false,
  placeholder,
} = defineProps<{
  options: readonly { value: T; label: string }[];
  disabled?: boolean;
  placeholder?: string;
}>();
const model = defineModel<T>();

function choose(value: AcceptableValue) {
  const option = options.find((candidate) => candidate.value === value);
  if (option) model.value = option.value;
}
</script>

<template>
  <SelectRoot
    :model-value="model"
    :disabled="disabled"
    @update:model-value="choose"
  >
    <SelectTrigger v-bind="$attrs" class="ui-select-trigger" data-slot="select">
      <SelectValue class="ui-select-value" :placeholder="placeholder" />
      <SelectIcon as-child>
        <ChevronDown class="ui-select-chevron" :size="18" aria-hidden="true" />
      </SelectIcon>
    </SelectTrigger>
    <SelectPortal>
      <SelectContent
        class="ui-select-content"
        data-slot="select-content"
        position="popper"
        side="bottom"
        align="end"
        :side-offset="4"
        :collision-padding="8"
      >
        <SelectViewport class="ui-select-viewport">
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            class="ui-select-item"
          >
            <SelectItemText>{{ option.label }}</SelectItemText>
            <SelectItemIndicator class="ui-select-indicator">
              <Check :size="18" aria-hidden="true" />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
