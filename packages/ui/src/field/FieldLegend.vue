<script setup lang="ts">
defineProps<{ variant?: "legend" | "label" }>();
</script>
<template>
  <legend
    class="ui-field-legend"
    data-slot="field-legend"
    :data-variant="variant"
  >
    <slot />
  </legend>
</template>
