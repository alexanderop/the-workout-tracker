<script setup lang="ts">
defineSlots<{ default?: () => unknown }>();
</script>
<template>
  <fieldset class="ui-field-set" data-slot="field-set"><slot /></fieldset>
</template>
