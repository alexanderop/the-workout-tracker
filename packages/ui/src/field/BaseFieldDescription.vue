<script setup lang="ts">
defineSlots<{ default?: () => unknown }>();
</script>
<template>
  <p class="ui-field-description" data-slot="field-description"><slot /></p>
</template>
