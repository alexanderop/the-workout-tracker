<script setup lang="ts">
import { ref } from "vue";
import { Plus, X, CircleAlert } from "@lucide/vue";
import CalendarConcept from "./CalendarConcept.vue";
import WorkoutHomeSession from "./WorkoutHomeSession.vue";
import WorkoutHomeLibrary from "./WorkoutHomeLibrary.vue";
import WorkoutHomeNav from "./WorkoutHomeNav.vue";

defineProps<{
  direction: "focus" | "journal" | "compact";
  populated: boolean;
  showError: boolean;
  framed?: boolean;
  calendar?: "week" | "month" | "rhythm";
}>();
const feedback = ref("");
function previewAction(label: string) {
  feedback.value = `${label} selected. This layout study does not open or save a workout.`;
}
function startWorkout() {
  previewAction("Start workout");
}
function clearFeedback() {
  feedback.value = "";
}
</script>

<template>
  <div
    class="next-home"
    :class="[`next-home--${direction}`, { 'is-framed': framed }]"
  >
    <header class="home-heading">
      <div>
        <span v-if="direction === 'journal'" class="eyebrow"
          >THE WORKOUT TRACKER</span
        >
        <h1>
          Workouts<span v-if="direction === 'journal'" class="title-dot"
            >.</span
          >
        </h1>
      </div>
      <span class="date-label">MON, OCT 5</span>
    </header>
    <main class="home-main">
      <aside v-if="showError" class="recovery">
        <CircleAlert :size="17" aria-hidden="true" /><span
          >Couldn’t open that workout.</span
        ><button type="button" @click="previewAction('Retry')">Retry</button>
      </aside>
      <CalendarConcept
        v-if="calendar"
        :mode="calendar"
        :populated="populated"
      />
      <WorkoutHomeSession
        :direction="direction"
        :populated="populated"
        @action="previewAction"
      />
      <WorkoutHomeLibrary
        :populated="populated"
        :calendar="calendar"
        @action="previewAction"
      />
      <button
        v-if="populated"
        type="button"
        class="secondary-start"
        @click="startWorkout"
      >
        <Plus :size="16" aria-hidden="true" />Start a different workout
      </button>
      <div v-if="feedback" class="demo-feedback" role="status">
        <span>{{ feedback }}</span
        ><button
          type="button"
          aria-label="Dismiss preview feedback"
          @click="clearFeedback"
        >
          <X :size="18" />
        </button>
      </div>
    </main>
    <WorkoutHomeNav @action="previewAction" @home="clearFeedback" />
  </div>
</template>

<style scoped>
.next-home {
  min-height: calc(100dvh - 70px);
  display: flex;
  flex-direction: column;
  background: var(--background);
  color: var(--text);
  font-family: Inter, sans-serif;
  text-align: left;
}
.next-home.is-framed {
  min-height: 740px;
}
.next-home :deep(*) {
  box-sizing: border-box;
}
.next-home :deep(button) {
  cursor: pointer;
}
.next-home :deep(button:focus-visible) {
  outline: 3px solid var(--focus-ring);
  outline-offset: 4px;
}
.home-heading {
  padding: var(--space-7) var(--space-6) var(--space-7);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
h1 {
  margin: 0;
}
h1 {
  font-size: var(--text-xl);
  font-weight: 600;
  letter-spacing: -1.1px;
  line-height: 1.2;
}
.date-label {
  color: var(--muted);
  font-size: var(--text-xs);
  letter-spacing: 0.8px;
  white-space: nowrap;
}
.home-main {
  padding: 0 var(--space-6) var(--space-6);
  flex: 1;
}
.secondary-start {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-5);
  border: 0;
  background: none;
  color: var(--muted);
  font-size: var(--text-sm);
}
.recovery,
.demo-feedback {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) 0;
  margin-bottom: var(--space-4);
  font-size: var(--text-xs);
  line-height: 1.5;
  color: var(--muted);
}
.recovery > span,
.demo-feedback > span {
  flex: 1;
}
.recovery button,
.demo-feedback button {
  min-height: 44px;
  min-width: 44px;
  border: 0;
  background: none;
  color: var(--text);
}
.demo-feedback {
  margin: var(--space-3) 0 0;
  border-top: 1px solid var(--border);
}
.eyebrow {
  display: block;
  margin-bottom: var(--space-4);
  font-size: var(--text-xs);
  letter-spacing: 1.8px;
  color: var(--muted);
}
.title-dot {
  color: var(--accent);
}
.next-home--journal .home-heading {
  align-items: end;
  padding-top: var(--space-7);
  padding-bottom: var(--space-7);
}
.next-home--journal h1 {
  font-size: var(--text-3xl);
  letter-spacing: -2px;
}
.next-home--journal .date-label {
  padding-bottom: var(--space-1);
  font-size: var(--text-xs);
}
.next-home--compact .home-heading {
  padding-bottom: var(--space-5);
}
.next-home--compact h1 {
  font-size: var(--text-xl);
}
@media (min-width: 700px) {
  .next-home:not(.is-framed) .home-heading,
  .next-home:not(.is-framed) .home-main {
    width: 100%;
    max-width: 760px;
    margin-inline: auto;
  }
  .next-home:not(.is-framed) {
    min-height: 100vh;
  }
  .next-home:not(.is-framed) .home-heading {
    padding-top: var(--space-8);
  }
}
@media (max-width: 350px) {
  .home-heading {
    padding-inline: var(--space-4);
  }
  .home-main {
    padding-inline: var(--space-4);
  }
  .next-home--journal h1 {
    font-size: var(--text-2xl);
  }
}
</style>
