<script setup lang="ts">
import { ref } from "vue";
import { BaseButton } from "@form/ui";
import { useTranslation } from "../../../i18n";
import type { DetachedDraft } from "./useDetachedDrafts";
const { entries, dismiss } = defineProps<{
  entries: readonly DetachedDraft[];
  dismiss: () => boolean;
}>();
const { t } = useTranslation();
const issue = ref("");
function dismissAll() {
  issue.value = dismiss()
    ? ""
    : t("training.detached.cannotClear");
}
</script>
<template>
  <aside
    v-if="entries.length"
    class="detached-input-notice"
    :aria-label="t('training.detached.label')"
  >
    <p role="status">{{ t("training.detached.intro") }}</p>
    <ul>
      <li v-for="entry in entries" :key="entry.key">
        {{
          t("training.detached.entry", {
            exercise: entry.exerciseName,
            set: entry.index + 1,
            weight: entry.weight,
            reps: entry.reps,
          })
        }}
      </li>
    </ul>
    <p class="muted">{{ t("training.detached.hint") }}</p>
    <p v-if="issue" class="field-error" role="alert">{{ issue }}</p>
    <BaseButton size="sm" variant="secondary" @click="dismissAll"
      >{{ t("training.detached.dismiss") }}</BaseButton
    >
  </aside>
</template>
<style scoped>
.detached-input-notice {
  position: fixed;
  z-index: 40;
  inset-block-start: calc(1rem + env(safe-area-inset-top, 0px));
  inset-inline-start: 1rem;
  inset-inline-end: 1rem;
  margin-inline: auto;
  max-width: 30rem;
  padding: 1rem;
  border: 1px solid var(--muted);
  border-radius: 1rem;
  background: var(--surface);
  box-shadow: 0 4px 24px var(--ui-shadow-dialog);
}
.detached-input-notice p,
.detached-input-notice ul {
  margin: 0 0 0.5rem;
}
.detached-input-notice ul {
  padding-inline-start: 1.25rem;
}
</style>
