<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { BaseButton, BaseFileInput } from "@form/ui";
import { Upload } from "@lucide/vue";

const input = useTemplateRef<InstanceType<typeof BaseFileInput>>("input");
const chosen = ref("No file chosen");
</script>

<template>
  <Story title="02 Components/BaseFileInput">
    <Variant title="Opened by a button">
      <div class="stack">
        <BaseButton variant="secondary" @click="input?.open()"
          ><Upload :size="17" aria-hidden="true" />Choose backup</BaseButton
        >
        <BaseFileInput
          ref="input"
          accept="application/json,.json"
          label="Choose backup file"
          @select="chosen = `${$event.name} (${$event.size} bytes)`"
        />
        <p role="status">{{ chosen }}</p>
      </div>
    </Variant>
  </Story>
</template>

<style scoped>
.stack {
  display: grid;
  justify-items: start;
  gap: var(--space-3);
}
</style>

<docs lang="md">
# BaseFileInput

## Usage

A visually hidden native file input that a button of your choice opens with `open()`. The page keeps its own button and the browser keeps its native file picker.

## Variants

`accept` restricts the picker. `label` is required: it names the input for assistive technology and tests.

## States

The input is out of the tab order, because the button is the control. `disabled` blocks the picker.

## Behavior

`select` carries the chosen `File`. The input then clears itself, so choosing the same file again fires again. Size limits, reading and errors belong to the caller.

## Examples and limitations

The story only shows the chosen name. It does not upload anything.
</docs>
