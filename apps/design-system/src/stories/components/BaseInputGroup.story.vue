<script setup lang="ts">
import { ref } from "vue";
import { BaseButtonIcon, BaseInput, BaseInputGroup } from "@form/ui";
import { Search, X } from "@lucide/vue";

const query = ref("");
</script>

<template>
  <Story title="02 Components/BaseInputGroup">
    <Variant title="Usage">
      <div class="stack">
        <BaseInputGroup>
          <template #leading><Search :size="18" /></template>
          <BaseInput
            v-model="query"
            type="search"
            aria-label="Search exercises"
            placeholder="Search exercises"
          />
          <template #trailing
            ><BaseButtonIcon
              v-if="query"
              label="Clear search"
              @click="query = ''"
              ><X :size="18" /></BaseButtonIcon
          ></template>
        </BaseInputGroup>
        <p role="status">Query: {{ query || "(empty)" }}</p>
      </div>
    </Variant>
  </Story>
</template>

<docs lang="md">
# BaseInputGroup

## Usage

Wraps one `BaseInput` with an icon or an action beside it, such as a search field. The group draws the border and the focus ring so both wrap the icon and the input together.

## Variants

`leading` holds a decorative icon (hidden from assistive technology). `trailing` holds an interactive control, such as a clear button; give it an accessible name.

## States

The border turns to the accent and a ring wraps the whole group while the input has keyboard focus. The input keeps its own focus and disabled behavior.

## Behavior

The input stays a native input with its own accessible name, so pass `aria-label` or connect a `BaseFieldLabel`. Clicking the clear button should return focus to the input in the consumer.

## Examples and limitations

The clear button here only empties the sample query; it does not move focus.
</docs>
