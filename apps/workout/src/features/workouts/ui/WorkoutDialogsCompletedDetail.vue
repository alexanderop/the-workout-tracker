<script setup lang="ts">
import { BaseActions, BaseButton, BaseSheet } from "@form/ui";
import { Check, Repeat2, BookmarkPlus } from "@lucide/vue";
import { sessionTotals, type CompletedSession } from "../domain";
import { sessionDurationMs } from "./presentation";
import SessionStats from "./SessionStats.vue";
import { useFormat, useTranslation } from "../../../i18n";

const { detail, open, saving, active } = defineProps<{
  detail: CompletedSession | undefined;
  open: boolean;
  saving: boolean;
  active: boolean;
}>();
const emit = defineEmits<{
  close: [];
  edit: [session: CompletedSession];
  repeat: [id: string];
  convert: [id: string];
}>();
const { t } = useTranslation();
const format = useFormat();
</script>

<template>
  <BaseSheet
    :open="open"
    :title="detail?.name ?? t('dialogs.completedDetail.fallbackTitle')"
    :description="detail ? format.longDate(detail.finishedAt) : ''"
    wide
    @close="emit('close')"
    ><template v-if="detail"
      ><SessionStats
        :totals="sessionTotals(detail)"
        :duration-ms="sessionDurationMs(detail)"
      />
      <section
        v-for="exercise in detail.exercises"
        :key="exercise.id"
        class="detail-exercise"
      >
        <h3>{{ exercise.name }}</h3>
        <p v-if="exercise.note" class="exercise-history-note muted small">
          {{ exercise.note }}
        </p>
        <div
          v-for="(set, index) in exercise.sets"
          :key="set.id"
          class="detail-set"
        >
          <span class="muted">{{
            t("dialogs.fields.setNumber", { number: index + 1 })
          }}</span
          ><span>{{
            t("dialogs.completedDetail.setLine", {
              weight: format.number(set.weightKg),
              reps: set.reps,
            })
          }}</span
          ><span class="detail-status"
            ><Check v-if="set.completed" :size="15" />{{
              set.completed
                ? t("dialogs.completedDetail.logged")
                : t("dialogs.completedDetail.notLogged")
            }}</span
          >
        </div>
      </section>
      <BaseActions>
        <BaseButton
          variant="secondary"
          :disabled="saving"
          @click="emit('edit', detail)"
          >{{ t("dialogs.completedDetail.edit") }}</BaseButton
        >
        <BaseButton variant="secondary" @click="emit('convert', detail.id)">
          <BookmarkPlus :size="17" />{{
            t("dialogs.completedDetail.saveAsTemplate")
          }}
        </BaseButton>
        <BaseButton
          :disabled="saving || active"
          @click="emit('repeat', detail.id)"
        >
          <Repeat2 :size="17" />{{ t("dialogs.completedDetail.repeat") }}
        </BaseButton>
      </BaseActions>
    </template></BaseSheet
  >
</template>

<style scoped>
.exercise-history-note {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  margin-block: var(--space-3);
}
</style>
