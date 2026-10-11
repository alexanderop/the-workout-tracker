<script setup lang="ts">
import { ref } from "vue";
import BaseCheckbox from "../../src/checkbox/BaseCheckbox.vue";

const replace = ref(false);
</script>

<template>
  <main>
    <BaseCheckbox v-model="replace">Replace targets</BaseCheckbox>
    <BaseCheckbox :model-value="true" disabled>Locked option</BaseCheckbox>
    <output data-testid="replace">{{ replace }}</output>
  </main>
</template>

<style scoped>
main {
  background: var(--ui-background);
  color: var(--ui-foreground);
}
</style>
