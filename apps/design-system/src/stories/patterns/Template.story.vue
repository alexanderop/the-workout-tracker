<script setup lang="ts">
import { ref } from "vue";
import {
  BaseField,
  BaseFieldLabel,
  BaseFieldError,
  BaseInput,
  BaseTextarea,
  BaseInputNumber,
  BaseButton,
} from "@form/ui";
const name = ref("");
const description = ref("");
const weight = ref<string | number>(40);
const error = ref(false);
const saved = ref("");
function save() {
  error.value = !name.value.trim();
  if (!error.value)
    saved.value = `Template “${name.value}” applied in this example.`;
}
</script>
<template>
  <Story title="03 Patterns/Edit template">
    <Variant title="Form with feedback"
      ><div class="stack">
        <h1>Edit template</h1>
        <form class="stack" @submit.prevent="save">
          <BaseField :data-invalid="error || undefined"
            ><BaseFieldLabel for="template-name">Template name</BaseFieldLabel
            ><BaseInput
              id="template-name"
              v-model="name"
              :aria-invalid="error"
              :aria-describedby="error ? 'template-error' : undefined"
            /><BaseFieldError v-if="error" id="template-error"
              >Enter a name.</BaseFieldError
            ></BaseField
          ><BaseField
            ><BaseFieldLabel for="template-notes"
              >Description · optional</BaseFieldLabel
            ><BaseTextarea
              id="template-notes"
              v-model="description" /></BaseField
          ><BaseInputNumber
            v-model="weight"
            title="Weight"
            label="Template weight"
            unit="kg"
            :decimals="2"
            :preset-step="2.5"
          /><BaseButton type="submit">Apply template</BaseButton>
          <p role="status">{{ saved }}</p>
        </form>
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# Edit template

## Usage

Name and adjust a reusable workout template.

## Variants

Required name, optional description and set values.

## States

Submitting an empty name shows an error. Valid input shows confirmation.

## Behavior

Field errors explain how to continue; other inputs remain intact.

## Examples and limitations

This example validates only the name and saves nothing in browser storage. Complete rules belong to the application.
</docs>
