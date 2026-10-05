<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from "vue";
import { BaseSheet, BaseButtonIcon } from "@form/ui";
import { CalendarDays, ChevronLeft, ChevronRight } from "@lucide/vue";
import { sessionTotals, type CompletedSession } from "../domain";
import { sessionMinutes } from "./presentation";
import {
  eligibleSessionCount,
  indexCompletedSessions,
  localDay,
  monthDays,
  monthStart,
  rollingDays,
} from "./workoutCalendar";

const { sessions, now } = defineProps<{
  sessions: readonly CompletedSession[];
  now: number;
}>();
const emit = defineEmits<{ detail: [id: string] }>();
const today = computed(() => localDay(now));
const sorted = computed(() =>
  [...sessions].sort((a, b) => a.finishedAt - b.finishedAt),
);
const eligibleCount = computed(() => eligibleSessionCount(sorted.value, now));
const index = computed(() =>
  indexCompletedSessions(sorted.value.slice(0, eligibleCount.value)),
);
const days = computed(() => rollingDays(today.value));
const count = computed(() =>
  days.value.reduce((sum, day) => sum + (index.value.get(day)?.length ?? 0), 0),
);
const selected = ref(today.value);
const month = ref(monthStart(today.value));
const open = ref(false);
const calendarHeading = useTemplateRef<HTMLElement>("calendarHeading");
const monthGrid = useTemplateRef<HTMLElement>("monthGrid");
const pendingDetail = ref<string | null>(null);
let opener: HTMLElement | null = null;
const cells = computed(() => monthDays(month.value));
const selectedSessions = computed(() => index.value.get(selected.value) ?? []);
const dateLabel = (day: number) =>
  new Date(day).toLocaleDateString("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
const shortLabel = (day: number) =>
  new Date(day).toLocaleDateString("en", { day: "numeric", month: "short" });
const monthLabel = computed(() =>
  new Date(month.value).toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  }),
);
const rangeLabel = computed(
  () =>
    `${shortLabel(days.value[0] ?? today.value)} – ${shortLabel(today.value)}`,
);
function label(day: number) {
  const amount = index.value.get(day)?.length ?? 0;
  return `${dateLabel(day)}, ${amount} completed ${amount === 1 ? "workout" : "workouts"}`;
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
  <section class="training-rhythm" aria-label="Training rhythm">
    <header ref="calendarHeading" class="rhythm-heading">
      <div>
        <p class="rhythm-kicker">PAST 14 DAYS</p>
        <h2>
          {{ count }} <span>{{ count === 1 ? "workout" : "workouts" }}</span>
        </h2>
      </div>
      <BaseButtonIcon
        class="calendar-action"
        label="Open training calendar"
        @click="showMonth"
        ><CalendarDays :size="21"
      /></BaseButtonIcon>
    </header>
    <div class="calendar-scroll">
      <div class="rhythm-days" role="group" aria-label="Past 14 days">
        <button
          v-for="day in days"
          :key="day"
          type="button"
          :aria-label="label(day)"
          :aria-current="day === today ? 'date' : undefined"
          :class="{ today: day === today, completed: index.has(day) }"
          @click="openDay(day)"
        >
          <span>{{ new Date(day).getDate() }}</span
          ><i aria-hidden="true" />
        </button>
      </div>
    </div>
    <footer class="rhythm-caption">
      <span>{{ rangeLabel }}</span
      ><span><i aria-hidden="true" />Completed workout</span>
    </footer>
  </section>
  <BaseSheet
    :open="open"
    title="Training calendar"
    @close="close"
    @close-auto-focus="afterClose"
  >
    <div class="calendar-month-heading">
      <BaseButtonIcon
        class="calendar-action"
        label="Previous month"
        @click="previousMonth"
        ><ChevronLeft :size="20"
      /></BaseButtonIcon>
      <h3>{{ monthLabel }}</h3>
      <BaseButtonIcon
        class="calendar-action"
        label="Next month"
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
          v-for="(weekday, position) in ['M', 'T', 'W', 'T', 'F', 'S', 'S']"
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
        {{ dateLabel(selected) }} · {{ selectedSessions.length }}
        {{ selectedSessions.length === 1 ? "workout" : "workouts" }}
      </p>
      <p v-if="!selectedSessions.length" class="calendar-empty">
        No completed workouts.
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
          ><small
            >{{ sessionMinutes(session) }} min ·
            {{ sessionTotals(session).completedSets }} sets</small
          ></span
        ><ChevronRight :size="18" />
      </button>
    </div>
  </BaseSheet>
</template>

<style scoped>
.training-rhythm {
  padding: 8px 0 25px;
  border-bottom: 1px solid var(--surface);
}
.rhythm-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.rhythm-kicker {
  margin: 0;
  font-size: 10px;
  letter-spacing: 1.7px;
  color: var(--muted);
}
.rhythm-heading h2 {
  margin: 9px 0 18px;
  font-size: 44px;
  line-height: 1;
  font-weight: 500;
  letter-spacing: -2px;
}
.rhythm-heading h2 span {
  color: var(--muted);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0;
  margin-left: 5px;
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
  background: var(--surface);
  border-radius: 50%;
}
.completed i {
  background: var(--purple);
}
button.today {
  border-color: var(--purple);
  color: var(--text);
}
button[aria-pressed="true"] {
  background: var(--surface);
  color: var(--text);
}
.rhythm-caption {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 13px;
  font-size: 10px;
  color: var(--muted);
}
.rhythm-caption > span {
  display: flex;
  align-items: center;
  gap: 5px;
}
.rhythm-caption i {
  width: 6px;
  height: 6px;
  background: var(--purple);
  border-radius: 50%;
}
.calendar-month-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
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
  padding-bottom: 9px;
}
.calendar-day-detail {
  border-top: 1px solid var(--surface);
  margin-top: 20px;
  padding-top: 16px;
}
.calendar-day-detail > p {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
}
.calendar-empty {
  margin-top: 18px;
}
.calendar-session {
  width: 100%;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  text-align: left;
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
  margin-top: 5px;
  color: var(--muted);
  font-size: 12px;
}
button:focus-visible {
  outline: 2px solid var(--purple);
  outline-offset: -2px;
}
</style>
