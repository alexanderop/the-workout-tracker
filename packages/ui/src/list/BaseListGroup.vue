<script setup lang="ts">
defineProps<{ label?: string }>();
defineSlots<{ default?: () => unknown }>();
</script>

<template>
  <div class="ui-list-group">
    <h2 v-if="label" class="ui-list-group-label">{{ label }}</h2>
    <div class="ui-list-group-card"><slot /></div>
  </div>
</template>

<style scoped>
.ui-list-group {
  display: grid;
  gap: 10px;
}
.ui-list-group-label {
  margin: 0;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}
.ui-list-group-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: 0 1px 2px var(--ui-shadow-soft);
}
</style>
