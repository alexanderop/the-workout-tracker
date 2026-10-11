<script setup lang="ts">
import { ref } from "vue";
import { BaseStat, BaseStatGroup } from "@form/ui";

const value = ref("3,450");
const unit = ref("kg");
const label = ref("volume");
const count = ref(3);
const extra = [
  { value: 6, label: "exercises" },
  { value: "112", unit: "bpm", label: "peak heart rate" },
  { value: "2", unit: "PRs", label: "new records" },
];
</script>

<template>
  <Story title="02 Components/BaseStat">
    <Variant title="Usage">
      <BaseStatGroup aria-label="Workout totals">
        <BaseStat :value="12" label="sets logged" />
        <BaseStat :value="value" :unit="unit || undefined" :label="label" />
        <BaseStat value="48" unit="min" label="duration" />
        <BaseStat
          v-for="stat in extra.slice(0, count - 3)"
          :key="stat.label"
          v-bind="stat"
        />
      </BaseStatGroup>
      <template #controls>
        <HstText v-model="value" title="Value" />
        <HstText v-model="unit" title="Unit" />
        <HstText v-model="label" title="Label (try a long one)" />
        <HstNumber
          v-model="count"
          title="Stats in the group (3 to 6)"
          :min="3"
          :max="6"
        />
      </template>
    </Variant>
    <Variant title="Single stat">
      <BaseStat value="82.5" unit="kg" label="best set" />
    </Variant>
  </Story>
</template>

<docs lang="md">
# BaseStat

## Usage

One figure from a workout or a history: the value, its small unit after it, and the label underneath. `BaseStatGroup` lays several of them in one row between two hairlines, as in the Finish and Review sheets and the Progress summary. Format the value first: numbers with the locale's separators, durations with one shared formatter.

## Variants

There is one layout. A stat without a unit shows value and label only.

## States

A group wraps onto further rows when its stats no longer fit in a row, so a narrow screen never squeezes or clips them.

## Behavior

The group is static and reads in visual order: value, unit, then label. Name it with `aria-label` when the surrounding text does not.

## Examples and limitations

Change Stats in the group to see the wrapping. Values use tabular figures so columns of numbers line up.
</docs>
