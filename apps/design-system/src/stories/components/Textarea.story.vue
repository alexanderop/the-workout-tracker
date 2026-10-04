<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import { Textarea, Field, FieldLabel, FieldError } from "@form/ui";
const notes = ref("");
const label = ref("Workout notes");
const disabled = ref(false);
</script>
<template>
  <Story title="02 Components/Textarea">
    <Variant title="Usage"
      ><div class="stack">
        <Field
          ><FieldLabel for="notes">Workout notes</FieldLabel
          ><Textarea
            id="notes"
            v-model="notes"
            :disabled="disabled"
            @update:model-value="
              logEvent('Textarea: update:modelValue', { value: $event })
            "
            :rows="4"
            placeholder="What would you like to remember?"
        /></Field>
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
        <Textarea
          aria-label="Filled note"
          :model-value="'Train at a deliberately slower pace today.'"
          readonly
        /><Textarea
          aria-label="Disabled note"
          disabled
          :model-value="'Editing unavailable'"
        /><Field data-invalid="true"
          ><FieldLabel for="notes-error">Note too long</FieldLabel
          ><Textarea
            id="notes-error"
            aria-invalid="true"
            aria-describedby="notes-error-text"
          /><FieldError id="notes-error-text"
            >Shorten the note to 240 characters.</FieldError
          ></Field
        >
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# Textarea

## Usage

Multiline descriptions and notes.

## Variants

Short descriptions or longer notes with an appropriate row count.

## States

Empty, filled, read-only, disabled and invalid.

## Behavior

Enter inserts a line break. Typing must not unexpectedly submit the form.

## Examples and limitations

Use for optional template descriptions. Character limits and validation belong to the form; the error example only demonstrates the state.
</docs>
