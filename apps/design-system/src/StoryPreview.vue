<script setup lang="ts">
import { computed } from "vue";
import type { Story, Variant } from "histoire";
const { story, variant } = defineProps<{ story: Story; variant?: Variant }>();
defineSlots<{ default?: () => unknown }>();
const framed = computed(
  () =>
    !(story.meta && "wrapper" in story.meta && story.meta.wrapper === false) &&
    !(
      variant?.meta &&
      "wrapper" in variant.meta &&
      variant.meta.wrapper === false
    ),
);
</script>
<template>
  <div :class="{ 'story-preview': framed }"><slot /></div>
</template>
