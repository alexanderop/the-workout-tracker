<script setup lang="ts">
import { BaseActions, BaseButton, BaseEmptyState } from "@form/ui";
import { ShieldCheck } from "@lucide/vue";
import { nextTick, onErrorCaptured, ref, useTemplateRef } from "vue";
import { useTranslation } from "../i18n";

defineSlots<{ default(): unknown }>();

const { t } = useTranslation();

const failed = ref(false);
const heading =
  useTemplateRef<InstanceType<typeof BaseEmptyState>>("recovery-heading");
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
  <div v-if="failed" class="error-boundary" role="alert">
    <BaseEmptyState
      ref="recovery-heading"
      :title="t('shell.errorBoundary.title')"
      :body="t('shell.errorBoundary.body')"
      :heading-level="1"
    >
      <template #icon><ShieldCheck :size="32" /></template>
      <template #action>
        <BaseActions>
          <BaseButton variant="secondary" @click="copyDiagnostics">{{
            t("shell.errorBoundary.copy")
          }}</BaseButton>
          <BaseButton @click="reload">{{
            t("shell.errorBoundary.reload")
          }}</BaseButton>
        </BaseActions>
      </template>
    </BaseEmptyState>
    <p class="error-boundary-status" role="status">
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

<style scoped>
.error-boundary {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-6) var(--page-gutter-phone);
}
.error-boundary-status {
  margin: 0;
  text-align: center;
}
.error-boundary pre {
  overflow-x: auto;
}
</style>
