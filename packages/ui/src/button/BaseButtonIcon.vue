<script setup lang="ts">
import BaseButton, { type ButtonVariant } from "./BaseButton.vue";

const {
  label,
  variant = "ghost",
  shape = "square",
  type = "button",
} = defineProps<{
  label: string;
  variant?: ButtonVariant;
  shape?: "square" | "circle";
  type?: "button" | "submit" | "reset";
}>();
defineSlots<{ default: () => unknown }>();
</script>

<template>
  <BaseButton
    :type="type"
    :variant="variant"
    size="icon"
    class="ui-icon-button"
    :data-shape="shape"
    :aria-label="label"
  >
    <span class="ui-icon-button-content" aria-hidden="true"><slot /></span>
  </BaseButton>
</template>
