<script setup lang="ts">
import Button, { type ButtonVariant } from "./Button.vue";

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
  <Button
    :type="type"
    :variant="variant"
    size="icon"
    class="ui-icon-button"
    :data-shape="shape"
    :aria-label="label"
  >
    <span class="ui-icon-button-content" aria-hidden="true"><slot /></span>
  </Button>
</template>
