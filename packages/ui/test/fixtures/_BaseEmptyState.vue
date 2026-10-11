<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { Dumbbell } from "@lucide/vue";
import BaseButton from "../../src/button/BaseButton.vue";
import BaseEmptyState from "../../src/empty-state/BaseEmptyState.vue";

const created = ref(0);
const page = useTemplateRef<InstanceType<typeof BaseEmptyState>>("page");
</script>

<template>
  <main>
    <BaseEmptyState
      title="No workouts yet"
      body="Start your first session and it appears here."
    >
      <template #icon><Dumbbell :size="28" /></template>
      <template #action
        ><BaseButton type="button" @click="created += 1"
          >Start workout</BaseButton
        ></template
      >
    </BaseEmptyState>
    <BaseEmptyState size="compact" :heading-level="3" title="No results" />
    <BaseEmptyState ref="page" :heading-level="1" title="Page failed" />
    <button type="button" @click="page?.focus()">Focus page title</button>
    <output data-testid="created">{{ created }}</output>
  </main>
</template>

<style scoped>
main {
  background: var(--ui-background);
  color: var(--ui-foreground);
}
</style>
