<script setup lang="ts">
import { BaseButton, BaseSelectNative } from "@form/ui";
import { computed, watch } from "vue";
import { TrendingUp, ArrowRight } from "@lucide/vue";
import type { CompletedSession } from "../domain";
import { fmt, shortDate, trainingTotals } from "./presentation";
import { successfulProgress } from "./progress";
const { history } = defineProps<{ history: CompletedSession[] }>();
const progressExercise = defineModel<string>("exercise", { required: true });
const emit = defineEmits<{ navigate: [page: "workouts"] }>();
const navigate = (page: "workouts") => emit("navigate", page);
const totals = computed(() => trainingTotals(history));
const progress = computed(() => successfulProgress(history));
const trainedExercises = computed(() =>
  progress.value.map(({ id, name }) => ({ id, name })),
);
watch(
  trainedExercises,
  (list) => {
    if (!list.some((ex) => ex.id === progressExercise.value))
      progressExercise.value = list[0]?.id ?? "";
  },
  { immediate: true },
);
const trend = computed(
  () =>
    progress.value.find((exercise) => exercise.id === progressExercise.value)
      ?.trend ?? [],
);
const firstPoint = computed(() =>
  trend.value.length === 1 ? trend.value[0] : undefined,
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
  progress.value.map(({ id, name, best }) => ({
    id,
    name,
    weight: best.weightKg,
    reps: best.reps,
  })),
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
    <BaseButton unstyled class="btn primary" @click="navigate('workouts')">
      Start training<ArrowRight :size="17" />
    </BaseButton>
  </div>
  <div v-else-if="!trainedExercises.length" class="empty-state panel">
    <TrendingUp :size="34" />
    <h2>No successful sets yet</h2>
    <p class="muted">
      Log a set with at least one repetition to see your weight trend and
      personal bests.
    </p>
  </div>
  <template v-else
    ><section class="chart-panel panel">
      <div class="section-heading">
        <div>
          <h2>Weight over time</h2>
          <p class="muted small">Heaviest successful set per workout · kg</p>
        </div>
        <label class="sr-only" for="progress-exercise">Exercise progress</label
        ><BaseSelectNative
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
        </BaseSelectNative>
      </div>
      <div v-if="firstPoint" class="first-progress-point">
        <strong>{{ fmt(firstPoint.weight) }} <span>kg</span></strong>
        <p class="muted">Your starting point · {{ shortDate(firstPoint.at) }}</p>
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
        <span class="muted small">Heaviest successful sets</span>
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
