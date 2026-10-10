<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from "vue";
import { BaseSheet, BaseButtonIcon } from "@form/ui";
import { CalendarDays, ChevronLeft, ChevronRight } from "@lucide/vue";
import { sessionTotals, type CompletedSession } from "../domain";
import { useFormat, useTranslation } from "../../../i18n";
import { sessionMinutes } from "./presentation";
import {
  eligibleSessionCount,
  indexCompletedSessions,
  localDay,
  monthDays,
  monthStart,
  rollingDays,
  weekdayStarts,
} from "./workoutCalendar";

const { sessions, now } = defineProps<{
  sessions: readonly CompletedSession[];
  now: number;
}>();
const emit = defineEmits<{ detail: [id: string] }>();
defineSlots<{ default?: () => unknown }>();
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
const calendarHeading = useTemplateRef<HTMLElement>("calendarHeading");
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
      calendarHeading.value
        ?.querySelector<HTMLButtonElement>("button")
        ?.focus();
    }
    return;
  }
  event.preventDefault();
  calendarHeading.value?.querySelector<HTMLButtonElement>("button")?.focus();
  const id = pendingDetail.value;
  pendingDetail.value = null;
  emit("detail", id);
}
</script>

<template>
  <section class="training-rhythm" :aria-label="t('workouts.calendar.rhythm')">
    <header ref="calendarHeading" class="rhythm-heading">
      <slot
        ><h2>{{ t("workouts.calendar.rhythm") }}</h2></slot
      >
      <BaseButtonIcon
        class="calendar-action"
        :label="t('workouts.calendar.open')"
        @click="showMonth"
        ><CalendarDays :size="21"
      /></BaseButtonIcon>
    </header>
    <div class="calendar-scroll">
      <div
        class="rhythm-days"
        role="group"
        :aria-label="t('workouts.calendar.pastDays')"
      >
        <button
          v-for="day in days"
          :key="day"
          type="button"
          :aria-label="rhythmLabel(day)"
          :aria-current="day === today ? 'date' : undefined"
          :class="{ today: day === today, completed: index.has(day) }"
          @click="openDay(day)"
        >
          <small>{{ `${format.weekdayShort(day)} ` }}</small
          ><span>{{ new Date(day).getDate() }}</span
          ><i aria-hidden="true" />
        </button>
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
          ><button
            v-if="day !== null"
            type="button"
            :disabled="day > today"
            :aria-label="label(day)"
            :aria-current="day === today ? 'date' : undefined"
            :aria-pressed="day === selected"
            :class="{ today: day === today, completed: index.has(day) }"
            @click="selected = day"
          >
            <span>{{ new Date(day).getDate() }}</span
            ><i aria-hidden="true" /></button
          ><span v-else
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
      <p v-if="!selectedSessions.length" class="calendar-empty">
        {{ t("workouts.calendar.noWorkouts") }}
      </p>
      <button
        v-for="session in selectedSessions"
        :key="session.id"
        type="button"
        class="calendar-session"
        @click="showDetail(session.id)"
      >
        <span
          ><strong>{{ session.name }}</strong
          ><small>{{
            t("workouts.calendar.sessionSummary", {
              minutes: sessionMinutes(session),
              sets: t(
                "workouts.calendar.sessionSets",
                sessionTotals(session).completedSets,
              ),
            })
          }}</small></span
        ><ChevronRight :size="18" />
      </button>
    </div>
  </BaseSheet>
</template>

<style scoped>
.training-rhythm {
  padding: 0 0 16px;
  border-block-end: 1px solid var(--border);
}
.rhythm-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.rhythm-heading {
  margin-block-end: 16px;
}
.rhythm-heading h2 {
  font-size: 20px;
}
.rhythm-days button {
  min-height: 64px;
}
.rhythm-days small {
  font-size: 10px;
}
.calendar-action {
  display: grid;
  place-items: center;
  min-width: 44px;
  min-height: 44px;
  background: none;
  border: 0;
  color: var(--muted);
  border-radius: 8px;
}
.calendar-action:disabled,
.month-days button:disabled {
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
  gap: 3px 0;
}
.rhythm-days button,
.month-days button {
  min-height: 44px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: none;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
}
.rhythm-days i,
.month-days i {
  width: 9px;
  height: 9px;
  background: var(--border);
  border-radius: 50%;
}
.completed i {
  background: var(--accent);
}
button.today {
  border-color: var(--accent);
  color: var(--text);
}
button[aria-pressed="true"] {
  background: var(--surface);
  color: var(--text);
}
.calendar-month-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-block-end: 12px;
}
.calendar-month-heading h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}
.weekday {
  text-align: center;
  font-size: 11px;
  color: var(--muted);
  padding-block-end: 9px;
}
.calendar-day-detail {
  border-block-start: 1px solid var(--border);
  margin-block-start: 20px;
  padding-block-start: 16px;
}
.calendar-day-detail > p {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
}
.calendar-empty {
  margin-block-start: 18px;
}
.calendar-session {
  width: 100%;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  text-align: start;
  border: 0;
  background: none;
  color: var(--text);
}
.calendar-session span {
  min-width: 0;
}
.calendar-session strong {
  display: block;
  font-size: 14px;
  font-weight: 500;
  overflow-wrap: anywhere;
}
.calendar-session small {
  display: block;
  margin-block-start: 5px;
  color: var(--muted);
  font-size: 12px;
}
button:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: -2px;
}
</style>
