<script setup lang="ts">
import { logEvent } from "histoire/client";
import { BaseActions, BaseButton } from "@form/ui";
</script>

<template>
  <Story title="02 Components/BaseActions">
    <Variant title="Two actions">
      <BaseActions>
        <BaseButton
          variant="secondary"
          @click="logEvent('BaseActions: cancel', null)"
          >Keep training</BaseButton
        >
        <BaseButton @click="logEvent('BaseActions: save', null)"
          >Save workout</BaseButton
        >
      </BaseActions>
    </Variant>
    <Variant title="Three actions">
      <BaseActions>
        <BaseButton variant="secondary">Edit workout</BaseButton>
        <BaseButton variant="outline">Save as template</BaseButton>
        <BaseButton>Repeat workout</BaseButton>
      </BaseActions>
    </Variant>
  </Story>
</template>

<docs lang="md">
# BaseActions

## Usage

The button row at the end of a sheet, dialog or form. Put the primary action last. `BaseConfirmSheet` uses it, and every other sheet footer should too.

## Variants

On phones (up to 650px) the buttons stack full width in source order, so the primary ends at the bottom, within thumb reach, like the sticky "Start" action of the exercise picker. On wider screens they sit in one right-aligned row with the primary on the right. `sticky` pins the row to the bottom edge of a `BaseSheet` while long content scrolls.

## States

Every button in the row gets the same 44px height, whatever size it was given. Disabled buttons keep their place.

## Behavior

The row is only layout. Tab order follows the source order, which matches the visual order in both layouts.

## Examples and limitations

Resize the viewport to switch between the stacked and row layouts. A tertiary text action, such as "Create your own exercise", belongs above the row as a `BaseButton variant="link"`, not inside it.
</docs>
