<script setup lang="ts">
import { BaseButton } from "@form/ui";
import { ShieldCheck } from "@lucide/vue";
import { nextTick, onErrorCaptured, ref, useTemplateRef } from "vue";

defineSlots<{ default(): unknown }>();

const failed = ref(false);
const heading = useTemplateRef<HTMLElement>("recovery-heading");
const copyStatus = ref<"copied" | "unavailable" | null>(null);
// Diagnostics are fixed text. They never include the exception, its stack or
// anything from the training journal.
const diagnostics = JSON.stringify(
  {
    app: "The Workout Tracker",
    version: APP_VERSION,
    failure: "Unexpected interface error",
  },
  null,
  2,
);

onErrorCaptured(() => {
  failed.value = true;
  void nextTick(() => heading.value?.focus());
  // Stop here: the boundary replaces the broken interface, so the error is not
  // reported to an outer handler that would only log it again.
  return false;
});
function reload() {
  window.location.reload();
}
async function copyDiagnostics() {
  try {
    await navigator.clipboard.writeText(diagnostics);
    copyStatus.value = "copied";
  } catch {
    copyStatus.value = "unavailable";
  }
}
</script>

<template>
  <div v-if="failed" class="empty-state" role="alert">
    <ShieldCheck :size="32" aria-hidden="true" />
    <h1 ref="recovery-heading" tabindex="-1">Something went wrong</h1>
    <p>
      Your saved workouts remain on this device. Reload to try again. Anything
      you had not saved yet may be lost.
    </p>
    <BaseButton unstyled class="btn primary" @click="reload"
      >Reload app</BaseButton
    >
    <BaseButton unstyled class="btn secondary" @click="copyDiagnostics"
      >Copy diagnostics</BaseButton
    >
    <p role="status">
      <template v-if="copyStatus === 'copied'"
        >Diagnostics copied. No workouts or personal data are
        included.</template
      >
      <template v-else-if="copyStatus === 'unavailable'"
        >Copy is unavailable. Select the diagnostics below instead.</template
      >
    </p>
    <details>
      <summary>Diagnostics</summary>
      <pre>{{ diagnostics }}</pre>
    </details>
  </div>
  <slot v-else />
</template>
