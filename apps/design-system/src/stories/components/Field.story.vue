<script setup lang="ts">
import { ref } from "vue";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldSet,
  FieldLegend,
  FieldGroup,
  FieldSeparator,
  FieldContent,
  FieldTitle,
  Input,
  Switch,
} from "@form/ui";
const enabled = ref(true);
</script>
<template>
  <Story title="02 Components/Field">
    <Variant title="Labels and errors"
      ><div class="preview stack">
        <Field data-invalid="true"
          ><FieldLabel for="field-name">Template name</FieldLabel
          ><Input
            id="field-name"
            aria-invalid="true"
            aria-describedby="field-help field-error"
          /><FieldDescription id="field-help"
            >Helps you choose before your workout.</FieldDescription
          ><FieldError id="field-error">A name is required.</FieldError></Field
        >
      </div></Variant
    >
    <Variant title="Grouping"
      ><div class="preview stack">
        <FieldSet
          ><FieldLegend>Workout</FieldLegend
          ><FieldDescription
            >Group related settings.</FieldDescription
          ><FieldGroup
            ><Field
              ><FieldLabel for="group-name">Name</FieldLabel
              ><Input id="group-name" /></Field
            ><FieldSeparator>Timer</FieldSeparator
            ><Field orientation="responsive"
              ><FieldContent
                ><FieldTitle>Automatic rest</FieldTitle
                ><FieldDescription
                  >Starts after each set.</FieldDescription
                ></FieldContent
              ><Switch
                v-model="enabled"
                aria-label="Automatic rest" /></Field></FieldGroup
        ></FieldSet></div
    ></Variant>
  </Story>
</template>
<docs lang="md">
# Field

## Usage

Connect a label, control, help text and error into a clear unit.

## Variants

Vertical, horizontal or responsive; FieldSet and FieldLegend group related fields.

## States

Keep help text visible when an error appears.

## Behavior

Connect labels using for and id. Use aria-describedby for help and errors. The layout does not perform automatic validation.

## Examples and limitations

Use in templates and settings. Do not put several unlabeled controls into a single Field.
</docs>
