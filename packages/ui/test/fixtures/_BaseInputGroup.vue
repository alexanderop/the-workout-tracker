<script setup lang="ts">
import { ref } from "vue";
import { Search } from "@lucide/vue";
import BaseButtonIcon from "../../src/button/BaseButtonIcon.vue";
import BaseInput from "../../src/input/BaseInput.vue";
import BaseInputGroup from "../../src/input/BaseInputGroup.vue";

const query = ref("");
</script>

<template>
  <main>
    <BaseInputGroup>
      <template #leading><Search :size="18" /></template>
      <BaseInput v-model="query" type="search" aria-label="Search exercises" />
      <template #trailing
        ><BaseButtonIcon v-if="query" label="Clear search" @click="query = ''"
          >x</BaseButtonIcon
        ></template
      >
    </BaseInputGroup>
    <output data-testid="query">{{ query }}</output>
  </main>
</template>

<style scoped>
main {
  background: var(--ui-background);
  color: var(--ui-foreground);
}
</style>
