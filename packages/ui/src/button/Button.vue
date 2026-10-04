<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
export type ButtonVariant =
  "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
export type ButtonSize =
  "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
const { as = "button" } = defineProps<
  PrimitiveProps & { variant?: ButtonVariant; size?: ButtonSize }
>();
defineSlots<{ default?: () => unknown }>();
</script>
<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    class="ui-button"
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    ><slot
  /></Primitive>
</template>
