<script setup lang="ts">
defineSlots<{ default?: () => unknown }>();
// Adapted from shadcn-vue; native arrow and a single root preserve form layout.
const model = defineModel<string | number>();
</script>

<template>
  <select v-model="model" class="ui-native-select" data-slot="native-select">
    <slot />
  </select>
</template>
