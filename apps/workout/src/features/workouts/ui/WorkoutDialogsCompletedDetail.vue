<script setup lang="ts">
import { BaseSheet, BaseButton } from "@form/ui";
import { Check, Repeat2, BookmarkPlus } from "@lucide/vue";
import { sessionTotals, type CompletedSession } from "../domain";
import { sessionMinutes } from "./presentation";
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
      ><div class="finish-stats">
        <div>
          <strong>{{ sessionTotals(detail).completedSets }}</strong
          ><span>{{ t("dialogs.stats.setsLogged") }}</span>
        </div>
        <div>
          <strong>{{ format.number(sessionTotals(detail).volumeKg) }}</strong
          ><span>{{ t("dialogs.stats.kgVolume") }}</span>
        </div>
        <div>
          <strong>{{ sessionMinutes(detail) }}</strong
          ><span>{{ t("dialogs.stats.minutes") }}</span>
        </div>
      </div>
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
      <div class="detail-actions">
        <BaseButton
          variant="secondary"
          :disabled="saving"
          @click="emit('edit', detail)"
          >{{ t("dialogs.completedDetail.edit") }}</BaseButton
        >
        <BaseButton
          unstyled
          class="btn primary"
          :disabled="saving || active"
          @click="emit('repeat', detail.id)"
        >
          <Repeat2 :size="17" />{{ t("dialogs.completedDetail.repeat") }}</BaseButton
        ><BaseButton
          unstyled
          class="btn secondary"
          @click="emit('convert', detail.id)"
        >
          <BookmarkPlus :size="17" />{{ t("dialogs.completedDetail.saveAsTemplate") }}
        </BaseButton>
      </div>
    </template></BaseSheet
  >
</template>

<style scoped>
.exercise-history-note {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  margin-block: 12px;
}
</style>
