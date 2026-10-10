<script setup lang="ts">
import { ref } from "vue";
import { Check } from "@lucide/vue";
import { BaseButton, BaseFeedback } from "@form/ui";
const logged = ref(false);
</script>
<template>
  <Story title="02 Components/BaseFeedback">
    <Variant title="Confirmed change">
      <div class="stack">
        <BaseButton :aria-pressed="logged" @click="logged = !logged">
          <BaseFeedback :active="logged"><Check :size="20" /></BaseFeedback>
          {{ logged ? "Undo sample log" : "Log sample set" }}
        </BaseButton>
        <p role="status">
          {{ logged ? "Sample set logged" : "Sample set not logged" }}
        </p>
      </div>
    </Variant>
    <Variant title="Already confirmed">
      <BaseFeedback active><Check :size="20" /> Already logged</BaseFeedback>
    </Variant>
  </Story>
</template>
<docs lang="md">
# BaseFeedback

## Usage

Wrap a confirmation icon inside its existing button. The consumer owns the accessible label and saved state.

## Variants

A new confirmation and an initially confirmed value.

## States

Only false-to-true changes animate. Undo, mounting saved history, and numeric draft confirmation do not.

## Behavior

A 320ms scale response; reduced motion retains the final icon without movement. No timers or delayed actions.

## Examples and limitations

This story changes local sample state, not workout storage. Pass canonical success, not a click or pending request.
</docs>
