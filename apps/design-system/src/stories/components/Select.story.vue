<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import { NativeSelect, Field, FieldLabel, FieldError } from "@form/ui";
const rest = ref<string | number>(90);
const label = ref("Rest between sets");
const disabled = ref(false);
</script>
<template>
  <Story title="02 Components/Select">
    <Variant title="Usage"
      ><div class="stack">
        <Field
          ><FieldLabel for="select-rest">Rest between sets</FieldLabel
          ><NativeSelect
            id="select-rest"
            v-model="rest"
            :disabled="disabled"
            @update:model-value="logEvent('Select: update:modelValue', { value: $event })"
            ><option
              v-for="seconds in [30, 60, 90, 120, 180]"
              :key="seconds"
              :value="seconds"
            >
              {{ seconds }} seconds
            </option></NativeSelect
          ></Field
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
        <NativeSelect aria-label="Disabled selection" disabled
          ><option>90 seconds</option></NativeSelect
        ><Field data-invalid="true"
          ><FieldLabel for="select-error">Muscle group</FieldLabel
          ><NativeSelect
            id="select-error"
            aria-invalid="true"
            aria-describedby="select-error-text"
            ><option value="">Choose an option</option>
            <option>Back</option></NativeSelect
          ><FieldError id="select-error-text"
            >Choose a muscle group.</FieldError
          ></Field
        >
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# Select

## Usage

Choose one option from a manageable list.

## Variants

NativeSelect uses the selection interface provided by the browser and operating system.

## States

Selected, open, focused, disabled and invalid.

## Behavior

Keyboard interaction and mobile selection are native. Try opening the control and using the arrow keys.

## Examples and limitations

Use for rest duration or workout filters. Multiple selection needs its own pattern rather than a single Select.
</docs>
