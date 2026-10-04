<script setup lang="ts">
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
import { fmt, duration } from "./presentation";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import type { Confirmation } from "./dialogTypes";
const props = defineProps<{
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
} = props.workspace;
const emit = defineEmits<{
  finish: [];
  pick: [];
  options: [id: string];
  confirm: [request: Confirmation];
  navigate: [page: "workouts"];
}>();
const navigate = (page: "workouts") => emit("navigate", page);
</script>

<template>
  <template v-if="active"
    ><a class="training-back text-button" href="#/workouts">Back to workouts</a>
    <div class="page-heading session-heading">
      <div>
        <h1>{{ active.name }}</h1>
        <p class="muted">
          <Clock3 :size="14" />{{ elapsed }} elapsed<span class="separator"
            >·</span
          >{{ active.exercises.length }} exercises
        </p>
      </div>
      <button
        class="btn secondary"
        :disabled="saving || !activeTotals.completedSets"
        @click="emit('finish')"
      >
        Finish workout<Check :size="17" />
      </button>
    </div>
    <div v-if="training.notice.value" class="training-notice">
      <span role="status">{{ training.notice.value }}</span
      ><button
        v-if="training.lastLog.value"
        class="text-button"
        :disabled="saving"
        @click="training.undo"
      >
        Undo last log
      </button>
    </div>
    <div class="session-layout">
      <div class="exercise-stack">
        <article
          v-for="(exercise, exIndex) in active.exercises"
          :key="exercise.id"
          class="exercise-card"
          :class="{
            'current-exercise':
              training.current.value?.exercise.id === exercise.id,
          }"
        >
          <header>
            <div class="exercise-title">
              <span class="exercise-index">{{
                String(exIndex + 1).padStart(2, "0")
              }}</span>
              <div>
                <h2>{{ exercise.name }}</h2>
                <p class="muted small">
                  {{ exercise.category }}<span class="separator">·</span
                  >{{ exercise.sets.filter((set) => set.completed).length }}/{{
                    exercise.sets.length
                  }}
                  sets logged
                </p>
              </div>
            </div>
            <button
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
            </button>
          </header>
          <div class="set-labels">
            <span>SET</span><span>WEIGHT · KG</span><span>REPS</span
            ><span>LOG</span><span></span>
          </div>
          <SetRow
            v-for="set in exercise.sets"
            :key="set.id"
            :row="training.rows.get(set.id)!"
            :busy="saving"
            :current="training.current.value?.set.id === set.id"
            :dirty="training.dirty(training.rows.get(set.id)!)"
            :conflict="training.conflict(training.rows.get(set.id)!)"
            @edit="(values) => training.edit(set.id, values)"
            @select="training.selected.value = set.id"
            @commit="training.commit(set.id)"
            @options="emit('options', set.id)"
            @discard="training.useSaved(set.id)"
            @keep="training.keepInput(set.id)"
            @recover="(draft) => training.chooseDraft(set.id, draft)"
          /><button
            class="add-set text-button"
            :disabled="saving || exercise.sets.length >= 30"
            @click="
              run({
                type: 'add-set',
                sessionId: active.id,
                exerciseId: exercise.id,
              })
            "
          >
            <Plus :size="15" />Add set
          </button>
        </article>
        <div v-if="active.exercises.length === 0" class="empty-state">
          <Dumbbell :size="32" />
          <h2>What are we training?</h2>
          <p class="muted">Add your first exercise to start logging sets.</p>
        </div>
        <button class="btn secondary full-width" @click="emit('pick')">
          <Plus :size="18" />Add exercise
        </button>
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
          <button
            v-if="rest > 0"
            class="btn secondary full-width"
            :disabled="saving"
            @click="run({ type: 'stop-rest', sessionId: active.id })"
          >
            Skip rest<ArrowRight :size="16" />
          </button>
        </section>
        <button
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
        </button>
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
    <p class="muted">Choose a routine or start a free workout.</p>
    <button class="btn primary" @click="navigate('workouts')">
      Choose a workout<ArrowRight :size="17" />
    </button>
  </div>
</template>
