<script setup lang="ts">
import { ref } from "vue";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldSet,
  FieldLegend,
  FieldGroup,
  Switch,
  NativeSelect,
} from "@form/ui";
const autoRest = ref(true);
const rest = ref<string | number>(90);
</script>
<template>
  <Story title="03 Patterns/Settings">
    <Variant title="Related settings"
      ><div class="preview stack">
        <h1>Your workout space</h1>
        <FieldSet
          ><FieldLegend>Workout</FieldLegend
          ><FieldGroup
            ><Field orientation="horizontal"
              ><FieldLabel for="settings-auto">Automatic timer</FieldLabel
              ><Switch id="settings-auto" v-model="autoRest" /></Field
            ><FieldDescription
              >Starts the rest timer after you log a set.</FieldDescription
            ><Field
              ><FieldLabel for="settings-rest">Rest duration</FieldLabel
              ><NativeSelect id="settings-rest" v-model="rest"
                ><option
                  v-for="seconds in [30, 60, 90, 120, 180]"
                  :key="seconds"
                  :value="seconds"
                >
                  {{ seconds }} seconds
                </option></NativeSelect
              ></Field
            ></FieldGroup
          ></FieldSet
        >
        <p class="note">
          These settings apply only within this example.
        </p>
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# Settings

## Usage

Group occasional decisions by purpose.

## Variants

An immediate toggle and fixed selection values.

## States

On, off and selected rest duration.

## Behavior

Labels describe the function; help text explains the effect.

## Examples and limitations

Weight units, import and export require additional product logic; this story is a design composition.
</docs>
