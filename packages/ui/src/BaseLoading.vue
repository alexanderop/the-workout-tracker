<script setup lang="ts">
import { Dumbbell } from "@lucide/vue";
const { label = "Opening your training journal" } = defineProps<{
  label?: string;
}>();
</script>
<template>
  <div class="ui-loading" role="status">
    <span class="ui-loading-mark"
      ><Dumbbell :size="24" aria-hidden="true"
    /></span>
    <p>{{ label }}</p>
  </div>
</template>
<style scoped>
.ui-loading {
  display: grid;
  justify-items: center;
  gap: 16px;
  padding: 48px 20px;
  color: var(--text);
  text-align: center;
}
.ui-loading-mark {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--surface);
  color: var(--purple);
}
.ui-loading p {
  margin: 0;
  font-size: 16px;
}
</style>
