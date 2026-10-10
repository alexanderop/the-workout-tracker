<script setup lang="ts">
import { ref } from "vue";
import ExplorationNotice from "../../ExplorationNotice.vue";
import WorkoutHomeConcept from "./workouts-next/WorkoutHomeConcept.vue";
const populated = ref(true);
const concepts = [
  {
    id: "week",
    direction: "focus",
    title: "A / A week at a glance",
    note: "Recommended starting point",
    description:
      "A quiet seven-day strip above your workout. Tap to open the month. Keeps the next action close.",
  },
  {
    id: "month",
    direction: "journal",
    title: "B / The calendar is the dashboard",
    note: "History first",
    description:
      "Browse the month directly. Choose a day to see what you trained. The active workout sits below.",
  },
  {
    id: "rhythm",
    direction: "compact",
    title: "C / Your training rhythm",
    note: "Explore the pattern",
    description:
      "A rolling 14-day view makes training gaps visible across week boundaries. Tap a day for details.",
  },
] as const;
</script>
<template>
  <Story id="calendar-dashboard" title="06 Explorations/Calendar dashboard">
    <template #controls
      ><HstCheckbox v-model="populated" title="Show sample completed workouts"
    /></template>
    <Variant
      id="compare"
      title="Compare calendar ideas"
      :meta="{ wrapper: false }"
    >
      <ExplorationNotice />
      <div class="calendar-board">
        <header class="board-intro">
          <span>CALENDAR / DASHBOARD EXPLORATIONS</span>
          <h1>A little context for your next workout.</h1>
          <p>
            Three ways to bring your training history into the home screen.
            Sample date: 5 October 2026.
          </p>
          <label
            ><input v-model="populated" type="checkbox" />Show sample completed
            workouts</label
          >
        </header>
        <div class="concept-grid">
          <section v-for="concept in concepts" :key="concept.id">
            <header class="concept-caption">
              <span>{{ concept.note }}</span>
              <h2>{{ concept.title }}</h2>
              <p>{{ concept.description }}</p>
            </header>
            <div class="concept-phone">
              <WorkoutHomeConcept
                framed
                :calendar="concept.id"
                :direction="concept.direction"
                :populated="populated"
                :show-error="false"
              />
            </div>
          </section>
        </div>
      </div>
    </Variant>
    <Variant
      v-for="concept in concepts"
      :id="concept.id"
      :key="concept.id"
      :title="concept.title"
      :meta="{ wrapper: false }"
      ><ExplorationNotice /><WorkoutHomeConcept
        :calendar="concept.id"
        :direction="concept.direction"
        :populated="populated"
        :show-error="false"
    /></Variant>
  </Story>
</template>
<style scoped>
.calendar-board {
  padding: 40px 24px 56px;
  background: var(--background);
  color: var(--text);
}
.board-intro,
.concept-grid {
  max-width: 1240px;
  margin-inline: auto;
}
.board-intro > span {
  color: var(--accent);
  font-size: 10px;
  letter-spacing: 1.7px;
}
.board-intro h1 {
  font-size: 34px;
  font-weight: 550;
  letter-spacing: -1.2px;
  line-height: 1.2;
  margin: 13px 0;
}
.board-intro p {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.6;
}
.board-intro label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  font-size: 12px;
  margin: 20px 0 30px;
  cursor: pointer;
}
.board-intro input {
  accent-color: var(--accent);
}
.concept-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 26px;
}
.concept-caption {
  min-height: 143px;
}
.concept-caption > span {
  font-size: 10px;
  color: var(--accent);
}
.concept-caption h2 {
  font-size: 17px;
  font-weight: 500;
  letter-spacing: -0.3px;
  margin: 10px 0;
}
.concept-caption p {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
  max-width: 330px;
}
.concept-phone {
  border: 1px solid var(--border);
  border-radius: 22px;
  overflow: hidden;
}
@media (max-width: 1100px) {
  .concept-grid {
    grid-template-columns: 1fr;
    max-width: 390px;
    gap: 36px;
  }
  .board-intro {
    max-width: 390px;
  }
  .concept-caption {
    min-height: auto;
    margin-bottom: 22px;
  }
}
</style>
<docs lang="md">
# Calendar dashboard

## Usage

Three brainstorming proposals build on the original workoutTracker week strip and monthly sheet. They are deliberately different information hierarchies, not approved product changes. A preserves a clear next workout action; B makes date-based history the main interaction; C emphasizes training frequency without streak pressure.

## Variants

Compare calendar ideas shows three full home compositions. Individual variants support phone and desktop presets. Week opens a shared BaseSheet calendar. Month keeps it inline. Rhythm shows the last fourteen days, including quiet days, and opens the month with the tapped date selected.

## States and behavior

The fictional clock is 5 October 2026. Four completed sessions are shared with the home history; the current workout is separate. Turn sample data off for a real empty-state composition. Purple dots mean completed workouts, an outline marks today in the month/rhythm views, and a filled neutral cell marks selection. Week uses a filled purple today circle. Month arrows navigate and clear selection to the new month's first day. Day selection shows the corresponding sample session or an explicit empty state. The shared sheet supports Escape and focus restoration. At very narrow widths the month and rhythm grids scroll horizontally to preserve 44px date targets.

## Examples and limitations

All data is fictional, local and read-only. Calendar selection is interactive but no workout navigation, persistence, scheduling, streak calculations or production integration exists. The week begins Monday; rhythm is a rolling fourteen-day sequence, not a weekday-aligned month grid. No future planned workouts are inferred. The current app remains unchanged.
</docs>
