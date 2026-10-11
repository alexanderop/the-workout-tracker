<script setup lang="ts">
import { ref } from "vue";
import { BaseButton, BaseNotice } from "@form/ui";
import { useTranslation } from "../../../i18n";
import type { DetachedDraft } from "./useDetachedDrafts";
const { entries, dismiss } = defineProps<{
  entries: readonly DetachedDraft[];
  dismiss: () => boolean;
}>();
const { t } = useTranslation();
const issue = ref("");
function dismissAll() {
  issue.value = dismiss() ? "" : t("training.detached.cannotClear");
}
</script>
<template>
  <aside
    v-if="entries.length"
    class="detached-input-notice"
    :aria-label="t('training.detached.label')"
  >
    <BaseNotice>
      <p>{{ t("training.detached.intro") }}</p>
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
      <BaseNotice v-if="issue" tone="danger">{{ issue }}</BaseNotice>
      <template #action>
        <BaseButton size="sm" variant="secondary" @click="dismissAll">{{
          t("training.detached.dismiss")
        }}</BaseButton>
      </template>
    </BaseNotice>
  </aside>
</template>
<style scoped>
/* Positions the notice; BaseNotice draws the surface. */
.detached-input-notice {
  position: fixed;
  z-index: 40;
  inset-block-start: calc(var(--space-4) + env(safe-area-inset-top, 0px));
  inset-inline: var(--space-4);
  margin-inline: auto;
  max-width: calc(var(--space-8) * 10);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 24px var(--ui-shadow-dialog);
}
.detached-input-notice p,
.detached-input-notice ul {
  margin: 0 0 var(--space-2);
}
.detached-input-notice ul {
  padding-inline-start: var(--space-5);
}
</style>
