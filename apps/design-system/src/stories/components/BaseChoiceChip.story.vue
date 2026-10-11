<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import { BaseChoiceChip } from "@form/ui";

const disabled = ref(false);
const plates = ref<Record<string, boolean>>({
  "20": true,
  "10": false,
  "5": false,
  "2.5": true,
});
const plateSizes = ["20", "10", "5", "2.5"];
const equipment = ref("barbell");
const filters = ["barbell", "dumbbell", "cable", "machine"];
</script>

<template>
  <Story title="02 Components/BaseChoiceChip">
    <Variant title="Toggle chips">
      <div class="row" role="group" aria-label="Plates in the rack">
        <BaseChoiceChip
          v-for="plate in plateSizes"
          :key="plate"
          v-model="plates[plate]"
          :disabled="disabled"
          @update:model-value="
            logEvent('BaseChoiceChip: toggle', { plate, value: $event })
          "
          >{{ plate }} kg</BaseChoiceChip
        >
      </div>
      <template #controls>
        <HstCheckbox v-model="disabled" title="Disabled" />
      </template>
    </Variant>
    <Variant title="Radio cards with media">
      <fieldset class="chip-grid">
        <legend>Equipment</legend>
        <BaseChoiceChip
          v-for="item in filters"
          :key="item"
          v-model="equipment"
          mode="radio"
          size="card"
          name="story-equipment"
          :value="item"
          :disabled="disabled"
          @update:model-value="
            logEvent('BaseChoiceChip: choose', { value: $event })
          "
        >
          <template #media>
            <svg
              viewBox="0 0 80 48"
              width="80"
              height="48"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              aria-hidden="true"
            >
              <path d="M8 24h64M16 10v28M64 10v28M24 16v16M56 16v16" />
            </svg>
          </template>
          {{ item }}
        </BaseChoiceChip>
      </fieldset>
      <p role="status">Chosen: {{ equipment }}</p>
    </Variant>
  </Story>
</template>

<style scoped>
.chip-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  border: 0;
  max-width: 420px;
}
legend {
  margin-block-end: var(--space-2);
}
</style>

<docs lang="md">
# BaseChoiceChip

## Usage

A choice that is on or off, or one of several: plates in a rack, filter options, categories. Selected always looks the same everywhere: an accent-soft surface with an accent border and text. A filled accent surface is reserved for the primary action.

## Variants

`mode="toggle"` (default) is a button with `aria-pressed` and a boolean `v-model`. `mode="radio"` is a native radio: give each chip of a group the same `name`, its own `value` and the shared `v-model`, and wrap the group in a `fieldset` with a legend or `role="radiogroup"`. `size="compact"` is a 44px chip; `size="card"` is a taller tile with a check in the corner. The `media` slot adds leading content such as an image.

## States

Unselected, selected, hover, keyboard focus and disabled. Selection is not color alone: the border gets an inner ring and cards show a check.

## Behavior

Toggle chips respond to Space and Enter. Radio chips are native radios, so a group is one tab stop and the arrow keys move and select, as in `BaseSegmentedControl`. Use `BaseSegmentedControl` for two to four short options that share a row and `BaseChoiceChip` for chips and cards.

## Examples and limitations

The media in this story is a simple drawing; real filter cards put an exercise image there.
</docs>
