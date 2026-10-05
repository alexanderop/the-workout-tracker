<script setup lang="ts">
import { BaseButtonIcon, BaseButton, BaseInput } from "@form/ui";
import { computed, ref } from "vue";
import {
  Plus,
  Dumbbell,
  ArrowRight,
  Repeat2,
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
import { fmt, sessionMinutes, longDate } from "./presentation";
const {
  routines,
  history: allHistory,
  active,
  exercises,
  saving,
} = defineProps<{
  routines: Routine[];
  history: CompletedSession[];
  active: Snapshot["active"];
  exercises: Snapshot["exercises"];
  saving: boolean;
}>();
const emit = defineEmits<{
  start: [id: string | null];
  edit: [routine: Routine | null];
  navigate: [page: "session"];
  detail: [id: string];
  repeat: [id: string];
  convert: [id: string];
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
  <div class="page-heading">
    <div>
      <span v-if="!isFreshJournal" class="eyebrow">YOUR TRAINING JOURNAL</span>
      <h1>Workouts</h1>
      <p v-if="!isFreshJournal" class="muted">
        A little stronger, one session at a time.
      </p>
    </div>
    <BaseButton
      v-if="!isFreshJournal"
      unstyled
      class="btn primary"
      :disabled="saving"
      @click="emit('start', null)"
    >
      <Plus :size="18" />{{ active ? "Continue workout" : "Start workout" }}
    </BaseButton>
  </div>
  <BaseButton
    unstyled
    v-if="active"
    class="resume-banner"
    @click="emit('navigate', 'session')"
  >
    <span class="activity-dot"></span
    ><span
      >{{ active.name
      }}<small
        >In progress · {{ sessionTotals(active).completedSets }} sets
        logged</small
      ></span
    ><span class="text-link">Continue<ArrowRight :size="17" /></span>
  </BaseButton>
  <section v-if="isFreshJournal" class="workout-welcome panel">
    <span class="welcome-mark" aria-hidden="true"><Dumbbell :size="26" /></span>
    <h2>Your first workout starts here.</h2>
    <p class="muted">Choose an exercise and log your first set.</p>
    <BaseButton
      unstyled
      class="btn primary"
      :disabled="saving"
      @click="emit('start', null)"
    >
      <Plus :size="18" aria-hidden="true" /><span>Start your first workout</span>
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
        class="panel workout-history-card"
      >
        <BaseButton
          unstyled
          class="history-card-title"
          @click="emit('detail', session.id)"
        >
          <span
            ><small class="muted">{{ longDate(session.finishedAt) }}</small
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
            >{{ fmt(sessionTotals(session).volumeKg) }} <small>kg</small></span
          >
        </div>
        <footer>
          <BaseButton
            unstyled
            class="btn secondary"
            :disabled="saving || !!active"
            @click="emit('repeat', session.id)"
          >
            <Repeat2 :size="16" />Repeat workout</BaseButton
          ><BaseButtonIcon
            :label="`Save ${session.name} as template`"
            @click="emit('convert', session.id)"
          >
            <BookmarkPlus :size="19" />
          </BaseButtonIcon>
        </footer>
      </article>
      <p v-if="!allHistory.length" class="muted">
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
</template>
