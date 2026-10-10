<script setup lang="ts">
import { computed } from "vue";
import { BaseButton } from "@form/ui";
import { findPreview, previewUrl } from "./previewCatalog";
const { scenario, revision = 0 } = defineProps<{
  scenario: string;
  revision?: number;
}>();
const emit = defineEmits<{ reset: [] }>();
const example = computed(() => findPreview(scenario));
function resetExample() {
  emit("reset");
}
</script>

<template>
  <section v-if="example" class="preview-controls" aria-label="Example guide">
    <p class="preview-controls-label">Implemented product · Sample data</p>
    <h2>{{ example.title }}</h2>
    <p>{{ example.description }}</p>
    <BaseButton variant="secondary" @click="resetExample"
      >Reset example</BaseButton
    >
    <a :href="previewUrl(scenario)" target="_blank" rel="noopener"
      >Open example in a new tab</a
    >
    <p role="status">
      {{
        revision
          ? "Example restored to its starting state."
          : "Edits stay in this example."
      }}
    </p>
    <template v-if="example.steps?.length">
      <h3>Try this journey</h3>
      <ol>
        <li v-for="step in example.steps" :key="step">{{ step }}</li>
      </ol>
    </template>
    <p>
      Use the viewport menu to switch between phone and desktop. Reset restores
      sample data and navigation.
    </p>
    <p>
      Changes disappear on reset or reload. Installation and offline behavior
      are not demonstrated here.
    </p>
  </section>
</template>

<style scoped>
.preview-controls {
  display: grid;
  gap: 16px;
  padding: 20px;
  font-size: 14px;
  line-height: 1.6;
}
.preview-controls h2,
.preview-controls h3,
.preview-controls p,
.preview-controls ol {
  margin: 0;
}
.preview-controls h2 {
  font-size: 20px;
}
.preview-controls h3 {
  font-size: 15px;
}
.preview-controls ol {
  padding-inline-start: 20px;
}
.preview-controls li + li {
  margin-block-start: 8px;
}
.preview-controls a {
  color: var(--ui-primary);
  text-decoration: underline;
}
.preview-controls a:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 4px;
}
.preview-controls-label {
  color: var(--ui-muted-foreground);
  font-size: 12px;
}
</style>
