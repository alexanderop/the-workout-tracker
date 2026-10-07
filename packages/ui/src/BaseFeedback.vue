<script setup lang="ts">
import { ref, watch } from "vue";
const { active } = defineProps<{ active: boolean }>();
defineSlots<{ default?: () => unknown }>();
const animate = ref(false);
watch(
  () => active,
  (value, previous) => {
    animate.value = value && !previous;
  },
);
</script>

<template>
  <span
    class="ui-feedback"
    :class="{ 'ui-feedback-new': animate }"
    @animationend="animate = false"
  >
    <slot />
  </span>
</template>

<style scoped>
.ui-feedback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
@media (prefers-reduced-motion: no-preference) {
  .ui-feedback-new {
    animation: confirmed var(--ui-motion-feedback) var(--ui-motion-ease);
  }
}
@keyframes confirmed {
  0% {
    scale: 0.85;
  }
  55% {
    scale: 1.16;
  }
  100% {
    scale: 1;
  }
}
</style>
