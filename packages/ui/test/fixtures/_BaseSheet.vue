<script setup lang="ts">
import { ref } from "vue";
import BaseSheet from "../../src/BaseSheet.vue";
import BaseButton from "../../src/button/BaseButton.vue";
import BaseInput from "../../src/input/BaseInput.vue";
import BaseActions from "../../src/actions/BaseActions.vue";

// `long` fills the sheet past its height and pins Done in a sticky footer.
defineProps<{ long?: boolean }>();

// The consumer owns the open state: the sheet asks to close through `close`.
const open = ref(false);
const closeRequests = ref(0);
function close() {
  closeRequests.value += 1;
  open.value = false;
}
</script>

<template>
  <main>
    <BaseButton type="button" @click="open = true"
      >Template settings</BaseButton
    >
    <BaseSheet
      :open="open"
      title="Template settings"
      description="Changes apply to your next session."
      @close="close"
    >
      <BaseInput aria-label="Template name" model-value="Push day" />
      <template v-if="long">
        <BaseInput
          v-for="n in 12"
          :key="n"
          class="field"
          :aria-label="`Exercise ${n}`"
        />
        <BaseActions sticky>
          <BaseButton type="button" @click="close">Done</BaseButton>
        </BaseActions>
      </template>
      <BaseButton v-else type="button" @click="close">Done</BaseButton>
    </BaseSheet>
    <output data-testid="close-requests">{{ closeRequests }}</output>
  </main>
</template>

<style scoped>
/* Consumers own the page surface; use the themed one, as the app does. */
main {
  background: var(--ui-background);
  color: var(--ui-foreground);
}
.field {
  margin-block-start: var(--space-4);
}
</style>
