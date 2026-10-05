<script setup lang="ts">
import { ref } from "vue";
import { BaseButtonIcon } from "@form/ui";
import { Settings2, X, MoreHorizontal } from "@lucide/vue";
const disabled = ref(false);
const clicks = ref(0);
</script>

<template>
  <Story title="02 Components/BaseButtonIcon">
    <Variant title="Shapes and states" auto-props-disabled>
      <div class="stack">
        <div class="row">
          <BaseButtonIcon
            label="Open settings"
            shape="circle"
            variant="outline"
            :disabled="disabled"
            @click="clicks++"
            ><Settings2
          /></BaseButtonIcon>
          <BaseButtonIcon label="Close" :disabled="disabled" @click="clicks++"
            ><X
          /></BaseButtonIcon>
          <BaseButtonIcon label="More options" disabled
            ><MoreHorizontal
          /></BaseButtonIcon>
        </div>
        <p>Illustrative activations: {{ clicks }}</p>
      </div>
      <template #controls
        ><HstCheckbox v-model="disabled" title="Disabled"
      /></template>
    </Variant>
  </Story>
</template>

<docs lang="md">
# BaseButtonIcon

## Usage

Use for a familiar action represented by one icon. Supply a descriptive `label`.

## Variants

Square or circle shape; shared Button color variants.

## States

Enabled, hover, keyboard focus and disabled. All targets are at least 44 × 44 CSS pixels.

## Behavior

Native button with type="button" by default. Tab focuses it; Enter and Space activate it.
The icon is decorative; the label names the action. Disabled controls cannot activate.

## Examples and limitations

Settings, close and more options. Use a text Button for unfamiliar actions. Consumers own placement;
the component owns centering, icon size and the touch target. The counter is illustrative only.
</docs>
