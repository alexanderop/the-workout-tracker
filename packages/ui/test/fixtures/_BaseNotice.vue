<script setup lang="ts">
import { ref } from "vue";
import BaseButton from "../../src/button/BaseButton.vue";
import BaseNotice from "../../src/notice/BaseNotice.vue";

const shown = ref(true);
const dismissals = ref(0);
function dismiss() {
  dismissals.value += 1;
  shown.value = false;
}
</script>

<template>
  <main>
    <BaseNotice tone="info">New version available.</BaseNotice>
    <BaseNotice tone="success">Workout saved.</BaseNotice>
    <BaseNotice tone="danger">Could not save the workout.</BaseNotice>
    <BaseNotice
      v-if="shown"
      dismiss-label="Dismiss update notice"
      @dismiss="dismiss"
    >
      Update ready.
      <template #action
        ><BaseButton type="button" variant="link" size="sm"
          >Reload</BaseButton
        ></template
      >
    </BaseNotice>
    <output data-testid="dismissals">{{ dismissals }}</output>
  </main>
</template>

<style scoped>
main {
  display: grid;
  gap: var(--space-3);
  background: var(--ui-background);
  color: var(--ui-foreground);
}
</style>
