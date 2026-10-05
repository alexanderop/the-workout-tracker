<script setup lang="ts">
import {
  BaseButton,
  BaseDialog,
  BaseDialogTrigger,
  BaseDialogContent,
  BaseDialogTitle,
  BaseDialogDescription,
} from "@form/ui";
</script>
<template>
  <Story title="01 Foundations/Motion">
    <Variant title="Feedback and reduced motion"
      ><div class="stack">
        <h1>Motion explains change.</h1>
        <BaseDialog
          ><BaseDialogTrigger as-child
            ><BaseButton>View dialog transition</BaseButton></BaseDialogTrigger
          ><BaseDialogContent
            ><BaseDialogTitle>One focused task</BaseDialogTitle
            ><BaseDialogDescription
              >The shared dialog respects prefers-reduced-motion. Press Escape
              to close.</BaseDialogDescription
            ></BaseDialogContent
          ></BaseDialog
        >
        <p class="note">
          Short transitions accompany opening, closing and state changes. Avoid
          decorative loops.
        </p>
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# Motion

## Usage

Make state changes clear and provide immediate feedback.

## Variants

Hover, button press, dialog opening and closing.

## States

Respect the operating system preference for reduced motion.

## Behavior

This example uses the real shared Dialog. Its styles define transition durations and reduced-motion rules.

## Examples and limitations

Understanding an action or error must never depend on an animation.
</docs>
