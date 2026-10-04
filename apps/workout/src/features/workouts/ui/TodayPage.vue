<script setup lang="ts">
import { computed } from "vue";
import {
  sessionTotals,
  type Snapshot,
  type CompletedSession,
  type Routine,
} from "../domain";
import {
  fmt,
  shortDate,
  longDate,
  sessionMinutes,
  trainingTotals,
} from "./presentation";
import {
  Plus,
  Dumbbell,
  ListChecks,
  Clock3,
  ArrowRight,
  Check,
  ArrowUpRight,
  ChevronRight,
  History,
} from "@lucide/vue";
const { history, routines, active, now, elapsed, saving } = defineProps<{
  history: CompletedSession[];
  routines: Routine[];
  active: Snapshot["active"];
  now: number;
  elapsed: string;
  saving: boolean;
}>();
const emit = defineEmits<{
  start: [routineId: string | null];
  navigate: [page: "session" | "workouts"];
  detail: [id: string];
}>();
const startWorkout = (id: string | null) => emit("start", id);
const navigate = (page: "session" | "workouts") => emit("navigate", page);
const nextRoutine = computed(() => {
  const last = history[0];
  const index = last ? routines.findIndex((r) => r.name === last.name) : -1;
  return routines[(index + 1) % Math.max(1, routines.length)];
});
const totals = computed(() => trainingTotals(history));
const activeTotals = computed(() =>
  active ? sessionTotals(active) : { completedSets: 0, volumeKg: 0 },
);
const week = computed(() => {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      label: date.toLocaleDateString("en", { weekday: "short" }),
      date: date.getDate(),
      today: date.toDateString() === new Date(now).toDateString(),
      count: history.filter(
        (s) => new Date(s.finishedAt).toDateString() === date.toDateString(),
      ).length,
    };
  });
});
const weekCount = computed(() =>
  week.value.reduce((sum, day) => sum + day.count, 0),
);
</script>

<template>
  <div class="page-heading">
    <div>
      <div class="eyebrow">{{ longDate(now) }}</div>
      <h1>Today</h1>
    </div>
    <button
      class="btn secondary"
      :disabled="saving"
      @click="startWorkout(null)"
    >
      <Plus :size="17" />Free workout
    </button>
  </div>
  <div class="today-grid">
    <section class="next-workout panel">
      <div class="panel-overline">
        <span class="eyebrow">{{ active ? "IN PROGRESS" : "UP NEXT" }}</span
        ><span class="pill"><Dumbbell :size="13" />Strength</span>
      </div>
      <div class="next-content">
        <div>
          <h2>
            {{ active?.name ?? nextRoutine?.name ?? "Your first workout" }}
          </h2>
          <div class="workout-facts">
            <span
              ><ListChecks :size="15" />{{
                active?.exercises.length ?? nextRoutine?.exercises.length ?? 0
              }}
              exercises</span
            ><span v-if="active"><Clock3 :size="15" />{{ elapsed }}</span>
          </div>
        </div>
        <div class="workout-art" aria-hidden="true">
          <svg viewBox="0 0 200 180" fill="none">
            <path d="M28 125 98 164 172 122V55L103 16 28 56z" />
            <path
              d="m28 56 72 40 72-41M100 96v68M28 90l72 41 72-42M63 36l73 40v67M137 36 63 77v67"
            />
            <path class="art-accent" d="m64 104 36 20 36-20V77l-36-21-36 21z" />
          </svg>
        </div>
      </div>
      <div class="next-footer">
        <button
          class="btn primary"
          :disabled="saving"
          @click="
            active ? navigate('session') : startWorkout(nextRoutine?.id ?? null)
          "
        >
          {{ active ? "Resume workout" : "Start workout"
          }}<ArrowRight :size="17" /></button
        ><span v-if="active" class="muted small"
          >{{ activeTotals.completedSets }} sets logged</span
        >
      </div>
    </section>
    <section class="week-panel panel">
      <div class="section-heading">
        <h2>This week</h2>
        <span class="muted small"
          >{{ weekCount }} {{ weekCount === 1 ? "session" : "sessions" }}</span
        >
      </div>
      <div class="week-days">
        <div
          v-for="day in week"
          :key="day.label"
          class="week-day"
          :class="{ today: day.today, trained: day.count > 0 }"
        >
          <span>{{ day.label.slice(0, 1) }}</span>
          <div>{{ day.date }}</div>
          <Check
            v-if="day.count"
            :size="13"
            aria-label="Workout completed"
          /><span v-else class="day-dot"></span>
        </div>
      </div>
    </section>
  </div>
  <section class="metrics" aria-label="Training totals">
    <div>
      <span class="muted">Workouts completed</span
      ><strong>{{ totals.workouts }}<span>sessions</span></strong>
    </div>
    <div>
      <span class="muted">Sets logged</span
      ><strong>{{ fmt(totals.sets) }}<span>sets</span></strong>
    </div>
    <div>
      <span class="muted">Total volume</span
      ><strong>{{ fmt(totals.volume) }}<span>kg</span></strong>
    </div>
  </section>
  <section>
    <div class="section-heading">
      <div>
        <h2>Your routines</h2>
      </div>
      <a class="text-link" href="#/workouts"
        >View all<ArrowUpRight :size="15"
      /></a>
    </div>
    <div class="routine-list">
      <button
        v-for="(routine, index) in routines.slice(0, 3)"
        :key="routine.id"
        class="routine-list-row"
        :disabled="saving"
        @click="startWorkout(routine.id)"
      >
        <span class="routine-symbol"><Dumbbell :size="18" /></span
        ><span class="routine-list-name"
          >{{ routine.name
          }}<small
            >{{ routine.exercises.length }} exercises ·
            {{ routine.exercises.reduce((sum, ex) => sum + ex.sets, 0) }}
            sets</small
          ></span
        ><span class="muted routine-number">0{{ index + 1 }}</span
        ><ArrowRight :size="17" />
      </button>
    </div>
  </section>
  <section class="recent-section">
    <div class="section-heading">
      <h2>Recent activity</h2>
      <a v-if="history.length" class="text-link" href="#/history"
        >View history<ArrowUpRight :size="15"
      /></a>
    </div>
    <button
      v-if="history[0]"
      class="history-row"
      @click="emit('detail', history[0].id)"
    >
      <span class="history-icon"><Check :size="18" /></span
      ><span class="history-name"
        >{{ history[0].name
        }}<small
          >{{ shortDate(history[0].finishedAt) }} ·
          {{ sessionMinutes(history[0]) }} min</small
        ></span
      ><span class="muted small"
        >{{ sessionTotals(history[0]).completedSets }} sets</span
      ><ChevronRight :size="18" />
    </button>
    <div v-else class="empty-inline">
      <History :size="21" />
      <div>
        <strong>No workouts yet</strong>
        <p class="muted small">Completed sessions will appear here.</p>
      </div>
    </div>
  </section>
</template>
