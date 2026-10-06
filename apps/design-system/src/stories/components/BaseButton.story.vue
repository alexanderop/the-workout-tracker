<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import { BaseButton, type ButtonVariant, type ButtonSize } from "@form/ui";
const variants: ButtonVariant[] = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
];
const sizes: ButtonSize[] = [
  "default",
  "xs",
  "sm",
  "lg",
  "icon",
  "icon-xs",
  "icon-sm",
  "icon-lg",
];
const variant = ref<ButtonVariant>("default");
const size = ref<ButtonSize>("default");
const disabled = ref(false);
const label = ref("Start workout");
</script>
<template>
  <Story id="components-button" title="02 Components/BaseButton">
    <Variant id="usage" title="Usage" auto-props-disabled>
      <div class="story-content">
        <BaseButton
          :variant="variant"
          :size="size"
          :disabled="disabled"
          :aria-label="label"
          @click="logEvent('BaseButton: click', { label })"
          >{{ size.startsWith("icon") ? "+" : label }}</BaseButton
        >
      </div>
      <template #controls>
        <HstText v-model="label" title="Label" />
        <HstSelect v-model="variant" title="Variant" :options="variants" />
        <HstSelect v-model="size" title="Size" :options="sizes" />
        <HstCheckbox v-model="disabled" title="Disabled" />
      </template>
    </Variant>
    <Variant title="Variants and states"
      ><div class="stack">
        <div class="row">
          <BaseButton v-for="item in variants" :key="item" :variant="item">{{
            item
          }}</BaseButton>
        </div>
        <div class="row">
          <BaseButton
            v-for="item in variants"
            :key="item"
            :variant="item"
            disabled
            >{{ item }}</BaseButton
          >
        </div>
      </div></Variant
    >
    <Variant title="Sizes"
      ><div class="row">
        <BaseButton
          v-for="item in sizes"
          :key="item"
          :size="item"
          :aria-label="item"
          >{{ item.startsWith("icon") ? "+" : item }}</BaseButton
        >
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# BaseButton

## Usage

Trigger an action. Use one prominent primary action per section.

## Variants

Primary, secondary, outline, ghost, destructive and link; eight sizes.

## States

Default, hover, pressed, keyboard focus and disabled. Use Tab to inspect focus and hold the mouse button to inspect the pressed state.

## Behavior

Enter and Space activate the button. Set type="button" for secondary actions inside forms.

## Examples and limitations

“Start workout” is primary. “Cancel” is secondary. Reserve destructive styling for deletion; icon buttons need an accessible name.
</docs>
