<script setup lang="ts">
import { Button, NativeSelect } from "@form/ui";
import { computed, watch } from "vue";
import { TrendingUp, ArrowRight } from "@lucide/vue";
import type { CompletedSession } from "../domain";
import { fmt, shortDate, trainingTotals } from "./presentation";
const { history } = defineProps<{ history: CompletedSession[] }>();
const progressExercise = defineModel<string>("exercise", { required: true });
const emit = defineEmits<{ navigate: [page: "workouts"] }>();
const navigate = (page: "workouts") => emit("navigate", page);
const totals = computed(() => trainingTotals(history));
const trainedExercises = computed(() => {
  const names = new Map<string, string>();
  for (const session of history)
    for (const ex of session.exercises)
      if (ex.sets.some((set) => set.completed))
        names.set(ex.exerciseId, ex.name);
  return [...names].map(([id, name]) => ({ id, name }));
});
watch(
  trainedExercises,
  (list) => {
    if (!list.some((ex) => ex.id === progressExercise.value))
      progressExercise.value = list[0]?.id ?? "";
  },
  { immediate: true },
);
const trend = computed(() =>
  history
    .slice()
    .reverse()
    .flatMap((session) => {
      const sets = session.exercises
        .filter((ex) => ex.exerciseId === progressExercise.value)
        .flatMap((ex) => ex.sets.filter((set) => set.completed));
      return sets.length
        ? [
            {
              at: session.finishedAt,
              weight: Math.max(...sets.map((set) => set.weightKg)),
            },
          ]
        : [];
    })
    .slice(-12),
);
const trendMax = computed(() =>
  Math.max(10, ...trend.value.map((point) => point.weight)),
);
const trendPoints = computed(() =>
  trend.value.map((point, index) => ({
    ...point,
    x:
      trend.value.length === 1
        ? 300
        : 25 + (index / (trend.value.length - 1)) * 550,
    y: 160 - (point.weight / trendMax.value) * 130,
  })),
);
const records = computed(() =>
  trainedExercises.value.map((ex) => {
    const sets = history.flatMap((session) =>
      session.exercises
        .filter((item) => item.exerciseId === ex.id)
        .flatMap((item) => item.sets.filter((set) => set.completed)),
    );
    const best = sets
      .slice()
      .sort((a, b) => b.weightKg - a.weightKg || b.reps - a.reps)[0];
    return { ...ex, weight: best?.weightKg ?? 0, reps: best?.reps ?? 0 };
  }),
);
</script>

<template>
  <div class="page-heading">
    <div>
      <h1>Progress</h1>
    </div>
    <span class="pill">All time</span>
  </div>
  <section class="metrics progress-metrics">
    <div>
      <span class="muted">Completed workouts</span
      ><strong>{{ totals.workouts }}<span>sessions</span></strong>
    </div>
    <div>
      <span class="muted">Total volume</span
      ><strong>{{ fmt(totals.volume) }}<span>kg</span></strong>
    </div>
    <div>
      <span class="muted">Completed sets</span
      ><strong>{{ fmt(totals.sets) }}<span>sets</span></strong>
    </div>
  </section>
  <div v-if="!history.length" class="empty-state panel">
    <TrendingUp :size="34" />
    <h2>No progress yet</h2>
    <p class="muted">Complete a workout to track your progress.</p>
    <Button class="btn primary" @click="navigate('workouts')">
      Start training<ArrowRight :size="17" />
    </Button>
  </div>
  <template v-else
    ><section class="chart-panel panel">
      <div class="section-heading">
        <div>
          <h2>Weight over time</h2>
          <p class="muted small">Heaviest logged set per session · kg</p>
        </div>
        <label class="sr-only" for="progress-exercise">Exercise progress</label
        ><NativeSelect
          id="progress-exercise"
          v-model="progressExercise"
          class="input compact-select"
        >
          <option
            v-for="exercise in trainedExercises"
            :key="exercise.id"
            :value="exercise.id"
          >
            {{ exercise.name }}
          </option>
        </NativeSelect>
      </div>
      <div v-if="trend.length === 1" class="first-progress-point">
        <strong>{{ fmt(trend[0]!.weight) }} <span>kg</span></strong>
        <p class="muted">Your starting point · {{ shortDate(trend[0]!.at) }}</p>
        <p class="muted small">
          Log this exercise in another workout to see your trend.
        </p>
      </div>
      <svg
        v-else
        class="trend-chart"
        viewBox="0 0 600 190"
        role="img"
        :aria-label="`Heaviest weights across ${trend.length} recorded sessions. Values listed below.`"
      >
        <path d="M25 30H575M25 95H575M25 160H575" class="chart-grid" />
        <polyline
          :points="trendPoints.map((p) => `${p.x},${p.y}`).join(' ')"
          class="chart-line"
        />
        <circle
          v-for="(point, index) in trendPoints"
          :key="index"
          :cx="point.x"
          :cy="point.y"
          r="4"
          class="chart-point"
        />
      </svg>
      <div v-if="trend.length > 1" class="chart-values">
        <span v-for="(point, index) in trend" :key="index"
          >{{ shortDate(point.at)
          }}<strong>{{ fmt(point.weight) }} kg</strong></span
        >
      </div>
    </section>
    <section>
      <div class="section-heading">
        <h2>Personal bests</h2>
        <span class="muted small">Heaviest completed sets</span>
      </div>
      <div class="records-grid">
        <article v-for="record in records" :key="record.id" class="record-card">
          <span class="muted small">{{ record.name }}</span
          ><strong>{{ fmt(record.weight) }}<span> kg</span></strong
          ><span class="muted small"
            >{{ record.reps }} reps at this weight</span
          >
        </article>
      </div>
    </section></template
  >
</template>
