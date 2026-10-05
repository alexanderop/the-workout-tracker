<script setup lang="ts">
defineSlots<{ default?: () => unknown }>();
</script>
<template>
  <div class="ui-field-group" data-slot="field-group"><slot /></div>
</template>
