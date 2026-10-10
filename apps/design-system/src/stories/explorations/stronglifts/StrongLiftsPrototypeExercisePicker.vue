<script setup lang="ts">
import { computed, ref } from "vue";
import { BaseButton, BaseSheet } from "@form/ui";
const { existing } = defineProps<{ existing: string[] }>();
const emit = defineEmits<{ close: []; add: [name: string] }>();
const search = ref("");
const options = [
  "Squat",
  "Bench Press",
  "Barbell Row",
  "Overhead Press",
  "Deadlift",
  "Romanian Deadlift",
  "Incline Bench Press",
  "Lat Pulldown",
];
const filtered = computed(() =>
  options.filter((name) =>
    name.toLowerCase().includes(search.value.trim().toLowerCase()),
  ),
);
</script>
<template>
  <BaseSheet
    open
    title="Add an exercise"
    description="Keep building your workout as you go."
    @close="emit('close')"
  >
    <div class="sl-editor">
      <label class="sl-search"
        >Find an exercise<input
          v-model="search"
          type="search"
          placeholder="Search exercises…"
      /></label>
      <p>
        Choose an exercise, then configure its sets, target reps and weight. The
        editable starting values are 3 × 8 at 20 kg.
      </p>
      <div class="sl-picker">
        <BaseButton
          v-for="name in filtered"
          :key="name"
          variant="secondary"
          :disabled="existing.includes(name)"
          @click="emit('add', name)"
          >{{ name }}{{ existing.includes(name) ? " · Added" : "" }}</BaseButton
        >
      </div>
      <p v-if="!filtered.length">No matches in this sample library.</p>
    </div>
  </BaseSheet>
</template>
