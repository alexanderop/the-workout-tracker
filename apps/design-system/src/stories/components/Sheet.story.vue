<script setup lang="ts">
import source from "../../examples/Sheet.vue.txt?raw";
import { ref } from "vue";
import { logEvent } from "histoire/client";
import { Button, Sheet, NumericInput } from "@form/ui";
const open = ref(false);
const weight = ref<string | number>(70);
const longContent = ref(false);
const wide = ref(false);
function closeSheet() {
  open.value = false;
  logEvent("Sheet: close", null);
}
</script>
<template>
  <Story title="02 Components/Sheet">
    <Variant title="Responsive layout" :source="source"
      ><div class="stack">
        <Button @click="open = true">Open sheet</Button
        ><Sheet
          :open="open"
          :wide="wide"
          title="Template settings"
          description="On mobile, this view sits at the bottom of the screen."
          @close="closeSheet"
          ><div class="stack">
            <NumericInput
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
            <Button @click="closeSheet">Close</Button>
          </div></Sheet
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
# Sheet

## Usage

Several related settings or inputs in the context of the current page.

## Variants

Centered on large screens and aligned to the bottom on small screens.

## States

Open, closed, wide, long content and a nested numeric editor. Enable Long content in Controls to inspect scrolling.

## Behavior

Closing and Escape return focus to the trigger. Close a nested dialog first. At Phone · short, scroll to the final Close action. Escape from the numeric editor should return focus to its trigger inside the sheet; a second Escape returns to Open sheet. Compare Sheet · bottom and Sheet · centered. Events show nested updates and sheet closing.

## Examples and limitations

Use for template editing or settings. Allow content to scroll on short screens and keep important actions reachable.
</docs>
