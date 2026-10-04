<script setup lang="ts">
import { computed } from "vue";
import { Search, History, ArrowRight, ChevronRight } from "@lucide/vue";
import { sessionTotals, type CompletedSession } from "../domain";
import { fmt, sessionMinutes } from "./presentation";
const { history } = defineProps<{ history: CompletedSession[] }>();
const historySearch = defineModel<string>("search", { required: true });
const emit = defineEmits<{
  detail: [id: string];
  navigate: [page: "workouts"];
}>();
const navigate = (page: "workouts") => emit("navigate", page);
const filteredHistory = computed(() =>
  history.filter((session) =>
    session.name.toLowerCase().includes(historySearch.value.toLowerCase()),
  ),
);
</script>

<template>
  <div class="page-heading">
    <div>
      <h1>Your training history</h1>
      <p class="muted">
        {{
          history.length
            ? `${history.length} ${history.length === 1 ? "session" : "sessions"}`
            : "No workouts yet"
        }}
      </p>
    </div>
    <div v-if="history.length" class="search-field">
      <Search :size="17" /><input
        v-model="historySearch"
        aria-label="Search workout history"
        placeholder="Find a workout"
      />
    </div>
  </div>
  <div v-if="!history.length" class="empty-state panel">
    <History :size="34" />
    <h2>No workouts yet</h2>
    <p class="muted">Your completed workouts appear here.</p>
    <button class="btn primary" @click="navigate('workouts')">
      Find your workout<ArrowRight :size="17" />
    </button>
  </div>
  <div v-else class="history-list">
    <button
      v-for="session in filteredHistory"
      :key="session.id"
      class="history-row"
      @click="emit('detail', session.id)"
    >
      <span class="date-tile"
        ><strong>{{ new Date(session.finishedAt).getDate() }}</strong
        ><span>{{
          new Date(session.finishedAt).toLocaleDateString("en", {
            month: "short",
          })
        }}</span></span
      ><span class="history-name"
        >{{ session.name
        }}<small
          >{{ session.exercises.length }} exercises ·
          {{ sessionMinutes(session) }} min</small
        ></span
      ><span class="history-volume"
        >{{ fmt(sessionTotals(session).volumeKg)
        }}<small>kg volume</small></span
      ><span class="muted small history-sets"
        >{{ sessionTotals(session).completedSets }} sets</span
      ><ChevronRight :size="18" />
    </button>
    <p v-if="!filteredHistory.length" class="empty-inline muted">
      No workouts match your search.
    </p>
  </div>
</template>
