<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import {
  BaseSelect,
  BaseField,
  BaseFieldLabel,
  BaseFieldError,
  BaseListGroup,
  BaseListRow,
} from "@form/ui";
const rest = ref(90);
const restOptions = [30, 60, 90, 120, 180, 300].map((seconds) => ({
  value: seconds,
  label: `${seconds} sec`,
}));
const muscle = ref<string>();
const muscles = ["Back", "Chest", "Legs", "Shoulders"].map((name) => ({
  value: name.toLowerCase(),
  label: name,
}));
const exercise = ref("bench");
const exercises = [
  { value: "bench", label: "Bench press" },
  { value: "row", label: "Single-arm dumbbell row with a long name" },
  { value: "squat", label: "Back squat" },
];
const disabled = ref(false);
</script>
<template>
  <Story title="02 Components/BaseSelect">
    <Variant title="Usage"
      ><div class="stack">
        <BaseField
          ><BaseFieldLabel for="select-rest">Rest between sets</BaseFieldLabel
          ><BaseSelect
            id="select-rest"
            v-model="rest"
            :options="restOptions"
            :disabled="disabled"
            @update:model-value="
              logEvent('Select: update:modelValue', { value: $event })
            "
        /></BaseField>
      </div>
      <template #controls
        ><HstCheckbox v-model="disabled" title="Disabled" /></template
    ></Variant>
    <Variant title="In a list row"
      ><BaseListGroup
        ><BaseListRow
          label="Rest between sets"
          description="Choose the pace that suits your session."
          ><template #trailing
            ><BaseSelect
              v-model="rest"
              aria-label="Rest duration"
              :options="restOptions"
              style="width: 104px" /></template></BaseListRow></BaseListGroup
    ></Variant>
    <Variant title="States"
      ><div class="stack">
        <BaseSelect
          aria-label="Disabled selection"
          :options="restOptions"
          :model-value="90"
          disabled
        /><BaseField data-invalid="true"
          ><BaseFieldLabel for="select-error">Muscle group</BaseFieldLabel
          ><BaseSelect
            id="select-error"
            v-model="muscle"
            placeholder="Choose an option"
            aria-invalid="true"
            aria-describedby="select-error-text"
            :options="muscles"
          /><BaseFieldError id="select-error-text"
            >Choose a muscle group.</BaseFieldError
          ></BaseField
        ><BaseSelect
          v-model="exercise"
          aria-label="Exercise"
          :options="exercises"
        /></div
    ></Variant>
  </Story>
</template>
<docs lang="md">
# BaseSelect

## Usage

Choose one option from a short list, drawn with the app's own surfaces so it looks the same in Chrome on a phone as on a desktop. Pass `options` (`value` and `label`) and bind `v-model`.

## Variants

One trigger shaped like the other fields, with the current label and a chevron. The open list sits below the trigger, at least as wide as it.

## States

Closed, open, highlighted option, selected option (the shared selected look with a check), placeholder, disabled and invalid (`aria-invalid` on the trigger).

## Behavior

Reka UI supplies the combobox and listbox roles. Click, tap, Enter, Space or the arrow keys open the list; arrow keys move, typing jumps to a matching label, Enter selects and Escape closes. Focus returns to the trigger. `id`, `class` and `aria-*` reach the trigger button, so a `BaseFieldLabel for` or an `aria-label` names it.

## Examples and limitations

Use for rest duration, bar weight and the progress exercise. Long labels truncate in the trigger and wrap in the list. Multiple selection needs its own pattern.
</docs>
