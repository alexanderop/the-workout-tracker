<script setup lang="ts">
import { BaseSheet, BaseButton } from "@form/ui";
import { Check, Repeat2, BookmarkPlus } from "@lucide/vue";
import { sessionTotals, type CompletedSession } from "../domain";
import { fmt, longDate, sessionMinutes } from "./presentation";

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
</script>

<template>
  <BaseSheet
    :open="open"
    :title="detail?.name ?? 'Workout'"
    :description="detail ? longDate(detail.finishedAt) : ''"
    wide
    @close="emit('close')"
    ><template v-if="detail"
      ><div class="finish-stats">
        <div>
          <strong>{{ sessionTotals(detail).completedSets }}</strong
          ><span>sets logged</span>
        </div>
        <div>
          <strong>{{ fmt(sessionTotals(detail).volumeKg) }}</strong
          ><span>kg volume</span>
        </div>
        <div>
          <strong>{{ sessionMinutes(detail) }}</strong
          ><span>minutes</span>
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
          <span class="muted">Set {{ index + 1 }}</span
          ><span>{{ fmt(set.weightKg) }} kg × {{ set.reps }} reps</span
          ><span class="detail-status"
            ><Check v-if="set.completed" :size="15" />{{
              set.completed ? "Logged" : "Not logged"
            }}</span
          >
        </div>
      </section>
      <div class="detail-actions">
        <BaseButton
          variant="secondary"
          :disabled="saving"
          @click="emit('edit', detail)"
          >Edit workout</BaseButton
        >
        <BaseButton
          unstyled
          class="btn primary"
          :disabled="saving || active"
          @click="emit('repeat', detail.id)"
        >
          <Repeat2 :size="17" />Repeat workout</BaseButton
        ><BaseButton
          unstyled
          class="btn secondary"
          @click="emit('convert', detail.id)"
        >
          <BookmarkPlus :size="17" />Save as template
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
