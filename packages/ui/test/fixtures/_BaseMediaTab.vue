<script setup lang="ts">
import { ref } from "vue";
import BaseMediaTab from "../../src/media-tab/BaseMediaTab.vue";

const current = ref("squat");
const names = ["squat", "bench"];
</script>

<template>
  <nav aria-label="Exercises">
    <BaseMediaTab
      v-for="name in names"
      :key="name"
      :current="current === name"
      @click="current = name"
    >
      <template #media><span class="art">art</span></template>
      <template v-if="name === 'bench'" #badge>ok</template>
      {{ name }}
    </BaseMediaTab>
    <BaseMediaTab disabled aria-label="Add exercises">
      <template #media>+</template>
      Add
    </BaseMediaTab>
    <output data-testid="current">{{ current }}</output>
  </nav>
</template>

<style scoped>
nav {
  display: flex;
  gap: var(--space-2);
  background: var(--ui-background);
  color: var(--ui-foreground);
}
</style>
