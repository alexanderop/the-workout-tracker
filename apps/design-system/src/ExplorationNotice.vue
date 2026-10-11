<template>
  <aside class="exploration-notice" aria-label="Design status">
    <strong>Design exploration</strong>
    <span
      >Proposal or reference study. Open Pages to review the implemented
      product.</span
    >
  </aside>
</template>

<style scoped>
.exploration-notice {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-4);
  padding: var(--space-3) var(--space-5);
  border-block-end: 1px solid var(--ui-border);
  color: var(--ui-muted-foreground);
  background: var(--ui-background);
  font-size: var(--text-sm);
  line-height: 1.5;
}
.exploration-notice strong {
  color: var(--ui-primary);
}
</style>
