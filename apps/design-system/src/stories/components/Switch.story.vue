<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import { Switch, Field, FieldLabel, FieldDescription } from "@form/ui";
const enabled = ref(true);
const label = ref("Automatic rest timer");
const disabled = ref(false);
</script>
<template>
  <Story title="02 Components/Switch">
    <Variant title="Usage"
      ><div class="stack">
        <Field orientation="horizontal"
          ><FieldLabel for="switch-rest">Automatic rest timer</FieldLabel
          ><Switch
            id="switch-rest"
            v-model="enabled"
            :disabled="disabled"
            @update:model-value="
              logEvent('Switch: update:modelValue', { value: $event })
            " /></Field
        ><FieldDescription
          >The timer starts after you log a set.</FieldDescription
        >
        <p role="status">{{ enabled ? "Enabled" : "Disabled" }}</p>
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
        <Field orientation="horizontal"
          ><FieldLabel for="switch-on">On</FieldLabel
          ><Switch id="switch-on" :model-value="true" disabled /></Field
        ><Field orientation="horizontal"
          ><FieldLabel for="switch-off">Off</FieldLabel
          ><Switch id="switch-off" :model-value="false" disabled
        /></Field></div
    ></Variant>
  </Story>
</template>
<docs lang="md">
# Switch

## Usage

A yes/no setting that takes effect immediately.

## Variants

On and off; both can be disabled.

## States

The visual switch position and accessible state represent the same value.

## Behavior

Tab moves focus to the switch; Space toggles it. A persistent label describes its purpose.

## Examples and limitations

Use for an automatic timer. It does not replace a submit button. This example changes only local story state.
</docs>
