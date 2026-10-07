<script setup lang="ts">
import source from "../../examples/BaseInputNumber.vue.txt?raw";
import { ref } from "vue";
import { logEvent } from "histoire/client";
import { BaseInputNumber } from "@form/ui";
const weight = ref<string | number>(70.25);
const reps = ref<string | number>(8);
const empty = ref<string | number>("");
const invalid = ref<string | number>(0);
const disabled = ref(false);
const label = ref("Set 1 weight for Bench press");
</script>
<template>
  <Story title="02 Components/BaseInputNumber">
    <Variant title="Weight" :source="source">
      <div class="stack">
        <BaseInputNumber
          v-model="weight"
          title="Weight"
          :label="label"
          unit="kg"
          :decimals="2"
          :preset-step="2.5"
          :disabled="disabled"
          @open="logEvent('Weight: open', null)"
          @update:model-value="logEvent('Weight: confirmed', { value: $event })"
        />
        <p class="note">
          Committed value: {{ weight }} kg. Typing changes only the draft;
          confirmation or a quick pick emits an update.
        </p>
      </div>
      <template #controls
        ><HstText v-model="label" title="Accessible label" /><HstCheckbox
          v-model="disabled"
          title="Disabled"
      /></template>
    </Variant>
    <Variant title="Repetitions"
      ><div class="stack">
        <BaseInputNumber
          v-model="reps"
          title="Reps"
          label="Set 1 repetitions"
          :min="1"
          @update:model-value="
            logEvent('Repetitions: confirmed', { value: $event })
          "
        />
        <p class="note">Committed value: {{ reps }}. Whole numbers only.</p>
      </div></Variant
    >
    <Variant title="Empty"
      ><div class="stack">
        <BaseInputNumber
          v-model="empty"
          title="Weight"
          label="Empty weight"
          unit="kg"
          :decimals="2"
          @update:model-value="
            logEvent('Empty weight: confirmed', { value: $event })
          "
        />
        <p class="note">
          Open the editor: an empty draft cannot be confirmed. Enter a value or
          cancel.
        </p>
      </div></Variant
    >
    <Variant title="Invalid repetitions"
      ><div class="stack">
        <BaseInputNumber
          v-model="invalid"
          title="Reps"
          label="Invalid repetitions"
          :min="1"
          @update:model-value="
            logEvent('Invalid repetitions: corrected', { value: $event })
          "
        />
        <p class="note">
          Starts at 0, below the minimum of 1. Open to inspect the validation
          message and disabled confirmation.
        </p>
      </div></Variant
    >
    <Variant title="Disabled"
      ><BaseInputNumber
        :model-value="70.25"
        title="Weight"
        label="Disabled weight"
        unit="kg"
        :decimals="2"
        disabled
    /></Variant>
  </Story>
</template>
<docs lang="md">
# BaseInputNumber

## Usage

Quick weight and repetition entry with large touch targets.

## Variants

Decimal weights, whole-number repetitions, empty, invalid and disabled examples.

## States

Open the empty and invalid examples to inspect actual draft validation. Weight starts with a decimal value. Use the label control for long accessible names.

## Behavior

The first digit replaces the value. Quick picks apply immediately. Confirming applies the draft; Cancel, Escape and outside dismissal discard it. Focus returns to the trigger. The Events panel records opening and confirmed values; cancellation must not emit a model update.

## Examples and limitations

Applying changes only the field value; logging a set is separate. Header and confirmation stay visible while the editor body scrolls on short screens. Inspect Phone · short (320 × 568) and Desktop, including keyboard entry and focus restoration. Source shows the consumer wiring; import the shared styles once in your application entry point.
</docs>
