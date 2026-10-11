<script setup lang="ts">
import BaseActions from "../../src/actions/BaseActions.vue";
import BaseButton from "../../src/button/BaseButton.vue";
</script>

<template>
  <main>
    <BaseActions>
      <BaseButton type="button" variant="secondary">Cancel</BaseButton>
      <BaseButton type="button" variant="outline" size="sm">Edit</BaseButton>
      <BaseButton type="button">Save workout</BaseButton>
    </BaseActions>
  </main>
</template>

<style scoped>
main {
  padding: var(--space-4);
  background: var(--ui-background);
  color: var(--ui-foreground);
}
</style>
