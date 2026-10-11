<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import { BaseDayCell } from "@form/ui";

const selected = ref(12);
const days = [9, 10, 11, 12, 13, 14, 15];
</script>

<template>
  <Story title="02 Components/BaseDayCell">
    <Variant title="Selectable month cells">
      <div class="grid" role="group" aria-label="October">
        <BaseDayCell
          v-for="day in days"
          :key="day"
          :day="day"
          :today="day === 13"
          :marked="day === 10 || day === 12"
          :selected="day === selected"
          :disabled="day > 13"
          :aria-label="`October ${day}`"
          @click="
            selected = day;
            logEvent('BaseDayCell: select', { day });
          "
        />
      </div>
    </Variant>
    <Variant title="Rhythm cells with a weekday">
      <div class="grid" role="group" aria-label="Past days">
        <BaseDayCell
          v-for="(day, index) in days"
          :key="day"
          :weekday="['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'][index]"
          :day="day"
          :today="day === 15"
          :marked="day === 10 || day === 12"
          :aria-label="`Day ${day}`"
          @click="logEvent('BaseDayCell: open', { day })"
        />
      </div>
    </Variant>
  </Story>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(44px, 1fr));
  gap: var(--space-1);
  max-width: 420px;
}
</style>

<docs lang="md">
# BaseDayCell

## Usage

One day in a calendar: an optional weekday caption, the day number and a dot that marks a day with activity.

## Variants

With `weekday` the cell is 64px tall (a row of recent days). Without it the cell is 44px (a month grid). Pass `selected` to make it a toggle with `aria-pressed`; leave it unset for a cell that only acts.

## States

`marked` colors the dot with the accent. `today` is separate from the selected look on purpose: a neutral outline and an underlined, bold number, so today and the selected day differ even when they are the same date. `selected` uses the shared selected tokens. A disabled cell (a future day) is dimmed.

## Behavior

A native `type="button"`. Name each cell with `aria-label` (the full date and what happened); the label has to contain the visible weekday and number.

## Examples and limitations

The grid, the scrolling container and the month logic belong to the application.
</docs>
