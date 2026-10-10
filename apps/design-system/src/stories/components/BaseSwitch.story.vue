<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import {
  BaseSwitch,
  BaseField,
  BaseFieldLabel,
  BaseFieldDescription,
} from "@form/ui";
const enabled = ref(true);
const label = ref("Automatic rest timer");
const disabled = ref(false);
</script>
<template>
  <Story title="02 Components/BaseSwitch">
    <Variant title="Usage"
      ><div class="stack">
        <BaseField orientation="horizontal"
          ><BaseFieldLabel for="switch-rest"
            >Automatic rest timer</BaseFieldLabel
          ><BaseSwitch
            id="switch-rest"
            v-model="enabled"
            :disabled="disabled"
            @update:model-value="
              logEvent('BaseSwitch: update:modelValue', { value: $event })
            " /></BaseField
        ><BaseFieldDescription
          >The timer starts after you log a set.</BaseFieldDescription
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
        <BaseField orientation="horizontal"
          ><BaseFieldLabel for="switch-on">On</BaseFieldLabel
          ><BaseSwitch id="switch-on" model-value disabled /></BaseField
        ><BaseField orientation="horizontal"
          ><BaseFieldLabel for="switch-off">Off</BaseFieldLabel
          ><BaseSwitch id="switch-off" :model-value="false" disabled
        /></BaseField></div
    ></Variant>
  </Story>
</template>
<docs lang="md">
# BaseSwitch

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
