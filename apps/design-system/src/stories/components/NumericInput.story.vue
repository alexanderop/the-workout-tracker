<script setup lang="ts">
import { ref } from "vue";
import { NumericInput } from "@form/ui";
const weight = ref<string | number>(70);
const reps = ref<string | number>(8);
const disabled = ref(false);
</script>
<template>
  <Story title="02 Components/Numeric Input">
    <Variant title="Weight"
      ><div class="preview stack">
        <NumericInput
          v-model="weight"
          title="Weight"
          label="Set 1 weight for Bench press"
          unit="kg"
          :decimals="2"
          :preset-step="2.5"
          :disabled="disabled"
        />
        <p class="note">
          Committed value: {{ weight }} kg. Opening and typing do not change
          this value until confirmation.
        </p>
      </div>
      <template #controls
        ><HstCheckbox v-model="disabled" title="Disabled" /></template
    ></Variant>
    <Variant title="Repetitions"
      ><div class="preview stack">
        <NumericInput
          v-model="reps"
          title="Reps"
          label="Set 1 repetitions for Bench press"
          :min="1"
        />
        <p class="note">
          Committed value: {{ reps }}. Whole numbers only; zero cannot be
          confirmed.
        </p>
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# Numeric Input

## Usage

Quick weight and repetition entry with large touch targets.

## Variants

Decimal weights with kg; whole-number repetitions.

## States

Existing value, local draft, invalid or empty input and disabled. Enter 0 in the repetitions example to see the invalid state.

## Behavior

The first digit replaces the value. Quick picks apply immediately. Confirming applies the draft; Cancel, Escape and clicking outside discard it. Focus returns to the trigger.

## Examples and limitations

Applying changes only the field value. Logging a set remains a separate action. Use Input for free-form text.
</docs>
