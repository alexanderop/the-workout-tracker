<script setup lang="ts">
import { computed } from "vue";
import { BaseListRow } from "@form/ui";
import type { CompletedSession } from "../domain";
import { useFormat, useTranslation } from "../../../i18n";
import { sessionMetaLine } from "./presentation";

// One completed workout as a list row: name, then the date and the inline
// summary "24 min · 3 sets · 800 kg", and with `exercises` the exercise names.
// The row opens the workout's review; the caller listens for the click.
const {
  session,
  withDate = false,
  exercises = false,
} = defineProps<{
  session: CompletedSession;
  withDate?: boolean;
  exercises?: boolean;
}>();
const { t } = useTranslation();
const format = useFormat();
const meta = computed(() => {
  const line = sessionMetaLine(session, t, format.value);
  return withDate
    ? t("workouts.history.rowMeta", {
        date: format.value.shortDate(session.finishedAt),
        meta: line,
      })
    : line;
});
</script>

<template>
  <BaseListRow as="button" chevron :label="session.name">
    <template #subtitle>
      <span>{{ meta }}</span>
      <span v-if="exercises" class="session-row-exercises">{{
        session.exercises.map((exercise) => exercise.name).join(" · ")
      }}</span>
    </template>
  </BaseListRow>
</template>

<style scoped>
.session-row-exercises {
  display: -webkit-box;
  overflow: hidden;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
</style>
