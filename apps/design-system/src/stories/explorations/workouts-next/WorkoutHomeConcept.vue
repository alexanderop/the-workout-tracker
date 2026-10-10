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
  padding: 34px 24px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
h1 {
  margin: 0;
}
h1 {
  font-size: 27px;
  font-weight: 600;
  letter-spacing: -1.1px;
  line-height: 1.2;
}
.date-label {
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.8px;
  white-space: nowrap;
}
.home-main {
  padding: 0 24px 28px;
  flex: 1;
}
.secondary-start {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  border: 0;
  background: none;
  color: var(--muted);
  font-size: 12px;
}
.recovery,
.demo-feedback {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  margin-bottom: 16px;
  font-size: 11px;
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
  margin: 14px 0 0;
  border-top: 1px solid var(--border);
}
.eyebrow {
  display: block;
  margin-bottom: 17px;
  font-size: 9px;
  letter-spacing: 1.8px;
  color: var(--muted);
}
.title-dot {
  color: var(--accent);
}
.next-home--journal .home-heading {
  align-items: end;
  padding-top: 35px;
  padding-bottom: 39px;
}
.next-home--journal h1 {
  font-size: 42px;
  letter-spacing: -2px;
}
.next-home--journal .date-label {
  padding-bottom: 5px;
  font-size: 9px;
}
.next-home--compact .home-heading {
  padding-bottom: 22px;
}
.next-home--compact h1 {
  font-size: 23px;
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
    padding-top: 48px;
  }
}
@media (max-width: 350px) {
  .home-heading {
    padding-inline: 18px;
  }
  .home-main {
    padding-inline: 18px;
  }
  .next-home--journal h1 {
    font-size: 35px;
  }
}
</style>
