<script setup lang="ts">
import { ref } from "vue";
import { Button, Sheet, NumericInput } from "@form/ui";
const open = ref(false);
const weight = ref<string | number>(70);
</script>
<template>
  <Story title="02 Components/Sheet">
    <Variant title="Responsive layout"
      ><div class="preview stack">
        <Button @click="open = true">Open sheet</Button
        ><Sheet
          :open="open"
          title="Template settings"
          description="On mobile, this view sits at the bottom of the screen."
          @close="open = false"
          ><div class="stack">
            <NumericInput
              v-model="weight"
              title="Weight"
              label="First set weight"
              unit="kg"
              :decimals="2"
              :preset-step="2.5"
            />
            <p class="note">Committed value: {{ weight }} kg</p>
            <Button @click="open = false">Close</Button>
          </div></Sheet
        >
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# Sheet

## Usage

Several related settings or inputs in the context of the current page.

## Variants

Centered on large screens and aligned to the bottom on small screens.

## States

Open, closed and with a nested numeric editor.

## Behavior

Closing and Escape return focus to the trigger. Close a nested dialog first.

## Examples and limitations

Use for template editing or settings. Allow content to scroll on short screens and keep important actions reachable.
</docs>
