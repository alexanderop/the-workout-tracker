<script setup lang="ts">
import { computed } from "vue";
import { findPreview, previewUrl } from "./previewCatalog";
const { scenario, revision = 0 } = defineProps<{ scenario: string; revision?: number }>();
const example = computed(() => findPreview(scenario));
</script>

<template>
  <iframe
    v-if="example"
    :key="`${scenario}:${revision}`"
    class="product-preview-frame"
    :src="previewUrl(scenario)"
    :title="`The Workout Tracker: ${example.title}. Interactive sample.`"
  />
  <p v-else role="alert">This example is unavailable: {{ scenario }}. Choose another state.</p>
</template>

<style scoped>
.product-preview-frame {
  display: block;
  width: 100%;
  height: 100dvh;
  border: 0;
  background: var(--ui-background);
}
</style>
