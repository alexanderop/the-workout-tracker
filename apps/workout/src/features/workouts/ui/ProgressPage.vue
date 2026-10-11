<script setup lang="ts">
import {
  BaseButton,
  BaseEmptyState,
  BasePageHeader,
  BaseSelect,
  BaseStat,
  BaseStatGroup,
} from "@form/ui";
import { computed, watch } from "vue";
import { TrendingUp, ArrowRight } from "@lucide/vue";
import type { CompletedSession } from "../domain";
import { useFormat, useTranslation } from "../../../i18n";
import { trainingTotals } from "./presentation";
import { successfulProgress } from "./progress";
const { history } = defineProps<{ history: CompletedSession[] }>();
const emit = defineEmits<{ navigate: [page: "workouts"] }>();
const { t } = useTranslation();
const format = useFormat();
const progressExercise = defineModel<string>("exercise", { required: true });
const navigate = (page: "workouts") => emit("navigate", page);
const totals = computed(() => trainingTotals(history));
const progress = computed(() => successfulProgress(history));
const trainedExercises = computed(() =>
  progress.value.map(({ id, name }) => ({ id, name })),
);
const exerciseOptions = computed(() =>
  trainedExercises.value.map(({ id, name }) => ({ value: id, label: name })),
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
  <BasePageHeader variant="root" :title="t('progress.title')">
    <template #action>
      <span class="progress-range">{{ t("progress.range") }}</span>
    </template>
  </BasePageHeader>
  <BaseStatGroup
    class="progress-stats"
    :aria-label="t('progress.metrics.group')"
  >
    <BaseStat
      :value="totals.workouts"
      :unit="t('progress.metrics.sessions', totals.workouts)"
      :label="t('progress.metrics.completedWorkouts')"
    />
    <BaseStat
      :value="format.number(totals.volume)"
      :unit="t('progress.metrics.kilograms')"
      :label="t('progress.metrics.totalVolume')"
    />
    <BaseStat
      :value="format.number(totals.sets)"
      :unit="t('progress.metrics.sets', totals.sets)"
      :label="t('progress.metrics.completedSets')"
    />
  </BaseStatGroup>
  <BaseEmptyState
    v-if="!history.length"
    :title="t('progress.empty.title')"
    :body="t('progress.empty.body')"
  >
    <template #icon><TrendingUp :size="34" /></template>
    <template #action
      ><BaseButton @click="navigate('workouts')"
        >{{ t("progress.empty.start") }}<ArrowRight :size="17" /></BaseButton
    ></template>
  </BaseEmptyState>
  <BaseEmptyState
    v-else-if="!trainedExercises.length"
    :title="t('progress.noSuccessfulSets.title')"
    :body="t('progress.noSuccessfulSets.body')"
  >
    <template #icon><TrendingUp :size="34" /></template>
  </BaseEmptyState>
  <template v-else
    ><section class="chart-panel panel">
      <div class="section-heading">
        <div>
          <h2>{{ t("progress.chart.title") }}</h2>
          <p class="muted small">{{ t("progress.chart.subtitle") }}</p>
        </div>
        <label class="sr-only" for="progress-exercise">{{
          t("progress.chart.exerciseLabel")
        }}</label
        ><BaseSelect
          id="progress-exercise"
          v-model="progressExercise"
          class="compact-select"
          :options="exerciseOptions"
        />
      </div>
      <div v-if="firstPoint" class="first-progress-point">
        <strong
          >{{ format.number(firstPoint.weight) }}
          <span>{{ t("progress.metrics.kilograms") }}</span></strong
        >
        <p class="muted">
          {{
            t("progress.chart.startingPoint", {
              date: format.shortDate(firstPoint.at),
            })
          }}
        </p>
        <p class="muted small">
          {{ t("progress.chart.logAgain") }}
        </p>
      </div>
      <svg
        v-else
        class="trend-chart"
        viewBox="0 0 600 190"
        role="img"
        :aria-label="t('progress.chart.description', trend.length)"
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
          >{{ format.shortDate(point.at)
          }}<strong
            >{{ format.number(point.weight) }}
            {{ t("progress.metrics.kilograms") }}</strong
          ></span
        >
      </div>
    </section>
    <section>
      <div class="section-heading">
        <h2>{{ t("progress.bests.title") }}</h2>
        <span class="muted small">{{ t("progress.bests.subtitle") }}</span>
      </div>
      <div class="records-grid">
        <article v-for="record in records" :key="record.id" class="record-card">
          <BaseStat
            :value="format.number(record.weight)"
            :unit="t('progress.metrics.kilograms')"
            :label="record.name"
          />
          <span class="muted small">{{
            t("progress.bests.repsAtWeight", record.reps)
          }}</span>
        </article>
      </div>
    </section></template
  >
</template>

<style scoped>
.progress-stats {
  margin-block-end: var(--space-7);
}
/* A caption, not a control: the range is fixed, so it has no pill outline. */
.progress-range {
  color: var(--muted);
  font-size: var(--text-sm);
  white-space: nowrap;
}
</style>
