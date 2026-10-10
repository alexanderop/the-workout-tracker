<script setup lang="ts">
import { ref } from "vue";
import ExplorationNotice from "../../ExplorationNotice.vue";
import WorkoutHomeConcept from "./workouts-next/WorkoutHomeConcept.vue";
const populated = ref(false);
const showError = ref(false);
const concepts = [
  {
    id: "focus",
    title: "A / Focus",
    detail: "One clear next action. Soft surfaces, restrained purple.",
    recommendation: "Recommended",
  },
  {
    id: "journal",
    title: "B / Journal",
    detail: "Larger type, open space, almost no containers.",
    recommendation: "Most expressive",
  },
  {
    id: "compact",
    title: "C / Compact",
    detail: "Tighter rhythm, segmented tabs, more visible history.",
    recommendation: "Most practical",
  },
] as const;
</script>

<template>
  <Story id="workouts-next" title="06 Explorations/Workouts — next version">
    <template #controls
      ><HstCheckbox
        v-model="populated"
        title="Sample returning journal" /><HstCheckbox
        v-model="showError"
        title="Show recovery message"
    /></template>
    <Variant id="compare" title="Compare directions" :meta="{ wrapper: false }">
      <ExplorationNotice />
      <div class="direction-board">
        <header class="board-heading">
          <p>WORKOUTS / NEXT VERSION</p>
          <h1>Less noise. More intention.</h1>
          <span
            >Three directions using the existing palette. Compare the same
            content in each direction.</span
          >
          <div class="board-controls">
            <label
              ><input v-model="populated" type="checkbox" />Sample returning
              journal</label
            ><label
              ><input v-model="showError" type="checkbox" />Recovery
              message</label
            >
          </div>
        </header>
        <div class="direction-grid">
          <section
            v-for="concept in concepts"
            :key="concept.id"
            class="direction-study"
          >
            <header class="direction-caption">
              <div>
                <h2>{{ concept.title }}</h2>
                <span>{{ concept.recommendation }}</span>
              </div>
              <p>{{ concept.detail }}</p>
            </header>
            <div class="phone-frame">
              <WorkoutHomeConcept
                framed
                :direction="concept.id"
                :populated="populated"
                :show-error="showError"
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
        :direction="concept.id"
        :populated="populated"
        :show-error="showError"
    /></Variant>
  </Story>
</template>

<style scoped>
.direction-board {
  padding: 40px 28px 56px;
  background: var(--background);
  color: var(--text);
}
.board-heading {
  max-width: 1200px;
  margin: 0 auto 38px;
}
.board-heading p {
  color: var(--accent);
  font-size: 10px;
  letter-spacing: 2px;
  margin: 0 0 12px;
}
.board-heading h1 {
  font-size: 34px;
  font-weight: 550;
  letter-spacing: -1.3px;
  line-height: 1.2;
  margin: 0 0 13px;
}
.board-heading > span {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.6;
}
.board-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin-top: 18px;
}
.board-controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  font-size: 12px;
  color: var(--muted);
  cursor: pointer;
}
.board-controls input {
  accent-color: var(--accent);
}
.direction-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
  max-width: 1200px;
  margin: auto;
}
.direction-caption {
  min-height: 84px;
}
.direction-caption > div {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}
.direction-caption h2 {
  font-size: 15px;
  font-weight: 500;
  margin: 0;
}
.direction-caption span {
  font-size: 9px;
  color: var(--accent);
}
.direction-caption p {
  color: var(--muted);
  font-size: 11px;
  line-height: 1.6;
  max-width: 270px;
  margin: 10px 0 18px;
}
.phone-frame {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 25px;
}
@media (max-width: 1000px) {
  .direction-grid {
    grid-template-columns: 1fr;
    max-width: 390px;
    gap: 40px;
  }
  .board-heading {
    max-width: 390px;
  }
}
</style>

<docs lang="md">
# Workouts — next version

## Usage

Compare three proposed replacements for the Workouts home composition. These are design explorations, not implemented pages. A / Focus is the recommended starting point: it combines the duplicate continue controls into one session card and reserves purple for the primary action.

## Variants

- **Compare directions:** three phone compositions with identical content, side by side on wide screens and stacked on narrow screens.
- **A / Focus:** a soft filled session card and quiet underlined library navigation.
- **B / Journal:** an open editorial composition with larger typography and a circular continue arrow.
- **C / Compact:** a smaller outlined session card, segmented library navigation and compact history rows.

## States

The default matches the supplied screenshot's active workout with no logged sets and no history. Controls enables a fictional returning journal or a compact recovery-message proposal. Individual directions support the existing phone and desktop viewport presets.

## Behavior

History and Templates switch local content. Actions display explicit preview feedback rather than claiming a save or opening an incomplete training simulation. All controls support native keyboard activation. Reload resets the preview.

## Examples and limitations

Dates, workout names, durations and logged-set counts are fixed illustrative data. No storage, routing, workout management, error diagnosis or production behavior is connected. The recovery text assumes a failed workout navigation solely to demonstrate placement; real wording must reflect the actual failure. Start a different workout only emits preview feedback; production integration must preserve the single-active-workout rules. Desktop uses a readable single-column expansion, not a proposed replacement for the production desktop navigation.
</docs>
