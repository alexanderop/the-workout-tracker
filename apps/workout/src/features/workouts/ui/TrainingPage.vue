<script setup lang="ts">
import { Button, Input } from "@form/ui";
import { useTemplateRef, computed, nextTick, ref, watch } from "vue";
import {
  Clock3,
  Check,
  X,
  Plus,
  Dumbbell,
  ArrowRight,
  ShieldCheck,
} from "@lucide/vue";
import SetRow from "./SetRow.vue";
import ExerciseThumbnail from "./ExerciseThumbnail.vue";
import { fmt, duration } from "./presentation";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import type { Confirmation } from "./dialogTypes";
const { workspace } = defineProps<{
  workspace: Pick<
    WorkoutWorkspace,
    | "active"
    | "snapshot"
    | "saving"
    | "activeTotals"
    | "activeSetCount"
    | "elapsed"
    | "rest"
    | "training"
    | "run"
  >;
}>();
const {
  active,
  snapshot,
  saving,
  activeTotals,
  activeSetCount,
  elapsed,
  rest,
  training,
  run,
} = workspace;
const currentCatalogExercise = computed(() => {
  const current = training.currentExercise.value;
  if (!current) return undefined;
  const definition = snapshot.value?.exercises[current.exerciseId];
  return definition?.name === current.name ? definition : undefined;
});
const emit = defineEmits<{
  finish: [];
  pick: [];
  options: [id: string];
  confirm: [request: Confirmation];
  navigate: [page: "workouts"];
}>();
const navigate = (page: "workouts") => emit("navigate", page);
const setRows = useTemplateRef<InstanceType<typeof SetRow>[]>("setRows");
const exerciseTabs = useTemplateRef<HTMLElement>("exerciseTabs");
watch(
  () => training.currentExercise.value?.id,
  async () => {
    await nextTick();
    const tabs = exerciseTabs.value;
    const selected = tabs?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!tabs || !selected) return;
    const container = tabs.getBoundingClientRect();
    const item = selected.getBoundingClientRect();
    if (item.left < container.left) {
      tabs.scrollLeft += item.left - container.left - 4;
      return;
    }
    if (item.right > container.right)
      tabs.scrollLeft += item.right - container.right + 4;
  },
  { flush: "post" },
);
async function addSet(exerciseId: string) {
  await training.addSet(exerciseId);
  await nextTick();
  const id = training.current.value?.set.id;
  setRows.value?.find((row) => row.setId === id)?.scrollIntoView();
}
const name = ref("");
const nameIssue = ref("");
watch(
  () => active.value?.name,
  (value) => {
    name.value = value ?? "";
  },
  { immediate: true },
);
async function rename() {
  if (!active.value || name.value === active.value.name) return;
  if (!name.value.trim()) {
    nameIssue.value = "Give this workout a name.";
    return;
  }
  if (
    await run({ type: "rename", sessionId: active.value.id, name: name.value })
  ) {
    nameIssue.value = "";
    return;
  }
  nameIssue.value = "Name not saved. Try again.";
}
const previous = computed(() => {
  const exercise = training.currentExercise.value;
  if (!exercise) return null;
  return Object.values(snapshot.value?.completed ?? {})
    .sort((a, b) => b.finishedAt - a.finishedAt)
    .flatMap((session) => session.exercises)
    .find(
      (row) =>
        row.exerciseId === exercise.exerciseId &&
        row.sets.some((set) => set.completed),
    );
});
</script>

