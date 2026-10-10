<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronLeft, ChevronRight, CalendarDays } from '@lucide/vue';
import { BaseSheet } from '@form/ui';
const { mode, populated } = defineProps<{ mode: 'week' | 'month' | 'rhythm'; populated: boolean }>();
const open = ref(false);
const month = ref(new Date(2026, 9, 1));
const selected = ref('2026-10-05');
const today = '2026-10-05';
const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const sessions = [
  { date: '2026-10-05', name: 'Morning mobility', detail: '18 min · 4 sets' },
  { date: '2026-10-03', name: 'Upper body', detail: '48 min · 18 sets' },
  { date: '2026-10-01', name: 'Lower body', detail: '42 min · 15 sets' },
  { date: '2026-09-28', name: 'Full body', detail: '56 min · 21 sets' },
];
function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function day(date: Date) { const key = dateKey(date); return { key, number: date.getDate(), label: date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), logged: populated && sessions.some(session => session.date === key), today: key === today }; }
const week = computed(() => Array.from({ length: 7 }, (_, i) => day(new Date(2026, 9, 5 + i))));
const rhythm = computed(() => Array.from({ length: 14 }, (_, i) => day(new Date(2026, 8, 22 + i))));
const monthTitle = computed(() => month.value.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }));
const cells = computed(() => {
  const start = (month.value.getDay() + 6) % 7;
  const count = new Date(month.value.getFullYear(), month.value.getMonth() + 1, 0).getDate();
  return Array.from({ length: Math.ceil((start + count) / 7) * 7 }, (_, i) => i < start || i >= start + count ? null : day(new Date(month.value.getFullYear(), month.value.getMonth(), i - start + 1)));
});
const selectedSession = computed(() => populated ? sessions.find(session => session.date === selected.value) : undefined);
const selectedLabel = computed(() => new Date(`${selected.value}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }));
function showMonth() { open.value = true; }
function closeMonth() { open.value = false; }
function previousMonth() { month.value = new Date(month.value.getFullYear(), month.value.getMonth() - 1, 1); selected.value = dateKey(month.value); }
function nextMonth() { month.value = new Date(month.value.getFullYear(), month.value.getMonth() + 1, 1); selected.value = dateKey(month.value); }
function selectDay(key: string) { selected.value = key; }
function openDay(key: string) { selected.value = key; month.value = new Date(`${key.slice(0, 7)}-01T12:00:00`); open.value = true; }
</script>

<template>
  <section class="calendar-study" :class="`calendar-study--${mode}`" aria-label="Training calendar">
    <template v-if="mode === 'week'">
      <button type="button" class="week-opener" aria-label="Open training calendar" @click="showMonth">
        <span class="calendar-heading"><strong>This week</strong><span>{{ populated ? '1 workout · 18 min' : 'No workouts yet' }}<ChevronRight :size="15" /></span></span>
        <span class="week-strip"><span v-for="(date, index) in week" :key="date.key" class="week-day"><small>{{ weekdays[index] }}</small><span class="day-number" :class="{ today: date.today }">{{ date.number }}</span><i :class="{ logged: date.logged }" /></span></span>
      </button>
    </template>
    <template v-else-if="mode === 'rhythm'">
      <div class="rhythm-heading"><div><span class="calendar-kicker">PAST 14 DAYS</span><h2>{{ populated ? '4' : '0' }}<small>workouts</small></h2></div><button type="button" aria-label="Open monthly calendar" @click="showMonth"><CalendarDays :size="19" /></button></div>
      <div class="rhythm-scroll"><div class="rhythm-rail"><button v-for="date in rhythm" :key="date.key" type="button" :aria-label="`${date.label}${date.logged ? ', workout completed' : ', no completed workout'}`" :aria-current="date.today ? 'date' : undefined" :class="{ completed: date.logged, today: date.today }" @click="openDay(date.key)"><span>{{ date.number }}</span><i /></button></div></div>
      <div class="rhythm-caption"><span>22 Sep — 5 Oct</span><span><i />Completed workout</span></div>
    </template>
    <template v-else>
      <div class="calendar-heading month-heading"><h2>{{ monthTitle }}</h2><div><button type="button" aria-label="Previous month" @click="previousMonth"><ChevronLeft :size="17" /></button><button type="button" aria-label="Next month" @click="nextMonth"><ChevronRight :size="17" /></button></div></div>
      <div class="month-scroll"><div class="month-grid"><span v-for="(label, index) in weekdays" :key="`label-${index}`" class="weekday">{{ label }}</span><template v-for="(date, index) in cells" :key="date?.key ?? `blank-${index}`"><button v-if="date" type="button" :aria-label="`${date.label}${date.logged ? ', workout completed' : ', no completed workout'}`" :aria-current="date.today ? 'date' : undefined" :aria-pressed="selected === date.key" :class="{ selected: selected === date.key, today: date.today }" @click="selectDay(date.key)">{{ date.number }}<i :class="{ logged: date.logged }" /></button><span v-else /></template></div></div>
      <div class="date-detail" role="status"><span>{{ selectedLabel }}</span><strong>{{ selectedSession?.name ?? 'No completed workouts' }}</strong><small v-if="selectedSession">{{ selectedSession.detail }}</small></div>
    </template>
    <BaseSheet :open="open" title="Training calendar" description="Illustrative completed workouts. Select a date to explore." @close="closeMonth">
      <div class="calendar-modal"><div class="calendar-heading month-heading"><h2>{{ monthTitle }}</h2><div><button type="button" aria-label="Previous month" @click="previousMonth"><ChevronLeft :size="18" /></button><button type="button" aria-label="Next month" @click="nextMonth"><ChevronRight :size="18" /></button></div></div>
        <div class="month-scroll"><div class="month-grid"><span v-for="(label, index) in weekdays" :key="`label-${index}`" class="weekday">{{ label }}</span><template v-for="(date, index) in cells" :key="date?.key ?? `blank-${index}`"><button v-if="date" type="button" :aria-label="`${date.label}${date.logged ? ', workout completed' : ', no completed workout'}`" :aria-current="date.today ? 'date' : undefined" :aria-pressed="selected === date.key" :class="{ selected: selected === date.key, today: date.today }" @click="selectDay(date.key)">{{ date.number }}<i :class="{ logged: date.logged }" /></button><span v-else /></template></div></div>
        <div class="date-detail" role="status"><span>{{ selectedLabel }}</span><strong>{{ selectedSession?.name ?? 'No completed workouts' }}</strong><small v-if="selectedSession">{{ selectedSession.detail }}</small></div>
      </div>
    </BaseSheet>
  </section>
</template>

<style scoped>
.calendar-study { margin-bottom: 26px; color: var(--text); }
button { cursor: pointer; font: inherit; color: inherit; }
button:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }
.week-opener { display: block; width: 100%; padding: 0 0 23px; border: 0; border-bottom: 1px solid var(--border); background: none; text-align: left; }
.calendar-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.calendar-heading strong { font-size: 13px; font-weight: 500; }
.calendar-heading > span { display: flex; align-items: center; gap: 5px; color: var(--muted); font-size: 10px; }
.week-strip { display: grid; grid-template-columns: repeat(7, 1fr); margin-top: 17px; }
.week-day { display: flex; flex-direction: column; align-items: center; gap: 7px; }
.week-day small { color: var(--muted); font-size: 10px; }
.day-number { display: grid; place-items: center; width: 32px; height: 32px; font-size: 13px; border-radius: 50%; }
.day-number.today { background: var(--accent); color: var(--background); }
i { display: block; width: 4px; height: 4px; border-radius: 50%; background: none; }
i.logged { background: var(--accent); }
.month-heading h2 { margin: 0; font-size: 14px; letter-spacing: -.2px; font-weight: 500; }
.month-heading > div { display: flex; }
.month-heading button, .rhythm-heading button { display: grid; place-items: center; min-width: 44px; min-height: 44px; background: none; border: 0; }
.month-scroll { overflow-x: auto; }
.month-grid { display: grid; grid-template-columns: repeat(7, minmax(44px, 1fr)); min-width: 308px; }
.weekday { text-align: center; font-size: 10px; padding: 10px 0; color: var(--muted); }
.month-grid button { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; height: 44px; border: 1px solid transparent; background: none; font-size: 12px; border-radius: 10px; }
.month-grid button.today { border-color: var(--accent); }
.month-grid button.selected { background: var(--surface); }
.month-grid button:hover { background: var(--surface); }
.date-detail { display: grid; gap: 6px; margin-top: 15px; padding: 14px 0; border-top: 1px solid var(--border); }
.date-detail > span { color: var(--muted); font-size: 10px; }
.date-detail strong { font-size: 13px; font-weight: 500; }
.date-detail small { color: var(--muted); font-size: 11px; }
.calendar-kicker { font-size: 9px; letter-spacing: 1.3px; color: var(--muted); }
.rhythm-heading { display: flex; align-items: center; justify-content: space-between; }
.rhythm-heading h2 { margin: 9px 0 18px; font-size: 40px; line-height: 1; letter-spacing: -2px; font-weight: 500; }
.rhythm-heading h2 small { color: var(--muted); font-size: 13px; font-weight: 400; letter-spacing: 0; margin-left: 9px; }
.rhythm-scroll { overflow-x: auto; }
.rhythm-rail { display: grid; grid-template-columns: repeat(7, minmax(44px, 1fr)); min-width: 308px; gap: 3px 0; }
.rhythm-rail button { position: relative; height: 44px; border: 1px solid transparent; border-radius: 8px; background: none; display: flex; flex-direction: column; align-items: center; gap: 7px; justify-content: center; }
.rhythm-rail button span { font-size: 10px; color: var(--muted); }
.rhythm-rail button i { width: 10px; height: 10px; background: var(--surface); }
.rhythm-rail button.completed i { background: var(--accent); }
.rhythm-rail button.today { border-color: var(--accent); }
.rhythm-caption { display: flex; justify-content: space-between; gap: 8px; margin-top: 12px; font-size: 9px; color: var(--muted); }
.rhythm-caption > span { display: flex; align-items: center; gap: 5px; }
.rhythm-caption i { background: var(--accent); }
.calendar-modal { color: var(--text); }
.calendar-study--rhythm { padding-bottom: 23px; border-bottom: 1px solid var(--border); }
</style>
