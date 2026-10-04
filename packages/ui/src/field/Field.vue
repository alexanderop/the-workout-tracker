<script setup lang="ts">
defineProps<{ orientation?: "vertical" | "horizontal" | "responsive" }>();
</script>
<template>
  <div
    role="group"
    class="ui-field"
    data-slot="field"
    :data-orientation="orientation"
  >
    <slot />
  </div>
</template>
