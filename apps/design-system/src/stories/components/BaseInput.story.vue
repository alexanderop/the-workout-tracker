<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import {
  BaseInput,
  BaseField,
  BaseFieldLabel,
  BaseFieldDescription,
  BaseFieldError,
} from "@form/ui";
const value = ref("Morning strength");
const label = ref("Workout name");
const disabled = ref(false);
</script>
<template>
  <Story title="02 Components/BaseInput">
    <Variant title="Usage"
      ><div class="stack">
        <BaseField
          ><BaseFieldLabel for="input-name">Workout name</BaseFieldLabel
          ><BaseInput
            id="input-name"
            v-model="value"
            :disabled="disabled"
            @update:model-value="
              logEvent('BaseInput: update:modelValue', { value: $event })
            "
            aria-describedby="input-help"
          /><BaseFieldDescription id="input-help"
            >A name you will recognize later.</BaseFieldDescription
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
        <BaseField
          ><BaseFieldLabel for="input-empty">Empty</BaseFieldLabel
          ><BaseInput
            id="input-empty"
            placeholder="e.g. Upper body" /></BaseField
        ><BaseField
          ><BaseFieldLabel for="input-disabled">Disabled</BaseFieldLabel
          ><BaseInput
            id="input-disabled"
            disabled
            default-value="Unavailable" /></BaseField
        ><BaseField
          ><BaseFieldLabel for="input-readonly">Read-only</BaseFieldLabel
          ><BaseInput
            id="input-readonly"
            readonly
            default-value="Personal plan" /></BaseField
        ><BaseField data-invalid="true"
          ><BaseFieldLabel for="input-error">Error</BaseFieldLabel
          ><BaseInput
            id="input-error"
            default-value=""
            aria-invalid="true"
            aria-describedby="input-error-message"
          /><BaseFieldError id="input-error-message"
            >Enter a workout name.</BaseFieldError
          ></BaseField
        >
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# BaseInput

## Usage

Single-line, free-form text.

## Variants

Empty and filled fields; read-only and disabled.

## States

Show errors next to the field. Use Tab to inspect visible focus.

## Behavior

Text selection, copying and keyboard input remain native. Placeholders do not replace labels.

## Examples and limitations

Use for workout names and search. Choose Textarea for longer notes and Numeric Input for mobile weight entry.
</docs>
