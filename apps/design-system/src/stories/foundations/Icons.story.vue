<script setup lang="ts">
import { Plus, Check, Dumbbell, Settings, Trash2 } from "@lucide/vue";
import { BaseButton } from "@form/ui";
</script>
<template>
  <Story title="01 Foundations/Icons">
    <Variant title="Meaning and labels"
      ><div class="stack">
        <h1>Icons support an action.</h1>
        <div class="row">
          <BaseButton><Plus :size="18" aria-hidden="true" />Add exercise</BaseButton
          ><BaseButton variant="secondary"
            ><Check :size="18" aria-hidden="true" />Log set</BaseButton
          ><BaseButton variant="ghost" size="icon" aria-label="Settings"
            ><Settings :size="20"
          /></BaseButton>
        </div>
        <div class="row">
          <Dumbbell :size="24" aria-label="Workout" role="img" /><Trash2
            :size="20"
            aria-label="Remove"
            role="img"
          />
        </div>
        <p class="note">
          Lucide · consistent strokes · usually 16–24 px. Icons beside text are
          decorative.
        </p>
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# Icons

## Usage

Make meaning easier to recognize without unnecessarily replacing text.

## Variants

Icon with text, icon button and standalone symbol.

## States

The action must remain understandable without relying on color.

## Behavior

Icon buttons need aria-label; decorative icons need aria-hidden.

## Examples and limitations

Use Plus for adding and Check for confirming. Always label unfamiliar symbols.
</docs>
