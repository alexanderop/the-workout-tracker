<script setup lang="ts">
import { ref } from "vue";
import BaseInputNumber from "../../src/numeric-input/BaseInputNumber.vue";

// Shows the confirmed value next to the input, so tests can tell a draft
// from a value the component actually emitted.
const {
  initial = 70.25,
  title = "Weight",
  label = "Set 1 weight for Bench press",
  unit = "kg",
  min,
  decimals = 2,
  presetStep = 2.5,
  triggerLabel,
} = defineProps<{
  triggerLabel?: string;
  initial?: string | number;
  title?: string;
  label?: string;
  unit?: string;
  min?: number;
  decimals?: number;
  presetStep?: number;
}>();
const value = ref(initial);
</script>

<template>
  <main>
    <BaseInputNumber
      v-model="value"
      :title="title"
      :label="label"
      :unit="unit"
      :min="min"
      :decimals="decimals"
      :preset-step="presetStep"
      :aria-label="triggerLabel"
    />
    <output aria-label="Confirmed value" data-testid="confirmed-value">{{ value }}</output>
  </main>
</template>
