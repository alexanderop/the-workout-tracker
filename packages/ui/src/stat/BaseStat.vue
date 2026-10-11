<script setup lang="ts">
// One figure: the value with its small unit after it, and the label underneath.
// Format the value (number, duration) before passing it in.
defineProps<{
  value: string | number;
  label: string;
  unit?: string;
}>();
</script>

<template>
  <div class="ui-stat" data-slot="stat">
    <span class="ui-stat-value"
      >{{ value }}<span v-if="unit" class="ui-stat-unit">{{ unit }}</span></span
    >
    <span class="ui-stat-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.ui-stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}
.ui-stat-value {
  color: var(--text);
  font-size: var(--text-xl);
  font-variant-numeric: tabular-nums;
  font-weight: 450;
  letter-spacing: -0.6px;
  line-height: 1.15;
}
.ui-stat-unit {
  margin-inline-start: var(--space-1);
  color: var(--muted);
  font-size: var(--text-sm);
  font-weight: 400;
  letter-spacing: 0;
}
.ui-stat-label {
  color: var(--muted);
  font-size: var(--text-xs);
  line-height: 1.3;
  overflow-wrap: anywhere;
}
</style>
