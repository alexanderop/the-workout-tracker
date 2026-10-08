<script setup lang="ts">
import { ref } from "vue";
import BaseInput from "../../src/input/BaseInput.vue";
import BaseButton from "../../src/button/BaseButton.vue";

// A controlled number input inside a form, with its emitted value and type
// shown next to it so tests can read what the component reported.
const { initial = 5, defaultValue = 5 } = defineProps<{
  initial?: string | number;
  defaultValue?: string | number;
}>();
const value = ref<string | number>(initial);
</script>

<template>
  <main>
    <form aria-label="Workout settings" @submit.prevent>
      <label for="target">Target repetitions</label>
      <BaseInput
        id="target"
        v-model="value"
        type="number"
        name="target"
        :default-value="defaultValue"
      />
      <BaseButton type="reset" variant="outline">Reset</BaseButton>
      <BaseButton type="button" @click="value = 12">Use 12</BaseButton>
    </form>
    <output data-testid="model-value">{{ value }}</output>
    <output data-testid="model-type">{{ typeof value }}</output>
  </main>
</template>

<style scoped>
/* Consumers own the page surface; use the themed one, as the app does. */
main {
  background: var(--ui-background);
  color: var(--ui-foreground);
}
</style>
