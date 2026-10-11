<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import { BaseColorSwatch } from "@form/ui";

const accent = ref("blue");
const accents = ["blue", "teal", "violet", "pink", "sand"];
</script>

<template>
  <Story title="02 Components/BaseColorSwatch">
    <Variant title="Accent choice">
      <fieldset class="swatches">
        <legend>Accent color</legend>
        <BaseColorSwatch
          v-for="id in accents"
          :key="id"
          v-model="accent"
          name="story-accent"
          :value="id"
          :accent="id"
          @update:model-value="logEvent('BaseColorSwatch: choose', { id })"
        >
          {{ id }}
        </BaseColorSwatch>
      </fieldset>
    </Variant>
  </Story>
</template>

<style scoped>
.swatches {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-1);
  margin: 0;
  padding: var(--space-3) var(--space-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
}
</style>

<docs lang="md">
# BaseColorSwatch

## Usage

One option of a color choice, such as the accent in Appearance: a round swatch with a caption. Give every swatch of a group the same `name`, its own `value` and the shared string `v-model`, and wrap them in a labelled fieldset.

## Variants

`accent` is the `data-accent` value that paints the dot. It resolves `--accent` for the swatch, so the fill is the color itself, in light and dark.

## States

The chosen swatch gets the shared selected ring and a check, so the choice is not color alone. Keyboard focus shows the shared 3px ring around the whole swatch.

## Behavior

A native radio covers the swatch: the whole control is the 44px target and the arrow keys move between swatches. The caption names the radio.

## Examples and limitations

The swatch fill follows the theme tokens; it does not take arbitrary colors.
</docs>
