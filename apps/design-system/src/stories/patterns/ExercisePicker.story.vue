<script setup lang="ts">
import { computed, ref } from "vue";
import { Input, Button } from "@form/ui";
const search = ref("");
const selected = ref<string[]>([]);
const result = ref("");
const exercises = ["Bench press", "Squat", "Pull-up", "Row"];
const matches = computed(() =>
  exercises.filter((name) =>
    name.toLowerCase().includes(search.value.toLowerCase()),
  ),
);
function toggle(name: string) {
  selected.value = selected.value.includes(name)
    ? selected.value.filter((item) => item !== name)
    : [...selected.value, name];
}
</script>
<template>
  <Story title="03 Patterns/Select exercises">
    <Variant title="Search and select"
      ><div class="stack">
        <h1>Add exercises</h1>
        <Input
          v-model="search"
          aria-label="Search exercises"
          placeholder="Search exercises"
        />
        <div class="stack">
          <Button
            v-for="name in matches"
            :key="name"
            variant="outline"
            :aria-pressed="selected.includes(name)"
            @click="toggle(name)"
            >{{ selected.includes(name) ? "✓ " : "" }}{{ name }}</Button
          >
        </div>
        <p v-if="!matches.length" role="status">
          No results. Try another search term.
        </p>
        <Button
          :disabled="!selected.length"
          @click="result = selected.join(', ')"
          >Apply selection ({{ selected.length }})</Button
        >
        <p role="status">{{ result }}</p>
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# Select exercises

## Usage

Build a selection before applying it.

## Variants

Search, results, selection and a shared confirmation action.

## States

Unselected, selected, no results and empty selection.

## Behavior

aria-pressed communicates selection independently of the checkmark. The primary action stays disabled until an item is selected.

## Examples and limitations

Four fixed examples, with no product catalog import. A checkbox list would be another suitable implementation.
</docs>
