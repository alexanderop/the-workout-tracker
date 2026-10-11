<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import { BaseCheckbox } from "@form/ui";

const replace = ref(false);
const disabled = ref(false);
</script>

<template>
  <Story title="02 Components/BaseCheckbox">
    <Variant title="Usage">
      <BaseCheckbox
        v-model="replace"
        :disabled="disabled"
        @update:model-value="logEvent('BaseCheckbox: toggle', { replace })"
        >Replace targets for every set</BaseCheckbox
      >
      <template #controls
        ><HstCheckbox v-model="disabled" title="Disabled"
      /></template>
    </Variant>
  </Story>
</template>

<docs lang="md">
# BaseCheckbox

## Usage

A labelled native checkbox for an option inside a form. Use `BaseSwitch` for a setting that applies at once.

## Variants

The default slot is the label; `v-model` is a boolean.

## States

Unchecked, checked, keyboard focus (the shared 3px ring) and disabled.

## Behavior

The whole row is the 44px target; Space toggles it. The label text names the checkbox.

## Examples and limitations

There is no indeterminate state.
</docs>
