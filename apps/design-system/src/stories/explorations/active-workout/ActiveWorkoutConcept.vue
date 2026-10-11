<script setup lang="ts">
import { computed, ref } from "vue";
import { BaseButton } from "@form/ui";
import { ArrowRight, Clock3 } from "@lucide/vue";
import ActiveWorkoutEntryStage from "./ActiveWorkoutEntryStage.vue";
import type { Entry } from "./types";

const { mode } = defineProps<{ mode: "focus" | "overview" | "rhythm" }>();
const exercises = ["Bench press", "Seated row", "Shoulder press"];
function initialEntries(): Entry[][] {
  return [60, 45, 20].map((weight, exercise) =>
    Array.from({ length: 3 }, (_, set) => ({
      weight,
      reps: 8,
      logged: exercise === 0 && set === 0,
    })),
  );
}
const entries = ref(initialEntries());
const selected = ref(0);
const resting = ref(mode === "rhythm");
const last = ref<Entry>();
const notice = ref("");
const sets = computed(() => entries.value[selected.value] ?? []);
const current = computed(() => sets.value.find((set) => !set.logged));
const setNumber = computed(
  () => sets.value.findIndex((set) => !set.logged) + 1,
);
const total = computed(
  () => entries.value.flat().filter((set) => set.logged).length,
);
const valid = computed(
  () =>
    current.value &&
    Number.isFinite(Number(current.value.weight)) &&
    Number(current.value.weight) >= 0 &&
    String(current.value.weight).trim() !== "" &&
    Number.isInteger(Number(current.value.reps)) &&
    Number(current.value.reps) > 0,
);
const heading = computed(
  () =>
    ({
      focus: "One set. Full attention.",
      overview: "Your whole session, in view.",
      rhythm: "Lift. Rest. Repeat.",
    })[mode],
);
function log() {
  if (!current.value || !valid.value) return;
  last.value = current.value;
  current.value.logged = true;
  resting.value = true;
  notice.value = "Set logged in this preview.";
}
function undo() {
  if (!last.value) return;
  last.value.logged = false;
  last.value = undefined;
  resting.value = false;
  notice.value = "Last preview log undone.";
}
function reset() {
  entries.value = initialEntries();
  selected.value = 0;
  resting.value = mode === "rhythm";
  last.value = undefined;
  notice.value = "Preview reset.";
}
function nextExercise() {
  const index = entries.value.findIndex((exercise) =>
    exercise.some((set) => !set.logged),
  );
  if (index < 0) return;
  selected.value = index;
  resting.value = false;
}
</script>

