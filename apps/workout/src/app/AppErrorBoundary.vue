<script setup lang="ts">
import { BaseButton } from "@form/ui";
import { ShieldCheck } from "@lucide/vue";
import { nextTick, onErrorCaptured, ref, useTemplateRef } from "vue";
import { useTranslation } from "../i18n";

defineSlots<{ default(): unknown }>();

const { t } = useTranslation();

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
    <h1 ref="recovery-heading" tabindex="-1">
      {{ t("shell.errorBoundary.title") }}
    </h1>
    <p>{{ t("shell.errorBoundary.body") }}</p>
    <BaseButton unstyled class="btn primary" @click="reload">{{
      t("shell.errorBoundary.reload")
    }}</BaseButton>
    <BaseButton unstyled class="btn secondary" @click="copyDiagnostics">{{
      t("shell.errorBoundary.copy")
    }}</BaseButton>
    <p role="status">
      <template v-if="copyStatus === 'copied'">{{
        t("shell.errorBoundary.copied")
      }}</template>
      <template v-else-if="copyStatus === 'unavailable'">{{
        t("shell.errorBoundary.copyUnavailable")
      }}</template>
    </p>
    <details>
      <summary>{{ t("shell.errorBoundary.diagnostics") }}</summary>
      <pre>{{ diagnostics }}</pre>
    </details>
  </div>
  <slot v-else />
</template>
