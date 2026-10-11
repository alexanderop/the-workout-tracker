<script setup lang="ts">
import { ref } from "vue";
import BaseColorSwatch from "../../src/color-swatch/BaseColorSwatch.vue";

const accent = ref("blue");
const accents = ["blue", "teal", "violet"];
</script>

<template>
  <fieldset>
    <legend>Accent color</legend>
    <BaseColorSwatch
      v-for="id in accents"
      :key="id"
      v-model="accent"
      name="accent"
      :value="id"
      :accent="id"
    >
      {{ id }}
    </BaseColorSwatch>
    <output data-testid="accent">{{ accent }}</output>
  </fieldset>
</template>

<style scoped>
fieldset {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  border: 0;
  background: var(--ui-background);
  color: var(--ui-foreground);
}
</style>