<template>
  <div class="exploration">
    <header class="concept-caption">
      <div>
        <span class="eyebrow">DESIGN EXPLORATION · {{ mode }}</span>
        <h1>{{ heading }}</h1>
      </div>
      <p>Interactive sample · no workout data is saved.</p>
    </header>
    <main class="workout-concept" :class="`concept-${mode}`">
      <header class="session-top">
        <div>
          <p class="eyebrow">SUNDAY SESSION</p>
          <h2>Upper body</h2>
        </div>
        <span class="elapsed"
          ><Clock3 :size="14" aria-hidden="true" /> 18:42</span
        >
      </header>
      <div class="session-progress">
        <span>{{ total }} of 9 sets logged</span><span>3 exercises</span>
      </div>
      <progress :value="total" max="9" aria-label="Logged sets" />

      <nav class="exercise-list" aria-label="Choose exercise">
        <button
          v-for="(name, index) in exercises"
          :key="name"
          :aria-pressed="selected === index"
          @click="selected = index"
        >
          <span class="exercise-number">{{
            String(index + 1).padStart(2, "0")
          }}</span>
          <span
            >{{ name
            }}<small
              >{{ entries[index]?.filter((set) => set.logged).length }} / 3
              logged</small
            ></span
          >
          <ArrowRight
            v-if="mode === 'overview'"
            :size="16"
            aria-hidden="true"
          />
        </button>
      </nav>

      <section
        v-if="resting && mode === 'rhythm'"
        class="rest-stage"
        aria-label="Rest preview"
      >
        <p class="eyebrow">TAKE A BREATH</p>
        <strong>01:30</strong>
        <p>Rest preview · timer paused</p>
        <p>
          Next: {{ exercises[selected] }}<br />{{
            current ? `Set ${setNumber} of 3` : "Choose your next exercise"
          }}
        </p>
        <BaseButton @click="resting = false"
          >Ready for next set <ArrowRight :size="16"
        /></BaseButton>
      </section>

      <ActiveWorkoutEntryStage
        v-else
        :name="exercises[selected] ?? ''"
        :selected="selected"
        :sets="sets"
        :current="current"
        :set-number="setNumber"
        :total="total"
        :valid="!!valid"
        @weight="(value) => current && (current.weight = value)"
        @reps="(value) => current && (current.reps = value)"
        @log="log"
        @next="nextExercise"
      />

      <aside v-if="resting && mode !== 'rhythm'" class="rest-strip">
        <span
          ><Clock3 :size="18" aria-hidden="true" /><strong>01:30</strong> Rest
          preview · paused</span
        >
        <BaseButton variant="secondary" @click="resting = false"
          >End rest</BaseButton
        >
      </aside>
      <footer class="preview-footer">
        <span role="status">{{
          notice || "Sample session — explore freely."
        }}</span
        ><BaseButton v-if="last" variant="ghost" @click="undo"
          >Undo last log</BaseButton
        ><BaseButton variant="ghost" @click="reset">Reset</BaseButton>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.exploration {
  min-height: 100dvh;
  padding: var(--space-7) var(--space-5);
  box-sizing: border-box;
  background: var(--ui-background);
  color: var(--ui-foreground);
}
.concept-caption {
  max-width: 720px;
  margin: 0 auto var(--space-6);
}
.concept-caption h1 {
  font-size: var(--text-xl);
  font-weight: 500;
  letter-spacing: -1px;
  margin: var(--space-2) 0;
}
.concept-caption p,
.preview-footer,
.rest-stage p {
  color: var(--ui-muted-foreground);
  font-size: var(--text-sm);
  line-height: 1.6;
}
.workout-concept {
  max-width: 480px;
  margin: auto;
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  background: var(--ui-background);
}
.session-top,
.session-progress,
.rest-strip,
.rest-strip > span {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
.session-top h2 {
  margin: var(--space-2) 0 var(--space-6);
  font-size: var(--text-xl);
  font-weight: 550;
  letter-spacing: -0.7px;
}
.elapsed {
  display: flex;
  gap: var(--space-1);
  align-items: center;
  color: var(--ui-muted-foreground);
  font-size: var(--text-sm);
}
.eyebrow {
  margin: 0;
  font-size: var(--text-xs);
}
.session-progress {
  font-size: var(--text-xs);
  color: var(--ui-muted-foreground);
}
progress {
  width: 100%;
  height: 4px;
  border: 0;
  display: block;
  margin: var(--space-3) 0 var(--space-6);
  accent-color: var(--ui-primary);
}
progress::-webkit-progress-bar {
  background: var(--ui-secondary);
  border-radius: var(--radius-sm);
}
progress::-webkit-progress-value {
  background: var(--ui-primary);
  border-radius: var(--radius-sm);
}
.exercise-list {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding-bottom: var(--space-3);
}
.exercise-list button {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 0 0 auto;
  background: var(--ui-background);
  color: var(--ui-muted-foreground);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  text-align: left;
  font: inherit;
  font-size: var(--text-sm);
  cursor: pointer;
  min-height: 48px;
}
.exercise-list button[aria-pressed="true"] {
  border-color: var(--ui-primary);
  color: var(--ui-foreground);
}
.exercise-list button:focus-visible {
  outline: 2px solid var(--ui-ring);
  outline-offset: -4px;
}
.exercise-list small {
  display: block;
  margin-top: var(--space-1);
  color: var(--ui-muted-foreground);
  font-size: var(--text-xs);
}
.exercise-number {
  color: var(--ui-primary);
  font-variant-numeric: tabular-nums;
}
.rest-strip {
  flex-wrap: wrap;
  margin-top: var(--space-5);
  border-top: 1px solid var(--ui-border);
  padding-top: var(--space-5);
  font-size: var(--text-xs);
}
.rest-strip > span {
  justify-content: start;
  flex-wrap: wrap;
}
.rest-strip strong {
  color: var(--ui-primary);
  font-size: var(--text-lg);
}
.preview-footer {
  border-top: 1px solid var(--ui-border);
  margin-top: var(--space-6);
  padding-top: var(--space-3);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
}
.preview-footer > span {
  flex: 1 1 100%;
}
.concept-overview .exercise-list {
  display: grid;
  overflow: visible;
}
.concept-overview .exercise-list button > span:nth-child(2) {
  flex: 1;
}
.rest-stage {
  text-align: center;
  padding: var(--space-7) 0 var(--space-3);
}
.rest-stage > strong {
  display: block;
  font-size: clamp(var(--text-3xl), 15vw, var(--text-3xl));
  font-weight: 400;
  letter-spacing: -5px;
  color: var(--ui-primary);
  margin: var(--space-5) 0 0;
  font-variant-numeric: tabular-nums;
}
.rest-stage .ui-button {
  width: 100%;
  margin-top: var(--space-5);
  min-height: 52px;
}
@media (max-width: 480px) {
  .exploration {
    padding: var(--space-5) var(--space-3);
  }
  .concept-caption h1 {
    font-size: var(--text-lg);
  }
  .workout-concept {
    padding: var(--space-5) var(--space-4);
    border-radius: var(--radius-lg);
  }
  .exercise-heading h3 {
    font-size: var(--text-2xl);
  }
  .entry-values {
    gap: var(--space-2);
  }
}
</style>
