<script setup lang="ts">
defineSlots<{ default?: () => unknown }>();
</script>
<template>
  <div class="ui-field-content" data-slot="field-content"><slot /></div>
</template>
