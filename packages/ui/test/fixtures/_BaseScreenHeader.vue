<script setup lang="ts">
import { ref } from "vue";
import BaseScreenHeader from "../../src/screen/BaseScreenHeader.vue";

// The screen opens on request, like a page after a navigation.
const { open = true } = defineProps<{ open?: boolean }>();
const shown = ref(open);
</script>

<template>
  <main>
    <button type="button" @click="shown = true">Open screen</button>
    <template v-if="shown">
      <BaseScreenHeader title="Appearance">
        <template #back><a href="#settings">Settings</a></template>
      </BaseScreenHeader>
      <p v-for="n in 40" :key="n">Row {{ n }}</p>
    </template>
  </main>
</template>

<style scoped>
main {
  background: var(--ui-background);
  color: var(--ui-foreground);
}
</style>
