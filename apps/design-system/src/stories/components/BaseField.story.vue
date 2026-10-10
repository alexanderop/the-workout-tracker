<script setup lang="ts">
import { ref } from "vue";
import {
  BaseField,
  BaseFieldLabel,
  BaseFieldDescription,
  BaseFieldError,
  BaseFieldSet,
  BaseFieldLegend,
  BaseFieldGroup,
  BaseFieldSeparator,
  BaseFieldContent,
  BaseFieldTitle,
  BaseInput,
  BaseSwitch,
} from "@form/ui";
const enabled = ref(true);
</script>
<template>
  <Story title="02 Components/BaseField">
    <Variant title="Labels and errors"
      ><div class="stack">
        <BaseField data-invalid="true"
          ><BaseFieldLabel for="field-name">Template name</BaseFieldLabel
          ><BaseInput
            id="field-name"
            aria-invalid="true"
            aria-describedby="field-help field-error"
          /><BaseFieldDescription id="field-help"
            >Helps you choose before your workout.</BaseFieldDescription
          ><BaseFieldError id="field-error"
            >A name is required.</BaseFieldError
          ></BaseField
        >
      </div></Variant
    >
    <Variant title="Grouping"
      ><div class="stack">
        <BaseFieldSet
          ><BaseFieldLegend>Workout</BaseFieldLegend
          ><BaseFieldDescription>Group related settings.</BaseFieldDescription
          ><BaseFieldGroup
            ><BaseField
              ><BaseFieldLabel for="group-name">Name</BaseFieldLabel
              ><BaseInput id="group-name" /></BaseField
            ><BaseFieldSeparator>Timer</BaseFieldSeparator
            ><BaseField orientation="responsive"
              ><BaseFieldContent
                ><BaseFieldTitle>Automatic rest</BaseFieldTitle
                ><BaseFieldDescription
                  >Starts after each set.</BaseFieldDescription
                ></BaseFieldContent
              ><BaseSwitch
                v-model="enabled"
                aria-label="Automatic rest" /></BaseField></BaseFieldGroup
        ></BaseFieldSet></div
    ></Variant>
  </Story>
</template>
<docs lang="md">
# BaseField

## Usage

Connect a label, control, help text and error into a clear unit.

## Variants

Vertical, horizontal or responsive; BaseFieldSet and BaseFieldLegend group related fields.

## States

Keep help text visible when an error appears.

## Behavior

Connect labels using for and id. Use aria-describedby for help and errors. The layout does not perform automatic validation.

## Examples and limitations

Use in templates and settings. Do not put several unlabeled controls into a single Field.
</docs>
