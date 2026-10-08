<script setup lang="ts">
import { ref } from "vue";
import BaseSwitch from "../../src/switch/BaseSwitch.vue";

// A labelled switch with its model shown next to it.
const { initial = false, disabled = false } = defineProps<{
  initial?: boolean;
  disabled?: boolean;
}>();
const enabled = ref(initial);
</script>

<template>
  <main>
    <label for="rest-timer">Rest timer</label>
    <BaseSwitch
      id="rest-timer"
      v-model="enabled"
      name="rest-timer"
      :disabled="disabled"
    />
    <output data-testid="model-value">{{ enabled }}</output>
  </main>
</template>

<style scoped>
/* Consumers own the page surface; use the themed one, as the app does. */
main {
  background: var(--ui-background);
  color: var(--ui-foreground);
}
</style>
