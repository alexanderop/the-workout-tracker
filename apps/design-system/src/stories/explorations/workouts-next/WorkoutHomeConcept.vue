<script setup lang="ts">
import { ref } from "vue";
import { ArrowRight, Dumbbell, Library, TrendingUp, Settings, Plus, ArrowUpRight, X, CircleAlert } from "@lucide/vue";
import CalendarConcept from './CalendarConcept.vue';
import { BaseButton } from "@form/ui";

defineProps<{
  direction: 'focus' | 'journal' | 'compact';
  populated: boolean;
  showError: boolean;
  framed?: boolean;
  calendar?: 'week' | 'month' | 'rhythm';
}>();
const section = ref<'history' | 'templates'>('history');
const feedback = ref('');
const history = [
  { day: '03', month: 'OCT', name: 'Upper body', detail: '6 exercises · 18 sets', duration: '48 min' },
  { day: '01', month: 'OCT', name: 'Lower body', detail: '5 exercises · 15 sets', duration: '42 min' },
  { day: '28', month: 'SEP', name: 'Full body', detail: '7 exercises · 21 sets', duration: '56 min' },
];
function previewAction(label: string) {
  feedback.value = `${label} selected. This layout study does not open or save a workout.`;
}
function continueWorkout() { previewAction('Continue workout'); }
function startWorkout() { previewAction('Start workout'); }
function clearFeedback() { feedback.value = ''; }
function selectHistory() { section.value = 'history'; }
function selectTemplates() { section.value = 'templates'; }
</script>

<template>
  <div class="next-home" :class="[`next-home--${direction}`, { 'is-framed': framed }]">
    <header class="home-heading">
      <div><span v-if="direction === 'journal'" class="eyebrow">THE WORKOUT TRACKER</span><h1>Workouts<span v-if="direction === 'journal'" class="title-dot">.</span></h1></div>
      <span class="date-label">MON, OCT 5</span>
    </header>
    <main class="home-main">
      <aside v-if="showError" class="recovery"><CircleAlert :size="17" aria-hidden="true" /><span>Couldn’t open that workout.</span><button type="button" @click="previewAction('Retry')">Retry</button></aside>
      <CalendarConcept v-if="calendar" :mode="calendar" :populated="populated" />
      <section class="session" aria-label="Current workout">
        <div class="session-label"><span class="status-dot" />IN PROGRESS<span v-if="direction === 'compact'" class="session-date">Today</span></div>
        <div class="session-content">
          <div><h2>{{ populated ? 'Upper body' : 'New workout' }}</h2><p>{{ populated ? '4 exercises · 3 of 12 sets logged' : 'No sets logged yet' }}</p></div>
          <div v-if="direction === 'focus'" class="session-symbol" aria-hidden="true"><Dumbbell :size="34" :stroke-width="1.25" /></div>
        </div>
        <div v-if="populated" class="set-progress" aria-label="3 of 12 sets logged"><span v-for="set in 12" :key="set" :class="{ logged: set <= 3 }" /></div>
        <BaseButton v-if="direction !== 'journal'" class="continue-button" @click="continueWorkout">Continue workout<ArrowRight :size="18" aria-hidden="true" /></BaseButton>
        <button v-else class="editorial-continue" type="button" @click="continueWorkout">Continue workout<span><ArrowUpRight :size="24" aria-hidden="true" /></span></button>
      </section>
      <section class="journal-section" aria-label="Workout library">
        <div class="section-switch" role="group" aria-label="Show workouts">
          <button type="button" :aria-pressed="section === 'history'" @click="selectHistory">History<span v-if="populated">{{ calendar ? 4 : 3 }}</span></button>
          <button type="button" :aria-pressed="section === 'templates'" @click="selectTemplates">Templates<span v-if="populated">2</span></button>
        </div>
        <template v-if="populated">
          <div v-if="section === 'history'" class="history-list">
            <button v-if="calendar" type="button" class="history-row" @click="previewAction('Morning mobility')"><span class="calendar-date"><strong>05</strong><small>OCT</small></span><span class="workout-info"><strong>Morning mobility</strong><small>4 sets</small></span><span class="duration">18 min</span><ArrowUpRight :size="16" aria-hidden="true" /></button>
            <button v-for="workout in history" :key="workout.name" type="button" class="history-row" @click="previewAction(workout.name)">
              <span class="calendar-date"><strong>{{ workout.day }}</strong><small>{{ workout.month }}</small></span>
              <span class="workout-info"><strong>{{ workout.name }}</strong><small>{{ workout.detail }}</small></span>
              <span class="duration">{{ workout.duration }}</span><ArrowUpRight :size="16" aria-hidden="true" />
            </button>
          </div>
          <div v-else class="history-list">
            <button v-for="name in ['Upper / Lower A', 'Full body']" :key="name" class="history-row" type="button" @click="previewAction(name)"><Library :size="22" aria-hidden="true" /><span class="workout-info"><strong>{{ name }}</strong><small>Workout template</small></span><ArrowRight :size="18" aria-hidden="true" /></button>
          </div>
        </template>
        <div v-else class="empty-library"><span class="empty-mark" aria-hidden="true"><Library :size="23" :stroke-width="1.25" /></span><h3>{{ section === 'history' ? 'Your first workout starts here' : 'Your routines, ready to repeat' }}</h3><p>{{ section === 'history' ? 'Finished workouts will appear here.' : 'Save a finished workout as a template.' }}</p></div>
      </section>
      <button v-if="populated" type="button" class="secondary-start" @click="startWorkout"><Plus :size="16" aria-hidden="true" />Start a different workout</button>
      <div v-if="feedback" class="demo-feedback" role="status"><span>{{ feedback }}</span><button type="button" aria-label="Dismiss preview feedback" @click="clearFeedback"><X :size="18" /></button></div>
    </main>
    <nav class="home-nav" aria-label="Main navigation">
      <button type="button" aria-current="page" @click="clearFeedback"><Dumbbell :size="22" :stroke-width="1.6" /><span>Workouts</span></button>
      <button type="button" @click="previewAction('Exercises')"><Library :size="22" :stroke-width="1.6" /><span>Exercises</span></button>
      <button type="button" @click="previewAction('Progress')"><TrendingUp :size="22" :stroke-width="1.6" /><span>Progress</span></button>
      <button type="button" @click="previewAction('Settings')"><Settings :size="22" :stroke-width="1.6" /><span>Settings</span></button>
    </nav>
  </div>
