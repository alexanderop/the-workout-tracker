<script setup lang="ts">
import { ref } from "vue";
import BaseSegmentedControl from "../../src/segmented/BaseSegmentedControl.vue";

const choice = ref<"system" | "light" | "dark">("system");
const options = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
] as const;
</script>

<template>
  <main>
    <BaseSegmentedControl
      v-model="choice"
      legend="Theme"
      name="theme"
      :options="options"
    />
    <output data-testid="choice">{{ choice }}</output>
  </main>
</template>

<style scoped>
main {
  background: var(--ui-background);
  color: var(--ui-foreground);
}
</style>
