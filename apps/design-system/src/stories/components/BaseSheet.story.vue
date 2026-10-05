<script setup lang="ts">
import source from "../../examples/BaseSheet.vue.txt?raw";
import { ref } from "vue";
import { logEvent } from "histoire/client";
import { BaseButton, BaseSheet, BaseInputNumber } from "@form/ui";
const open = ref(false);
const weight = ref<string | number>(70);
const longContent = ref(false);
const wide = ref(false);
function closeSheet() {
  open.value = false;
  logEvent("BaseSheet: close", null);
}
</script>
<template>
  <Story title="02 Components/BaseSheet">
    <Variant title="Responsive layout" :source="source"
      ><div class="stack">
        <BaseButton @click="open = true">Open sheet</BaseButton
        ><BaseSheet
          :open="open"
          :wide="wide"
          title="Template settings"
          description="On mobile, this view sits at the bottom of the screen."
          @close="closeSheet"
          @close-auto-focus="logEvent('BaseSheet: close auto focus', null)"
          ><div class="stack">
            <BaseInputNumber
              v-model="weight"
              @open="logEvent('Nested numeric editor: open', null)"
              @update:model-value="
                logEvent('Sheet weight: confirmed', { value: $event })
              "
              title="Weight"
              label="First set weight"
              unit="kg"
              :decimals="2"
              :preset-step="2.5"
            />
            <p class="note">Committed value: {{ weight }} kg</p>
            <template v-if="longContent"
              ><p v-for="index in 12" :key="index" class="note">
                Exercise {{ index }}: review the planned weight and repetitions
                before your next session. This is illustrative content for
                scrolling.
              </p></template
            >
            <BaseButton @click="closeSheet">Close</BaseButton>
          </div></BaseSheet
        >
      </div>
      <template #controls
        ><HstCheckbox v-model="longContent" title="Long content" /><HstCheckbox
          v-model="wide"
          title="Wide sheet" /></template
    ></Variant>
  </Story>
</template>
<docs lang="md">
# BaseSheet

## Usage

Several related settings or inputs in the context of the current page.

## Variants

Centered with a subtle scale/fade on large screens; slides from the bottom on small screens. Entrance is 240ms and exit is 180ms. Reduced motion removes both. No swipe-dismiss gesture is provided.

## States

Open, closed, wide, long content and a nested numeric editor. Enable Long content in Controls to inspect scrolling.

## Behavior

Closing and Escape return focus to the trigger. The optional `close-auto-focus` event runs before restoration; call `event.preventDefault()` when the action requires focus on a different destination. Close a nested dialog first. At Phone · short, scroll to the final Close action. Escape from the numeric editor should return focus to its trigger inside the sheet; a second Escape returns to Open sheet. Compare Sheet · bottom and Sheet · centered. Events show nested updates and sheet closing.

## Examples and limitations

Use for template editing or settings. Allow content to scroll on short screens and keep important actions reachable.
</docs>
