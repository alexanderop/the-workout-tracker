<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import { BaseInputNumber, BaseButton } from "@form/ui";
const weight = ref<string | number>(70);
const reps = ref<string | number>(8);
const logged = ref("");
function logSet() {
  logged.value = `${weight.value} kg × ${reps.value}`;
  logEvent("Illustrative set: logged", {
    weight: weight.value,
    reps: reps.value,
  });
}
</script>
<template>
  <Story title="03 Patterns/Enter a workout set">
    <Variant title="Edit and log"
      ><div class="stack">
        <h1>Bench press</h1>
        <p class="note">
          Interactive design example. It is not connected to your workout data.
        </p>
        <div class="pattern-card stack">
          <strong>Set 1</strong>
          <div class="pattern-grid">
            <div>
              <p>Weight · kg</p>
              <BaseInputNumber
                v-model="weight"
                title="Weight"
                label="Set 1 weight"
                unit="kg"
                :decimals="2"
                :preset-step="2.5"
              />
            </div>
            <div>
              <p>Repetitions</p>
              <BaseInputNumber
                v-model="reps"
                title="Reps"
                label="Set 1 repetitions"
                :min="1"
              />
            </div>
          </div>
          <BaseButton @click="logSet">Log set</BaseButton>
          <p role="status">
            {{ logged ? `Last logged: ${logged}` : "Not logged yet" }}
          </p>
        </div>
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# Enter a workout set

## Usage

Complete a recurring action with little effort.

## Variants

Separate weight and repetition inputs, followed by logging.

## States

The draft and logged value are displayed separately.

## Behavior

Confirming a number changes only the field; logging the set copies both values into local example state.

## Examples and limitations

No workout persistence or timer logic lives in this story. Product logic stays in the workout app.
</docs>