</template>

<style scoped>
.next-home { min-height: calc(100dvh - 70px); display: flex; flex-direction: column; background: var(--background); color: var(--text); font-family: Inter, sans-serif; text-align: left; }
.next-home.is-framed { min-height: 740px; }
.next-home * { box-sizing: border-box; }
.next-home button { cursor: pointer; }
.next-home button:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 4px; }
.home-heading { padding: 34px 24px 30px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
h1, h2, h3, p { margin: 0; }
h1 { font-size: 27px; font-weight: 600; letter-spacing: -1.1px; line-height: 1.2; }
.date-label { color: var(--muted); font-size: 10px; letter-spacing: .8px; white-space: nowrap; }
.home-main { padding: 0 24px 28px; flex: 1; }
.session { padding: 22px; border-radius: 20px; background: var(--surface); }
.session-label { display: flex; align-items: center; gap: 7px; color: var(--muted); font-size: 10px; font-weight: 600; letter-spacing: 1.3px; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
.session-content { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 25px 0 24px; }
h2 { font-size: 25px; font-weight: 550; letter-spacing: -.8px; }
.session p { margin-top: 9px; font-size: 12px; color: var(--muted); line-height: 1.5; }
.session-symbol { color: var(--muted); transform: rotate(-15deg); }
.continue-button { width: 100%; justify-content: space-between; min-height: 46px; border-radius: 10px; font-size: 13px; }
.set-progress { display: flex; gap: 4px; margin: 0 0 24px; }
.set-progress span { height: 3px; flex: 1; border-radius: 3px; background: var(--background); }
.set-progress .logged { background: var(--accent); }
.journal-section { margin-top: 32px; }
.section-switch { display: flex; align-items: center; gap: 23px; border-bottom: 1px solid var(--border); }
.section-switch button { display: flex; align-items: center; gap: 7px; min-height: 44px; padding: 0 0 13px; border: 0; border-bottom: 2px solid transparent; background: none; font-size: 13px; font-weight: 500; color: var(--muted); }
.section-switch button[aria-pressed="true"] { color: var(--text); border-bottom-color: var(--text); }
.section-switch span { font-size: 10px; color: var(--muted); }
.empty-library { padding: 38px 8px; text-align: center; }
.empty-mark { display: inline-flex; margin-bottom: 16px; color: var(--muted); }
h3 { font-size: 13px; font-weight: 500; }
.empty-library p { margin-top: 8px; font-size: 12px; color: var(--muted); line-height: 1.5; }
.history-row { width: 100%; display: flex; align-items: center; gap: 13px; text-align: left; color: var(--text); background: none; border: 0; border-bottom: 1px solid var(--border); min-height: 83px; padding: 14px 0; }
.history-row:hover { background: var(--surface); }
.calendar-date { display: grid; gap: 4px; text-align: center; min-width: 28px; }
.calendar-date strong { font-size: 20px; font-weight: 500; letter-spacing: -.8px; }
.calendar-date small { font-size: 8px; letter-spacing: 1px; color: var(--muted); }
.workout-info { display: grid; gap: 6px; flex: 1; }
.workout-info strong { font-size: 13px; font-weight: 500; }
.workout-info small, .duration { color: var(--muted); font-size: 10px; }
.history-row > svg { color: var(--muted); }
.secondary-start { min-height: 44px; display: flex; align-items: center; gap: 8px; margin-top: 20px; border: 0; background: none; color: var(--muted); font-size: 12px; }
.home-nav { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--border); padding: 11px 12px 17px; gap: 4px; }
.home-nav button { display: grid; justify-items: center; align-content: center; gap: 7px; min-height: 48px; padding: 4px; border: 0; background: none; color: var(--muted); font-size: 10px; }
.home-nav button[aria-current] { color: var(--accent); }
.recovery, .demo-feedback { display: flex; align-items: center; gap: 8px; padding: 12px 0; margin-bottom: 16px; font-size: 11px; line-height: 1.5; color: var(--muted); }
.recovery > span, .demo-feedback > span { flex: 1; }
.recovery button, .demo-feedback button { min-height: 44px; min-width: 44px; border: 0; background: none; color: var(--text); }
.demo-feedback { margin: 14px 0 0; border-top: 1px solid var(--border); }
.eyebrow { display: block; margin-bottom: 17px; font-size: 9px; letter-spacing: 1.8px; color: var(--muted); }
.title-dot { color: var(--accent); }
.next-home--journal .home-heading { align-items: end; padding-top: 35px; padding-bottom: 39px; }
.next-home--journal h1 { font-size: 42px; letter-spacing: -2px; }
.next-home--journal .date-label { padding-bottom: 5px; font-size: 9px; }
.next-home--journal .session { padding: 0; background: none; border-radius: 0; }
.next-home--journal .session-content { margin: 20px 0 0; }
.next-home--journal h2 { font-size: 31px; letter-spacing: -1.2px; }
.next-home--journal .set-progress { margin-top: 24px; }
.next-home--journal .set-progress span { background: var(--surface); }
.next-home--journal .set-progress .logged { background: var(--accent); }
.editorial-continue { margin-top: 18px; padding: 0 0 22px; width: 100%; display: flex; align-items: center; justify-content: space-between; color: var(--text); font-size: 13px; background: none; border: 0; border-bottom: 1px solid var(--border); }
.editorial-continue > span { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; color: var(--background); background: var(--accent); }
.next-home--journal .section-switch { border-bottom: 0; }
.next-home--journal .section-switch button[aria-pressed="true"] { border-bottom-color: transparent; }
.next-home--journal .empty-library { text-align: left; padding-left: 0; }
.next-home--journal .empty-mark { display: none; }
.next-home--compact .home-heading { padding-bottom: 22px; }
.next-home--compact h1 { font-size: 23px; }
.next-home--compact .session { border: 1px solid var(--border); background: none; padding: 18px; border-radius: 12px; }
.session-date { margin-left: auto; font-size: 10px; letter-spacing: 0; font-weight: 400; }
.next-home--compact .session-content { margin: 16px 0 18px; }
.next-home--compact h2 { font-size: 21px; }
.next-home--compact .set-progress span { background: var(--surface); }
.next-home--compact .set-progress .logged { background: var(--accent); }
.next-home--compact .continue-button { min-height: 44px; }
.next-home--compact .section-switch { border: 0; gap: 4px; padding: 4px; background: var(--surface); border-radius: 10px; }
.next-home--compact .section-switch button { flex: 1; justify-content: center; padding: 0; min-height: 38px; border: 0; border-radius: 7px; }
.next-home--compact .section-switch button[aria-pressed="true"] { background: var(--background); }
.next-home--compact .history-row { min-height: 74px; }
.next-home--compact .calendar-date { display: none; }
.next-home--compact .home-nav button[aria-current] { border-radius: 10px; background: var(--surface); }
@media (min-width: 700px) { .next-home:not(.is-framed) .home-heading, .next-home:not(.is-framed) .home-main { width: 100%; max-width: 760px; margin-inline: auto; } .next-home:not(.is-framed) { min-height: 100vh; } .next-home:not(.is-framed) .home-heading { padding-top: 48px; } .next-home:not(.is-framed) .home-nav { padding-inline: max(24px, calc((100% - 700px) / 2)); } }
@media (max-width: 350px) { .home-heading { padding-inline: 18px; } .home-main { padding-inline: 18px; } .session { padding: 18px; } .session-symbol { display: none; } .duration { display: none; } .next-home--journal h1 { font-size: 35px; } }
</style>
