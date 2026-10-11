<script setup lang="ts">
import { ref } from "vue";
import BaseButton from "../../src/button/BaseButton.vue";
import BaseConfirmSheet from "../../src/confirm/BaseConfirmSheet.vue";

const {
  intent = "destructive",
  busy = false,
  error = "",
  confirmDisabled = false,
} = defineProps<{
  intent?: "destructive" | "neutral";
  busy?: boolean;
  error?: string;
  confirmDisabled?: boolean;
}>();
// The consumer owns the work: confirming only counts, it never closes.
const open = ref(false);
const confirms = ref(0);
const cancels = ref(0);
</script>

<template>
  <main>
    <BaseButton type="button" @click="open = true">Delete data</BaseButton>
    <BaseConfirmSheet
      v-model:open="open"
      :intent="intent"
      :busy="busy"
      :error="error"
      :confirm-disabled="confirmDisabled"
      title="Delete all data?"
      description="History, drafts and templates are removed from this device."
      confirm-label="Delete everything"
      cancel-label="Keep data"
      @confirm="confirms += 1"
      @cancel="cancels += 1"
    >
      <p>Backups you already downloaded stay on your device.</p>
    </BaseConfirmSheet>
    <output data-testid="confirms">{{ confirms }}</output>
    <output data-testid="cancels">{{ cancels }}</output>
  </main>
</template>

<style scoped>
main {
  background: var(--ui-background);
  color: var(--ui-foreground);
}
</style>
