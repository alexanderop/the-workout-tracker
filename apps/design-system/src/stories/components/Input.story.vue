<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import {
  Input,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@form/ui";
const value = ref("Morning strength");
const label = ref("Workout name");
const disabled = ref(false);
</script>
<template>
  <Story title="02 Components/Input">
    <Variant title="Usage"
      ><div class="stack">
        <Field
          ><FieldLabel for="input-name">Workout name</FieldLabel
          ><Input
            id="input-name"
            v-model="value"
            :disabled="disabled"
            @update:model-value="logEvent('Input: update:modelValue', { value: $event })"
            aria-describedby="input-help"
          /><FieldDescription id="input-help"
            >A name you will recognize later.</FieldDescription
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
        <Field
          ><FieldLabel for="input-empty">Empty</FieldLabel
          ><Input id="input-empty" placeholder="e.g. Upper body" /></Field
        ><Field
          ><FieldLabel for="input-disabled">Disabled</FieldLabel
          ><Input
            id="input-disabled"
            disabled
            default-value="Unavailable" /></Field
        ><Field
          ><FieldLabel for="input-readonly">Read-only</FieldLabel
          ><Input
            id="input-readonly"
            readonly
            default-value="Personal plan" /></Field
        ><Field data-invalid="true"
          ><FieldLabel for="input-error">Error</FieldLabel
          ><Input
            id="input-error"
            default-value=""
            aria-invalid="true"
            aria-describedby="input-error-message"
          /><FieldError id="input-error-message"
            >Enter a workout name.</FieldError
          ></Field
        >
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# Input

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
