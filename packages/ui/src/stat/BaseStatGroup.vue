<script setup lang="ts">
// Lays BaseStat children out in one row between two hairlines. Many stats or a
// narrow screen wrap onto further rows. Name the group with `aria-label` when
// the surrounding text does not.
defineSlots<{ default?: () => unknown }>();
</script>

<template>
  <div class="ui-stat-group" data-slot="stat-group" role="group">
    <slot />
  </div>
</template>

<style scoped>
.ui-stat-group {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(calc(var(--space-8) * 1.75), 1fr)
  );
  gap: var(--space-5) var(--space-3);
  padding-block: var(--space-5);
  border-block: 1px solid var(--border);
}
</style>
