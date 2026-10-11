<script setup lang="ts">
import { computed, ref } from "vue";
import BaseInputNumber from "../../src/numeric-input/BaseInputNumber.vue";
import { defaultUiText, provideUiText } from "../../src/ui-text";

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
  separator = ".",
  aside = false,
} = defineProps<{
  /** Renders the aside slot with the draft value it receives. */
  aside?: boolean;
  triggerLabel?: string;
  separator?: string;
  initial?: string | number;
  title?: string;
  label?: string;
  unit?: string;
  min?: number;
  decimals?: number;
  presetStep?: number;
}>();
const value = ref(initial);
provideUiText(
  computed(() => ({
    ...defaultUiText,
    numeric: { ...defaultUiText.numeric, decimalSeparator: separator },
  })),
);
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
    >
      <template v-if="aside" #aside="{ value: draft }">
        <span data-testid="aside-value">{{ draft ?? "none" }}</span>
      </template>
    </BaseInputNumber>
    <output aria-label="Confirmed value" data-testid="confirmed-value">{{
      value
    }}</output>
  </main>
</template>
