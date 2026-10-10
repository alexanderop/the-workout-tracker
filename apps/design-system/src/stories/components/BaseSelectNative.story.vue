<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import {
  BaseSelectNative,
  BaseField,
  BaseFieldLabel,
  BaseFieldError,
} from "@form/ui";
const rest = ref<string | number>(90);
const label = ref("Rest between sets");
const disabled = ref(false);
</script>
<template>
  <Story title="02 Components/BaseSelectNative">
    <Variant title="Usage"
      ><div class="stack">
        <BaseField
          ><BaseFieldLabel for="select-rest">Rest between sets</BaseFieldLabel
          ><BaseSelectNative
            id="select-rest"
            v-model="rest"
            :disabled="disabled"
            @update:model-value="
              logEvent('Select: update:modelValue', { value: $event })
            "
            ><option
              v-for="seconds in [30, 60, 90, 120, 180]"
              :key="seconds"
              :value="seconds"
            >
              {{ seconds }} seconds
            </option></BaseSelectNative
          ></BaseField
        >
      </div>
      <template #controls
        ><HstText
          v-model="label"
          title="Label (try a long sentence)" /><HstCheckbox
          v-model="disabled"
          title="Disabled" /></template
    ></Variant>
    <Variant title="States"
      ><div class="stack">
        <BaseSelectNative aria-label="Disabled selection" disabled
          ><option>90 seconds</option></BaseSelectNative
        ><BaseField data-invalid="true"
          ><BaseFieldLabel for="select-error">Muscle group</BaseFieldLabel
          ><BaseSelectNative
            id="select-error"
            aria-invalid="true"
            aria-describedby="select-error-text"
            ><option value="">Choose an option</option>
            <option>Back</option></BaseSelectNative
          ><BaseFieldError id="select-error-text"
            >Choose a muscle group.</BaseFieldError
          ></BaseField
        >
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# BaseSelectNative

## Usage

Choose one option from a manageable list.

## Variants

BaseSelectNative uses the selection interface provided by the browser and operating system.

## States

Selected, open, focused, disabled and invalid.

## Behavior

Keyboard interaction and mobile selection are native. Try opening the control and using the arrow keys.

## Examples and limitations

Use for rest duration or workout filters. Multiple selection needs its own pattern rather than a single Select.
</docs>
