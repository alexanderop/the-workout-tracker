<script setup lang="ts">
defineSlots<{ default?: () => unknown }>();
</script>
<template>
  <div class="ui-field-label" data-slot="field-label"><slot /></div>
</template>
