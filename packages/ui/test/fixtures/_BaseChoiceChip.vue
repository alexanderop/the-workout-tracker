<script setup lang="ts">
import { ref } from "vue";
import BaseChoiceChip from "../../src/choice-chip/BaseChoiceChip.vue";

const flat = ref(false);
const equipment = ref("barbell");
</script>

<template>
  <main>
    <BaseChoiceChip v-model="flat">Flat bench</BaseChoiceChip>
    <fieldset>
      <legend>Equipment</legend>
      <BaseChoiceChip
        v-for="item in ['barbell', 'dumbbell', 'cable']"
        :key="item"
        v-model="equipment"
        mode="radio"
        size="card"
        name="equipment"
        :value="item"
      >
        <template #media
          ><span class="art">{{ item }} art</span></template
        >
        {{ item }}
      </BaseChoiceChip>
    </fieldset>
    <BaseChoiceChip :model-value="false" disabled>Locked</BaseChoiceChip>
    <output data-testid="flat">{{ flat }}</output>
    <output data-testid="equipment">{{ equipment }}</output>
  </main>
</template>

<style scoped>
main {
  display: grid;
  gap: var(--space-3);
  background: var(--ui-background);
  color: var(--ui-foreground);
}
fieldset {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  border: 0;
}
</style>
