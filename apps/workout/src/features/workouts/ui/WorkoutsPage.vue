<script setup lang="ts">
import { BaseButton, BaseInput } from "@form/ui";
import { computed, ref } from "vue";
import {
  Plus,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  ChevronRight,
  Search,
} from "@lucide/vue";
import {
  sessionTotals,
  type Snapshot,
  type Routine,
  type CompletedSession,
} from "../domain";
import { fmt, sessionMinutes, shortDate } from "./presentation";
import WorkoutCalendar from "./WorkoutCalendar.vue";
const {
  routines,
  history: allHistory,
  active,
  saving,
  now,
} = defineProps<{
  routines: Routine[];
  history: CompletedSession[];
  active: Snapshot["active"];
  saving: boolean;
  now: number;
}>();
const emit = defineEmits<{
  start: [id: string | null];
  navigate: [page: "session"];
  detail: [id: string];
}>();
const tab = defineModel<"home" | "history" | "templates">("view", {
  default: "home",
});
const search = ref("");
const latest = computed(() => allHistory[0]);
const isFreshJournal = computed(
  () => !active && !routines.length && !allHistory.length,
);
const history = computed(() =>
  allHistory.filter((session) =>
    session.name.toLowerCase().includes(search.value.toLowerCase()),
  ),
);
</script>
<template>
  <div class="workouts-dashboard">
    <template v-if="tab !== 'history'">
      <WorkoutCalendar
        :sessions="allHistory"
        :now="now"
        @detail="emit('detail', $event)"
      >
        <h1>Workouts</h1>
      </WorkoutCalendar>
      <section v-if="active" class="active-workout-card">
        <span class="active-label"><i aria-hidden="true" />IN PROGRESS</span>
        <h2>{{ active.name }}</h2>
        <p>
          {{ active.exercises.length }} exercises ·
          {{ sessionTotals(active).completedSets }}
          {{ sessionTotals(active).completedSets === 1 ? "set" : "sets" }} logged
        </p>
        <BaseButton
          unstyled
          class="btn primary"
          @click="emit('navigate', 'session')"
          >Continue workout<ArrowRight :size="18"
        /></BaseButton>
      </section>
      <section v-else class="home-start">
        <p v-if="isFreshJournal" class="muted">
          Choose an exercise and log your first set.
        </p>
        <BaseButton
          unstyled
          class="btn primary dashboard-start"
          :disabled="saving"
          @click="emit('start', null)"
          ><Plus :size="18" />{{
            isFreshJournal ? "Start your first workout" : "Start workout"
          }}</BaseButton
        >
      </section>
      <section class="latest-workout" aria-label="Latest workout">
        <div class="latest-heading">
          <h2>Latest workout</h2>
          <BaseButton unstyled class="text-button" @click="tab = 'history'"
            >View history<ChevronRight :size="16"
          /></BaseButton>
        </div>
        <article v-if="latest" class="workout-history-card">
          <BaseButton
            unstyled
            class="history-card-title"
            @click="emit('detail', latest.id)"
            ><span
              ><small class="muted">{{ shortDate(latest.finishedAt) }}</small
              ><strong>{{ latest.name }}</strong></span
            ><ChevronRight :size="18"
          /></BaseButton>
          <div class="history-metrics">
            <span>{{ sessionMinutes(latest) }} <small>min</small></span
            ><span
              >{{ sessionTotals(latest).completedSets }}
              <small>sets</small></span
            ><span
              >{{ fmt(sessionTotals(latest).volumeKg) }} <small>kg</small></span
            >
          </div>
        </article>
        <p v-else class="muted home-empty">
          Your completed workouts will appear here.
        </p>
      </section>
      <BaseButton
        unstyled
        id="workout-templates"
        class="btn secondary templates-link"
        @click="tab = 'templates'"
        ><Bookmark :size="18" />Templates <span>{{ routines.length }}</span
        ><ChevronRight :size="16"
      /></BaseButton>
    </template>
    <template v-if="tab === 'history'">
      <BaseButton
        unstyled
        class="text-button history-back"
        @click="tab = 'home'"
        ><ArrowLeft :size="18" />Back to workouts</BaseButton
      >
      <header class="dashboard-heading"><h1>History</h1></header>
      <div v-if="allHistory.length" class="search-field history-search">
        <Search :size="17" /><BaseInput
          v-model="search"
          aria-label="Search workout history"
          placeholder="Find a past workout"
        />
      </div>
      <div v-if="!allHistory.length" class="overview-empty">
        <p class="muted">
          Your completed workouts will appear here, ready to repeat.
        </p>
      </div>
      <div v-else class="workout-history-grid">
        <article
          v-for="session in history"
          :key="session.id"
          class="workout-history-card"
        >
          <BaseButton
            unstyled
            class="history-card-title"
            @click="emit('detail', session.id)"
          >
            <span
              ><small class="muted">{{ shortDate(session.finishedAt) }}</small
              ><strong>{{ session.name }}</strong></span
            ><ChevronRight :size="18" />
          </BaseButton>
          <p class="muted small">
            {{ session.exercises.map((exercise) => exercise.name).join(" · ") }}
          </p>
          <div class="history-metrics">
            <span>{{ sessionMinutes(session) }} <small>min</small></span
            ><span
              >{{ sessionTotals(session).completedSets }}
              <small>sets</small></span
            ><span
              >{{ fmt(sessionTotals(session).volumeKg) }}
              <small>kg</small></span
            >
          </div>
        </article>
        <p v-if="!history.length" class="muted">
          No workouts match your search.
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.workouts-dashboard {
  max-width: 760px;
  margin-inline: auto;
  min-width: 0;
}
h1 {
  margin: 0;
  font-size: 27px;
  font-weight: 550;
  letter-spacing: -1px;
}
.dashboard-heading {
  margin: 16px 0 24px;
}
.active-workout-card {
  margin: 20px 0;
  padding: 16px;
  border: 1px solid var(--surface);
  border-radius: 12px;
}
.active-label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 1.5px;
}
.active-label i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--purple);
}
.active-workout-card h2 {
  margin: 10px 0 6px;
  font-size: 20px;
  font-weight: 500;
  overflow-wrap: anywhere;
}
.active-workout-card p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
}
.active-workout-card .btn {
  width: 100%;
  margin-block-start: 14px;
  min-height: 44px;
  justify-content: space-between;
}
.home-start {
  margin: 20px 0;
}
.home-start p {
  margin: 0 0 14px;
  font-size: 14px;
  line-height: 1.5;
}
.dashboard-start {
  width: 100%;
  min-height: 48px;
}
.latest-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.latest-heading h2 {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}
.latest-heading .text-button,
.history-back {
  min-height: 44px;
}
.latest-heading .text-button {
  font-size: 12px;
}
.home-empty {
  margin: 8px 0 20px;
  font-size: 13px;
  line-height: 1.5;
}
.templates-link {
  margin-block-start: 18px;
  width: 100%;
  min-height: 48px;
  justify-content: flex-start;
}
.templates-link span {
  color: var(--muted);
  margin-inline-start: auto;
}
.history-search {
  margin-block-end: 8px;
}
.workout-history-grid {
  display: block;
}
.workout-history-card {
  padding: 12px 0;
  border: 0;
  border-block-end: 1px solid var(--surface);
  border-radius: 0;
  background: none;
}
.history-card-title {
  min-height: 44px;
  width: 100%;
}
.history-card-title > span {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.history-card-title strong {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  overflow-wrap: anywhere;
}
.history-card-title small {
  font-size: 11px;
}
.workout-history-card > p {
  min-height: 0;
  margin: 8px 0;
  font-size: 12px;
  overflow-wrap: anywhere;
}
.history-metrics {
  margin: 10px 0 0;
  padding: 0;
  gap: 18px;
  border: 0;
}
.history-metrics > span {
  font-size: 12px;
  color: var(--muted);
}
.history-metrics small {
  font-size: 11px;
}
.overview-empty {
  min-height: 0;
  padding: 28px 8px;
}
</style>
