<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import { BaseTextarea, BaseField, BaseFieldLabel, BaseFieldError } from "@form/ui";
const notes = ref("");
const label = ref("Workout notes");
const disabled = ref(false);
</script>
<template>
  <Story title="02 Components/BaseTextarea">
    <Variant title="Usage"
      ><div class="stack">
        <BaseField
          ><BaseFieldLabel for="notes">Workout notes</BaseFieldLabel
          ><BaseTextarea
            id="notes"
            v-model="notes"
            :disabled="disabled"
            @update:model-value="
              logEvent('BaseTextarea: update:modelValue', { value: $event })
            "
            :rows="4"
            placeholder="What would you like to remember?"
        /></BaseField>
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
        <BaseTextarea
          aria-label="Filled note"
          model-value="Train at a deliberately slower pace today."
          readonly
        /><BaseTextarea
          aria-label="Disabled note"
          disabled
          model-value="Editing unavailable"
        /><BaseField data-invalid="true"
          ><BaseFieldLabel for="notes-error">Note too long</BaseFieldLabel
          ><BaseTextarea
            id="notes-error"
            aria-invalid="true"
            aria-describedby="notes-error-text"
          /><BaseFieldError id="notes-error-text"
            >Shorten the note to 240 characters.</BaseFieldError
          ></BaseField
        >
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# BaseTextarea

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