<template>
  <template v-if="active"
    ><a class="training-back text-button" href="#/workouts">Back to workouts</a>
    <div class="page-heading session-heading">
      <div>
        <h1 class="workout-name">
          <Input
            v-model="name"
            aria-label="Workout name"
            maxlength="80"
            :disabled="saving"
            @blur="rename"
            @keydown.enter.prevent="rename"
          />
        </h1>
        <p v-if="nameIssue" class="field-error" role="alert">{{ nameIssue }}</p>
        <p class="muted">
          <Clock3 :size="14" />{{ elapsed }} elapsed<span class="separator"
            >·</span
          >{{ active.exercises.length }} exercises
        </p>
      </div>
      <Button
        class="btn secondary"
        :disabled="saving || !activeTotals.completedSets"
        aria-label="Finish workout"
        @click="emit('finish')"
      >
        <span class="finish-label">Finish</span><Check :size="17" />
      </Button>
    </div>
    <div v-if="training.notice.value" class="training-notice">
      <span role="status">{{ training.notice.value }}</span
      ><Button
        v-if="training.lastLog.value"
        class="text-button"
        :disabled="saving"
        @click="training.undo"
      >
        Undo last log
      </Button>
    </div>
    <nav
      v-if="active.exercises.length"
      ref="exerciseTabs"
      class="exercise-tabs"
      aria-label="Workout exercises"
    >
      <Button
        v-for="(exercise, index) in active.exercises"
        :key="exercise.id"
        :aria-pressed="training.currentExercise.value?.id === exercise.id"
        :class="{
          selected: training.currentExercise.value?.id === exercise.id,
        }"
        @click="training.selectExercise(exercise.id)"
      >
        <span class="tab-exercise-index">{{
          String(index + 1).padStart(2, "0")
        }}</span
        ><span
          >{{ exercise.name
          }}<small
            >{{ exercise.sets.filter((set) => set.completed).length }}/{{
              exercise.sets.length
            }}
            sets</small
          ></span
        ><Check v-if="exercise.sets.every((set) => set.completed)" :size="15" />
      </Button>
      <Button
        class="exercise-tab-add"
        aria-label="Add exercises"
        :disabled="saving || active.exercises.length >= 50"
        @click="emit('pick')"
      >
        <Plus :size="20" />
      </Button>
    </nav>
    <div class="session-layout">
      <div class="exercise-stack">
        <article
          v-for="exercise in training.currentExercise.value
            ? [training.currentExercise.value]
            : []"
          :key="exercise.id"
          class="exercise-card"
          :class="{
            'current-exercise':
              training.current.value?.exercise.id === exercise.id,
          }"
        >
          <header>
            <div class="exercise-title">
              <ExerciseThumbnail
                :exercise="currentCatalogExercise"
              />
              <div>
                <h2>{{ exercise.name }}</h2>
                <p class="muted small">
                  {{ exercise.category }} ·
                  {{ exercise.sets.filter((set) => set.completed).length }}/{{
                    exercise.sets.length
                  }}
                  sets logged
                </p>
              </div>
            </div>
            <Button
              class="icon-button"
              :aria-label="`Remove ${exercise.name} from workout`"
              :disabled="saving"
              @click="
                emit('confirm', {
                  title: 'Remove exercise?',
                  description: `This removes ${exercise.name} and its logged sets from the active workout.`,
                  command: {
                    type: 'remove-exercise',
                    sessionId: active.id,
                    exerciseId: exercise.id,
                  },
                })
              "
            >
              <X :size="16" />
            </Button>
          </header>
          <div v-if="previous" class="previous-performance">
            <span class="eyebrow">LAST TIME</span>
            <p>
              {{
                previous.sets
                  .filter((set) => set.completed)
                  .map((set) => `${fmt(set.weightKg)} kg × ${set.reps}`)
                  .join(" · ")
              }}
            </p>
          </div>
          <div class="set-labels">
            <span>SET</span><span>WEIGHT · KG</span><span>REPS</span
            ><span>LOG</span><span></span>
          </div>
          <SetRow
            ref="setRows"
            v-for="set in exercise.sets"
            :key="set.id"
            :row="training.rows.get(set.id)!"
            :busy="saving"
            :current="training.current.value?.set.id === set.id"
            :dirty="training.dirty(training.rows.get(set.id)!)"
            :conflict="training.conflict(training.rows.get(set.id)!)"
            @edit="(values) => training.edit(set.id, values)"
            @select="training.selectSet(set.id)"
            @commit="training.commit(set.id)"
            @options="emit('options', set.id)"
            @discard="training.useSaved(set.id)"
            @keep="training.keepInput(set.id)"
            @recover="(draft) => training.chooseDraft(set.id, draft)"
          />
          <div
            v-if="
              exercise.sets.some((set) => training.rows.get(set.id)?.touched)
            "
            class="save-inputs"
          >
            <Button
              class="text-button"
              :disabled="saving"
              @click="training.saveEdits()"
            >
              Save input values without logging
            </Button>
          </div>
          <Button
            class="add-set text-button"
            :disabled="saving || exercise.sets.length >= 30"
            @click="addSet(exercise.id)"
          >
            <Plus :size="15" />Add set
          </Button>
        </article>
        <div v-if="active.exercises.length === 0" class="empty-state">
          <Dumbbell :size="32" />
          <h2>What are we training?</h2>
          <p class="muted">Add your first exercise to start logging sets.</p>
        </div>
        <Button
          class="btn secondary full-width"
          :disabled="saving || active.exercises.length >= 50"
          @click="emit('pick')"
        >
          <Plus :size="18" />Add exercises
        </Button>
      </div>
      <aside class="session-summary">
        <section class="panel">
          <div class="section-heading">
            <h2>Session</h2>
            <span class="pill">In progress</span>
          </div>
          <div class="summary-progress">
            <strong
              >{{ activeTotals.completedSets
              }}<span> / {{ activeSetCount }}</span></strong
            ><span class="muted small">sets completed</span>
          </div>
          <div class="progress-track">
            <div
              :style="{
                width: `${activeSetCount ? (activeTotals.completedSets / activeSetCount) * 100 : 0}%`,
              }"
            ></div>
          </div>
          <div class="summary-line">
            <span class="muted">Volume logged</span
            ><strong>{{ fmt(activeTotals.volumeKg) }} kg</strong>
          </div>
          <div class="summary-line">
            <span class="muted">Elapsed time</span
            ><strong>{{ elapsed }}</strong>
          </div>
        </section>
        <section class="rest-card panel">
          <div class="section-heading">
            <h2><Clock3 :size="16" />Rest timer</h2>
            <span class="muted small">{{
              snapshot?.settings.autoRest ? "Auto" : "Off"
            }}</span>
          </div>
          <strong class="rest-time">{{ duration(rest) }}</strong>
          <p class="muted small">
            {{
              rest > 0
                ? "Breathe. Your next set can wait."
                : active.rest
                  ? "Rest complete. Ready when you are."
                  : "Starts when you log a set."
            }}
          </p>
          <Button
            v-if="rest > 0"
            class="btn secondary full-width"
            :disabled="saving"
            @click="run({ type: 'stop-rest', sessionId: active.id })"
          >
            Skip rest<ArrowRight :size="16" />
          </Button>
        </section>
        <Button
          class="text-button discard-button"
          :disabled="saving"
          @click="
            emit('confirm', {
              title: 'Discard this workout?',
              description:
                'This deletes the active workout and its logged sets. Your completed history stays saved.',
              command: { type: 'discard', sessionId: active.id },
            })
          "
        >
          Discard workout
        </Button>
        <p class="saved-indicator" role="status">
          <ShieldCheck :size="14" />{{
            saving ? "Saving…" : "Logged sets saved on this device"
          }}
        </p>
      </aside>
    </div>
  </template>
  <div v-else class="empty-state">
    <Dumbbell :size="32" />
    <h1>Ready for your next session?</h1>
    <p class="muted">Start a workout or choose one of your templates.</p>
    <Button class="btn primary" @click="navigate('workouts')">
      Choose a workout<ArrowRight :size="17" />
    </Button>
  </div>
</template>
