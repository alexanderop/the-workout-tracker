<script setup lang="ts">
import { computed } from "vue";
import { Plus, Dumbbell, MoreHorizontal, ArrowRight } from "@lucide/vue";
import { sessionTotals, type Snapshot, type Routine } from "../domain";
const { routines, active, exercises, saving } = defineProps<{
  routines: Routine[];
  active: Snapshot["active"];
  exercises: Snapshot["exercises"];
  saving: boolean;
}>();
const emit = defineEmits<{
  start: [id: string | null];
  edit: [routine: Routine | null];
  navigate: [page: "session"];
}>();
const startWorkout = (id: string | null) => emit("start", id);
const editRoutine = (routine: Routine | null) => emit("edit", routine);
const navigate = (page: "session") => emit("navigate", page);
const activeTotals = computed(() =>
  active ? sessionTotals(active) : { completedSets: 0, volumeKg: 0 },
);
</script>

<template>
  <div class="page-heading">
    <div>
      <h1>Your workouts</h1>
    </div>
    <button class="btn primary" @click="editRoutine(null)">
      <Plus :size="17" />Create routine
    </button>
  </div>
  <button v-if="active" class="resume-banner" @click="navigate('session')">
    <span class="activity-dot"></span
    ><span
      >{{ active.name
      }}<small
        >Workout in progress · {{ activeTotals.completedSets }} sets
        logged</small
      ></span
    ><span class="text-link">Resume<ArrowRight :size="17" /></span>
  </button>
  <div class="routine-grid">
    <article
      v-for="routine in routines"
      :key="routine.id"
      class="routine-card panel"
    >
      <header>
        <span class="routine-symbol"><Dumbbell :size="20" /></span
        ><button
          class="icon-button"
          :aria-label="`Edit ${routine.name}`"
          @click="editRoutine(routine)"
        >
          <MoreHorizontal :size="20" />
        </button>
      </header>
      <h2>{{ routine.name }}</h2>
      <p class="muted small routine-description">
        {{ routine.description || "Your custom training session." }}
      </p>
      <ul class="exercise-preview">
        <li
          v-for="entry in routine.exercises.slice(0, 4)"
          :key="entry.exerciseId"
        >
          <span>{{ exercises[entry.exerciseId]?.name }}</span
          ><span class="muted">{{ entry.sets }} × {{ entry.reps }}</span>
        </li>
        <li v-if="routine.exercises.length > 4" class="muted">
          + {{ routine.exercises.length - 4 }} more exercises
        </li>
      </ul>
      <footer>
        <span class="muted small">{{ routine.exercises.length }} exercises</span
        ><button
          class="btn secondary"
          :disabled="saving"
          :aria-label="`Start ${routine.name}`"
          @click="startWorkout(routine.id)"
        >
          Start<ArrowRight :size="16" />
        </button>
      </footer>
    </article>
    <button class="new-routine-card" @click="startWorkout(null)">
      <Plus :size="24" /><strong>Go with the flow</strong
      ><span class="muted small"
        >Start a free workout and add<br />exercises as you train.</span
      ><span class="text-link">Free workout<ArrowRight :size="16" /></span>
    </button>
  </div>
</template>
