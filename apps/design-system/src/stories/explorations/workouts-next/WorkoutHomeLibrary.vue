<script setup lang="ts">
import { ref } from "vue";
import { ArrowRight, ArrowUpRight, Library } from "@lucide/vue";

defineProps<{
  populated: boolean;
  calendar?: "week" | "month" | "rhythm";
}>();
const emit = defineEmits<{ action: [label: string] }>();
const section = ref<"history" | "templates">("history");
const history = [
  {
    day: "03",
    month: "OCT",
    name: "Upper body",
    detail: "6 exercises · 18 sets",
    duration: "48 min",
  },
  {
    day: "01",
    month: "OCT",
    name: "Lower body",
    detail: "5 exercises · 15 sets",
    duration: "42 min",
  },
  {
    day: "28",
    month: "SEP",
    name: "Full body",
    detail: "7 exercises · 21 sets",
    duration: "56 min",
  },
];
function selectHistory() {
  section.value = "history";
}
function selectTemplates() {
  section.value = "templates";
}
</script>

<template>
  <section class="journal-section" aria-label="Workout library">
    <div class="section-switch" role="group" aria-label="Show workouts">
      <button
        type="button"
        :aria-pressed="section === 'history'"
        @click="selectHistory"
      >
        History<span v-if="populated">{{ calendar ? 4 : 3 }}</span>
      </button>
      <button
        type="button"
        :aria-pressed="section === 'templates'"
        @click="selectTemplates"
      >
        Templates<span v-if="populated">2</span>
      </button>
    </div>
    <template v-if="populated">
      <div v-if="section === 'history'" class="history-list">
        <button
          v-if="calendar"
          type="button"
          class="history-row"
          @click="emit('action', 'Morning mobility')"
        >
          <span class="calendar-date"
            ><strong>05</strong><small>OCT</small></span
          ><span class="workout-info"
            ><strong>Morning mobility</strong><small>4 sets</small></span
          ><span class="duration">18 min</span
          ><ArrowUpRight :size="16" aria-hidden="true" />
        </button>
        <button
          v-for="workout in history"
          :key="workout.name"
          type="button"
          class="history-row"
          @click="emit('action', workout.name)"
        >
          <span class="calendar-date"
            ><strong>{{ workout.day }}</strong
            ><small>{{ workout.month }}</small></span
          >
          <span class="workout-info"
            ><strong>{{ workout.name }}</strong
            ><small>{{ workout.detail }}</small></span
          >
          <span class="duration">{{ workout.duration }}</span
          ><ArrowUpRight :size="16" aria-hidden="true" />
        </button>
      </div>
      <div v-else class="history-list">
        <button
          v-for="name in ['Upper / Lower A', 'Full body']"
          :key="name"
          class="history-row"
          type="button"
          @click="emit('action', name)"
        >
          <Library :size="22" aria-hidden="true" /><span class="workout-info"
            ><strong>{{ name }}</strong
            ><small>Workout template</small></span
          ><ArrowRight :size="18" aria-hidden="true" />
        </button>
      </div>
    </template>
    <div v-else class="empty-library">
      <span class="empty-mark" aria-hidden="true"
        ><Library :size="23" :stroke-width="1.25"
      /></span>
      <h3>
        {{
          section === "history"
            ? "Your first workout starts here"
            : "Your routines, ready to repeat"
        }}
      </h3>
      <p>
        {{
          section === "history"
            ? "Finished workouts will appear here."
            : "Save a finished workout as a template."
        }}
      </p>
    </div>
  </section>
</template>

<style scoped>
h3,
p {
  margin: 0;
}
.journal-section {
  margin-top: var(--space-7);
}
.section-switch {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  border-bottom: 1px solid var(--border);
}
.section-switch button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 44px;
  padding: 0 0 var(--space-3);
  border: 0;
  border-bottom: 2px solid transparent;
  background: none;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--muted);
}
.section-switch button[aria-pressed="true"] {
  color: var(--text);
  border-bottom-color: var(--text);
}
.section-switch span {
  font-size: var(--text-xs);
  color: var(--muted);
}
.empty-library {
  padding: var(--space-7) var(--space-2);
  text-align: center;
}
.empty-mark {
  display: inline-flex;
  margin-bottom: var(--space-4);
  color: var(--muted);
}
h3 {
  font-size: var(--text-sm);
  font-weight: 500;
}
.empty-library p {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--muted);
  line-height: 1.5;
}
.history-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-align: left;
  color: var(--text);
  background: none;
  border: 0;
  border-bottom: 1px solid var(--border);
  min-height: 83px;
  padding: var(--space-3) 0;
}
.history-row:hover {
  background: var(--surface);
}
.calendar-date {
  display: grid;
  gap: var(--space-1);
  text-align: center;
  min-width: 28px;
}
.calendar-date strong {
  font-size: var(--text-lg);
  font-weight: 500;
  letter-spacing: -0.8px;
}
.calendar-date small {
  font-size: var(--text-xs);
  letter-spacing: 1px;
  color: var(--muted);
}
.workout-info {
  display: grid;
  gap: var(--space-1);
  flex: 1;
}
.workout-info strong {
  font-size: var(--text-sm);
  font-weight: 500;
}
.workout-info small,
.duration {
  color: var(--muted);
  font-size: var(--text-xs);
}
.history-row > svg {
  color: var(--muted);
}
.next-home--journal .section-switch {
  border-bottom: 0;
}
.next-home--journal .section-switch button[aria-pressed="true"] {
  border-bottom-color: transparent;
}
.next-home--journal .empty-library {
  text-align: left;
  padding-left: 0;
}
.next-home--journal .empty-mark {
  display: none;
}
.next-home--compact .section-switch {
  border: 0;
  gap: var(--space-1);
  padding: var(--space-1);
  background: var(--surface);
  border-radius: var(--radius-md);
}
.next-home--compact .section-switch button {
  flex: 1;
  justify-content: center;
  padding: 0;
  min-height: 38px;
  border: 0;
  border-radius: var(--radius-md);
}
.next-home--compact .section-switch button[aria-pressed="true"] {
  background: var(--background);
}
.next-home--compact .history-row {
  min-height: 74px;
}
.next-home--compact .calendar-date {
  display: none;
}
@media (max-width: 350px) {
  .duration {
    display: none;
  }
}
</style>
