<script setup lang="ts">
import { BaseButton, BaseInput } from "@form/ui";
import { computed, ref } from "vue";
import {
  Plus,
  Dumbbell,
  ArrowRight,
  BookmarkPlus,
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
  exercises,
  saving,
  now,
} = defineProps<{
  routines: Routine[];
  history: CompletedSession[];
  active: Snapshot["active"];
  exercises: Snapshot["exercises"];
  saving: boolean;
  now: number;
}>();
const emit = defineEmits<{
  start: [id: string | null];
  edit: [routine: Routine | null];
  navigate: [page: "session"];
  detail: [id: string];
}>();
const tab = defineModel<"history" | "templates">("view", {
  default: "history",
});
const search = ref("");
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
    <header class="dashboard-heading"><h1>Workouts</h1></header>
    <WorkoutCalendar
      :sessions="allHistory"
      :now="now"
      @detail="emit('detail', $event)"
    />
    <section v-if="active" class="active-workout-card">
      <div>
        <span class="active-label"><i aria-hidden="true" />IN PROGRESS</span>
        <h2>{{ active.name }}</h2>
        <p>
          {{ active.exercises.length }} exercises ·
          {{ sessionTotals(active).completedSets }} sets logged
        </p>
      </div>
      <BaseButton
        unstyled
        class="btn primary"
        @click="emit('navigate', 'session')"
        >Continue workout<ArrowRight :size="18"
      /></BaseButton>
    </section>
    <BaseButton
      v-else-if="!isFreshJournal"
      unstyled
      class="btn primary dashboard-start"
      :disabled="saving"
      @click="emit('start', null)"
      ><Plus :size="18" />Start workout</BaseButton
    >
    <section v-if="isFreshJournal" class="workout-welcome panel">
      <span class="welcome-mark" aria-hidden="true"
        ><Dumbbell :size="26"
      /></span>
      <h2>Your first workout starts here.</h2>
      <p class="muted">Choose an exercise and log your first set.</p>
      <BaseButton
        unstyled
        class="btn primary"
        :disabled="saving"
        @click="emit('start', null)"
      >
        <Plus :size="18" aria-hidden="true" /><span
          >Start your first workout</span
        >
      </BaseButton>
    </section>
    <div class="overview-toolbar">
      <div class="overview-tabs" aria-label="Workout views">
        <BaseButton
          unstyled
          :aria-pressed="tab === 'history'"
          :class="{ selected: tab === 'history' }"
          @click="tab = 'history'"
        >
          History <span>{{ allHistory.length }}</span></BaseButton
        ><BaseButton
          unstyled
          :aria-pressed="tab === 'templates'"
          :class="{ selected: tab === 'templates' }"
          @click="tab = 'templates'"
        >
          Templates <span>{{ routines.length }}</span>
        </BaseButton>
      </div>
      <BaseButton
        unstyled
        v-if="tab === 'templates'"
        class="text-button"
        @click="emit('edit', null)"
      >
        <Plus :size="16" />New template
      </BaseButton>
    </div>
    <template v-if="tab === 'history'">
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
    <template v-else>
      <div v-if="!routines.length" class="overview-empty">
        <BookmarkPlus :size="26" />
        <h2>Your shortcuts to the next session</h2>
        <p class="muted">
          Save a past workout as a template, or create one with your favorite
          exercises.
        </p>
        <BaseButton unstyled class="btn secondary" @click="emit('edit', null)">
          <Plus :size="17" />Create template
        </BaseButton>
      </div>
      <div v-else class="routine-grid">
        <article
          v-for="routine in routines"
          :key="routine.id"
          class="routine-card panel"
        >
          <header>
            <span class="routine-symbol"><Dumbbell :size="20" /></span
            ><BaseButton
              unstyled
              class="text-button"
              :aria-label="`Edit ${routine.name}`"
              @click="emit('edit', routine)"
            >
              Edit
            </BaseButton>
          </header>
          <h2>{{ routine.name }}</h2>
          <p class="muted small routine-description">
            {{ routine.description || "A plan for your next session." }}
          </p>
          <ul class="exercise-preview">
            <li
              v-for="(entry, index) in routine.exercises.slice(0, 4)"
              :key="index"
            >
              <span>{{ exercises[entry.exerciseId]?.name }}</span
              ><span class="muted"
                >{{ entry.sets.length }}
                {{ entry.sets.length === 1 ? "set" : "sets" }}</span
              >
            </li>
            <li v-if="routine.exercises.length > 4" class="muted">
              + {{ routine.exercises.length - 4 }} more
            </li>
          </ul>
          <footer>
            <span class="muted small"
              >{{ routine.exercises.length }} exercises</span
            ><BaseButton
              unstyled
              class="btn secondary"
              :disabled="saving || !!active"
              :aria-label="`Start ${routine.name}`"
              @click="emit('start', routine.id)"
            >
              Start<ArrowRight :size="16" />
            </BaseButton>
          </footer>
        </article>
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
.dashboard-heading {
  margin-bottom: 24px;
}
.dashboard-heading h1 {
  margin: 0;
  font-size: 27px;
  font-weight: 550;
  letter-spacing: -1px;
}
.active-workout-card {
  margin: 24px 0;
  padding: 20px;
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
  margin: 12px 0 7px;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.5px;
  overflow-wrap: anywhere;
}
.active-workout-card p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
}
.active-workout-card .btn {
  width: 100%;
  margin-top: 20px;
  min-height: 46px;
  justify-content: space-between;
}
.dashboard-start {
  width: 100%;
  margin: 24px 0;
  min-height: 48px;
}
.overview-toolbar {
  margin: 26px 0 17px;
  padding: 0;
  border: 0;
  flex-wrap: wrap;
  gap: 12px;
}
.overview-tabs {
  display: flex;
  padding: 4px;
  gap: 3px;
  background: var(--surface);
  border-radius: 9px;
  width: 100%;
  border: 0;
}
.overview-tabs button {
  flex: 1;
  min-height: 44px;
  padding: 8px 12px;
  margin: 0;
  border: 0;
  border-radius: 6px;
  font-size: 13px;
}
.overview-tabs button.selected {
  background: var(--background);
  color: var(--text);
  border: 0;
}
.overview-tabs button span {
  padding: 0 0 0 4px;
  background: none;
  font-size: 11px;
}
.overview-empty {
  min-height: 0;
  padding: 28px 8px;
}
.overview-empty p {
  font-size: 13px;
}
.workout-welcome {
  margin: 24px 0;
  padding: 24px 20px;
}
.workout-welcome h2 {
  font-size: 21px;
}
.history-search {
  margin-bottom: 8px;
}
.workout-history-grid {
  display: block;
}
.workout-history-card {
  padding: 16px 0;
  border: 0;
  border-bottom: 1px solid var(--surface);
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
  margin: 0;
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
</style>
