<script setup lang="ts">
defineSlots<{ default?: () => unknown }>();
</script>
<template>
  <div class="ui-dialog-header" data-slot="dialog-header"><slot /></div>
</template>
