<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import { BaseMediaTab } from "@form/ui";
import { Check, Dumbbell, Plus } from "@lucide/vue";

const names = ["Back squat", "Bench press", "Barbell row"];
const current = ref("Back squat");
const disabled = ref(false);
</script>

<template>
  <Story title="02 Components/BaseMediaTab">
    <Variant title="Usage">
      <nav class="strip" aria-label="Exercises">
        <BaseMediaTab
          v-for="name in names"
          :key="name"
          :current="current === name"
          @click="
            current = name;
            logEvent('BaseMediaTab: choose', { name });
          "
        >
          <template #media><Dumbbell :size="28" /></template>
          <template v-if="name === 'Bench press'" #badge
            ><Check :size="14"
          /></template>
          {{ name }}
        </BaseMediaTab>
        <BaseMediaTab
          :disabled="disabled"
          aria-label="Add exercises"
          @click="logEvent('BaseMediaTab: add', null)"
        >
          <template #media><Plus :size="24" /></template>
          Add
        </BaseMediaTab>
      </nav>
      <template #controls
        ><HstCheckbox v-model="disabled" title="Disable the add tab"
      /></template>
    </Variant>
  </Story>
</template>

<style scoped>
.strip {
  display: flex;
  gap: var(--space-3);
  overflow-x: auto;
  padding: var(--space-2);
}
</style>

<docs lang="md">
# BaseMediaTab

## Usage

A tab-like button with a picture tile above a short caption. The active workout's exercise strip is built from it: one tab per exercise and a trailing "Add" tab.

## Variants

The `media` slot is the tile (artwork or an icon), the default slot is the caption, and the optional `badge` slot draws a small accent badge on the tile's corner (a check for a finished exercise).

## States

`current` marks the tab that is showing: the tile takes the shared selected tokens and the button gets `aria-current="true"`. A disabled tab is dimmed. Keyboard focus shows the shared 3px ring.

## Behavior

A native `type="button"`; attributes and listeners fall through. The tile is decorative and hidden from assistive technology, so the caption names the tab. When the badge carries a state, say it in `aria-label` ("Back squat, all sets logged").

## Examples and limitations

The caption is one line and truncates. The strip's scrolling and snapping belong to the application.
</docs>
