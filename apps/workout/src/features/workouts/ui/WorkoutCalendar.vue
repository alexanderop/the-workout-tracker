<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from "vue";
import {
  BaseButtonIcon,
  BaseDayCell,
  BaseEmptyState,
  BaseListGroup,
  BaseSheet,
} from "@form/ui";
import { ChevronLeft, ChevronRight } from "@lucide/vue";
import type { CompletedSession } from "../domain";
import { useFormat, useTranslation } from "../../../i18n";
import SessionRow from "./SessionRow.vue";
import {
  eligibleSessionCount,
  indexCompletedSessions,
  localDay,
  monthDays,
  monthStart,
  rollingDays,
  weekdayStarts,
} from "./workoutCalendar";

// The calendar button lives in the page header, so the page opens the sheet
// through `open()` and names the button that focus returns to.
const {
  sessions,
  now,
  action = () => null,
} = defineProps<{
  sessions: readonly CompletedSession[];
  now: number;
  action?: () => HTMLElement | null | undefined;
}>();
const emit = defineEmits<{ detail: [id: string] }>();
const { t } = useTranslation();
const format = useFormat();
const today = computed(() => localDay(now));
const sorted = computed(() =>
  [...sessions].sort((a, b) => a.finishedAt - b.finishedAt),
);
const eligibleCount = computed(() => eligibleSessionCount(sorted.value, now));
const index = computed(() =>
  indexCompletedSessions(sorted.value.slice(0, eligibleCount.value)),
);
const days = computed(() => rollingDays(today.value));
const selected = ref(today.value);
const month = ref(monthStart(today.value));
const open = ref(false);
const monthGrid = useTemplateRef<HTMLElement>("monthGrid");
const pendingDetail = ref<string | null>(null);
let opener: HTMLElement | null = null;
const cells = computed(() => monthDays(month.value));
const selectedSessions = computed(() => index.value.get(selected.value) ?? []);
const weekdayInitials = computed(() =>
  weekdayStarts().map((at) => format.value.weekdayNarrow(at)),
);
const monthLabel = computed(() => format.value.monthYear(month.value));
function label(day: number) {
  return t("workouts.calendar.dayLabel", {
    date: format.value.fullDate(day),
    count: t(
      "workouts.calendar.completedCount",
      index.value.get(day)?.length ?? 0,
    ),
  });
}
// A day button's name starts with its visible text (weekday and day number).
function rhythmLabel(day: number) {
  return t("workouts.calendar.rhythmDayLabel", {
    weekday: format.value.weekdayShort(day),
    day: new Date(day).getDate(),
    label: label(day),
  });
}
async function openDay(day: number) {
  opener =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  selected.value = day;
  month.value = monthStart(day);
  open.value = true;
  await nextTick();
  monthGrid.value
    ?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
    ?.focus();
}
function showMonth() {
  void openDay(today.value);
}
function close() {
  open.value = false;
}
defineExpose({ open: showMonth });
function previousMonth() {
  month.value = monthStart(month.value, -1);
  selected.value = month.value;
}
function nextMonth() {
  month.value = monthStart(month.value, 1);
  selected.value = month.value;
}
function showDetail(id: string) {
  pendingDetail.value = id;
  open.value = false;
}
function afterClose(event: Event) {
  if (!pendingDetail.value) {
    if (!opener?.isConnected) {
      event.preventDefault();
      action()?.focus();
    }
    return;
  }
  event.preventDefault();
  action()?.focus();
  const id = pendingDetail.value;
  pendingDetail.value = null;
  emit("detail", id);
}
</script>

<template>
  <section class="training-rhythm" :aria-label="t('workouts.calendar.rhythm')">
    <div class="calendar-scroll">
      <div
        class="rhythm-days"
        role="group"
        :aria-label="t('workouts.calendar.pastDays')"
      >
        <BaseDayCell
          v-for="day in days"
          :key="day"
          :weekday="format.weekdayShort(day)"
          :day="new Date(day).getDate()"
          :today="day === today"
          :marked="index.has(day)"
          :aria-label="rhythmLabel(day)"
          @click="openDay(day)"
        />
      </div>
    </div>
  </section>
  <BaseSheet
    :open="open"
    :title="t('workouts.calendar.sheetTitle')"
    @close="close"
    @close-auto-focus="afterClose"
  >
    <div class="calendar-month-heading">
      <BaseButtonIcon
        class="calendar-action"
        :label="t('workouts.calendar.previousMonth')"
        @click="previousMonth"
        ><ChevronLeft :size="20"
      /></BaseButtonIcon>
      <h3>{{ monthLabel }}</h3>
      <BaseButtonIcon
        class="calendar-action"
        :label="t('workouts.calendar.nextMonth')"
        :disabled="month >= monthStart(today)"
        @click="nextMonth"
        ><ChevronRight :size="20"
      /></BaseButtonIcon>
    </div>
    <div class="calendar-scroll">
      <div
        ref="monthGrid"
        class="month-days"
        role="group"
        :aria-label="monthLabel"
      >
        <span
          v-for="(weekday, position) in weekdayInitials"
          :key="position"
          class="weekday"
          aria-hidden="true"
          >{{ weekday }}</span
        >
        <template
          v-for="(day, position) in cells"
          :key="day ?? `empty-${position}`"
          ><BaseDayCell
            v-if="day !== null"
            :day="new Date(day).getDate()"
            :today="day === today"
            :marked="index.has(day)"
            :selected="day === selected"
            :disabled="day > today"
            :aria-label="label(day)"
            @click="selected = day" /><span v-else
        /></template>
      </div>
    </div>
    <div class="calendar-day-detail">
      <p role="status">
        {{
          t("workouts.calendar.selectedDay", {
            date: format.fullDate(selected),
            count: t("workouts.calendar.workoutCount", selectedSessions.length),
          })
        }}
      </p>
      <BaseEmptyState
        v-if="!selectedSessions.length"
        size="compact"
        :heading-level="3"
        :title="t('workouts.calendar.noWorkouts')"
      />
      <BaseListGroup v-if="selectedSessions.length">
        <SessionRow
          v-for="session in selectedSessions"
          :key="session.id"
          :session="session"
          @click="showDetail(session.id)"
        />
      </BaseListGroup>
    </div>
  </BaseSheet>
</template>

<style scoped>
.training-rhythm {
  padding: 0 0 var(--space-4);
  border-block-end: 1px solid var(--border);
}
.calendar-action {
  display: grid;
  place-items: center;
  min-width: 44px;
  min-height: 44px;
  background: none;
  border: 0;
  color: var(--muted);
  border-radius: var(--radius-md);
}
.calendar-action:disabled {
  opacity: 0.35;
  cursor: default;
}
.calendar-scroll {
  overflow-x: auto;
}
.rhythm-days,
.month-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(44px, 1fr));
  min-width: 308px;
  gap: var(--space-1) 0;
}
.calendar-month-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-block-end: var(--space-3);
}
.calendar-month-heading h3 {
  margin: 0;
  font-size: var(--text-base);
  font-weight: 500;
}
.weekday {
  text-align: center;
  font-size: var(--text-xs);
  color: var(--muted);
  padding-block-end: var(--space-2);
}
.calendar-day-detail {
  border-block-start: 1px solid var(--border);
  margin-block-start: var(--space-5);
  padding-block-start: var(--space-4);
}
.calendar-day-detail > p {
  color: var(--muted);
  font-size: var(--text-sm);
  line-height: 1.5;
}
</style>
