<script setup lang="ts">
import BaseStat from "../../src/stat/BaseStat.vue";
import BaseStatGroup from "../../src/stat/BaseStatGroup.vue";
</script>

<template>
  <main>
    <BaseStatGroup aria-label="Workout totals">
      <BaseStat :value="12" label="sets logged" />
      <BaseStat value="3,450" unit="kg" label="volume" />
      <BaseStat value="48:10" label="elapsed" />
    </BaseStatGroup>
  </main>
</template>

<style scoped>
main {
  background: var(--ui-background);
  color: var(--ui-foreground);
}
</style>
