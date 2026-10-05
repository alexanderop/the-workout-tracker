<script setup lang="ts">
import { computed, ref } from "vue";
import { BaseInput } from "@form/ui";
import benchPress from "../../assets/exercises/bench-press.png";
import squat from "../../assets/exercises/squat.png";
import deadlift from "../../assets/exercises/deadlift.png";
import shoulderPress from "../../assets/exercises/shoulder-press.png";
import latPulldown from "../../assets/exercises/lat-pulldown.png";
import seatedRow from "../../assets/exercises/seated-row.png";

import overheadPress from "../../assets/exercises/overhead-press.png";
import row from "../../assets/exercises/row.png";
import legPress from "../../assets/exercises/leg-press.png";
import bicepsCurl from "../../assets/exercises/biceps-curl.png";
import tricepsExtension from "../../assets/exercises/triceps-extension.png";
import lateralRaise from "../../assets/exercises/lateral-raise.png";
import inclineBenchPress from "../../assets/exercises/incline-bench-press.png";
import dumbbellBenchPress from "../../assets/exercises/dumbbell-bench-press.png";
import inclineDumbbellPress from "../../assets/exercises/incline-dumbbell-press.png";
import cableFly from "../../assets/exercises/cable-fly.png";
import chestPress from "../../assets/exercises/chest-press.png";
import pecDeck from "../../assets/exercises/pec-deck.png";
import pullUp from "../../assets/exercises/pull-up.png";
import legExtension from "../../assets/exercises/leg-extension.png";
import seatedLegCurl from "../../assets/exercises/seated-leg-curl.png";
import hackSquat from "../../assets/exercises/hack-squat.png";
import hipThrust from "../../assets/exercises/hip-thrust.png";
import standingCalfRaise from "../../assets/exercises/standing-calf-raise.png";
import preacherCurl from "../../assets/exercises/preacher-curl.png";
import abWheelRollout from "../../assets/exercises/ab-wheel-rollout.png";

import declineBenchPress from "../../assets/exercises/decline-bench-press.png";
import chestDip from "../../assets/exercises/chest-dip.png";
import assistedPullUp from "../../assets/exercises/assisted-pull-up.png";
import barbellRow from "../../assets/exercises/barbell-row.png";
import chestSupportedRow from "../../assets/exercises/chest-supported-row.png";
import tBarRow from "../../assets/exercises/t-bar-row.png";
import backExtension from "../../assets/exercises/back-extension.png";
import gobletSquat from "../../assets/exercises/goblet-squat.png";
import bulgarianSplitSquat from "../../assets/exercises/bulgarian-split-squat.png";
import stepUp from "../../assets/exercises/step-up.png";
import lyingLegCurl from "../../assets/exercises/lying-leg-curl.png";
import seatedCalfRaise from "../../assets/exercises/seated-calf-raise.png";
import hipAbduction from "../../assets/exercises/hip-abduction.png";
import facePull from "../../assets/exercises/face-pull.png";
import shoulderPressMachine from "../../assets/exercises/shoulder-press-machine.png";
import hammerCurl from "../../assets/exercises/hammer-curl.png";
import barbellCurl from "../../assets/exercises/barbell-curl.png";
import cableCurl from "../../assets/exercises/cable-curl.png";
import ropeTricepsPushdown from "../../assets/exercises/rope-triceps-pushdown.png";
import skullCrusher from "../../assets/exercises/skull-crusher.png";

const exercises = [
  {
    name: "Bench press",
    muscle: "Chest",
    equipment: "Barbell",
    image: benchPress,
  },
  { name: "Squat", muscle: "Legs", equipment: "Barbell", image: squat },
  {
    name: "Deadlift",
    muscle: "Posterior chain",
    equipment: "Barbell",
    image: deadlift,
  },
  {
    name: "Shoulder press",
    muscle: "Shoulders",
    equipment: "Dumbbells",
    image: shoulderPress,
  },
  {
    name: "Lat pulldown",
    muscle: "Back",
    equipment: "Cable",
    image: latPulldown,
  },
  { name: "Seated row", muscle: "Back", equipment: "Cable", image: seatedRow },
  { name: "Overhead press", muscle: "Shoulders", equipment: "Barbell", image: overheadPress },
  { name: "Dumbbell row", muscle: "Back", equipment: "Dumbbell", image: row },
  { name: "Leg press", muscle: "Legs", equipment: "Machine", image: legPress },
  { name: "Biceps curl", muscle: "Arms", equipment: "Dumbbell", image: bicepsCurl },
  { name: "Triceps extension", muscle: "Arms", equipment: "Cable", image: tricepsExtension },
  { name: "Lateral raise", muscle: "Shoulders", equipment: "Dumbbell", image: lateralRaise },
  { name: "Incline bench press", muscle: "Chest", equipment: "Barbell", image: inclineBenchPress },
  { name: "Dumbbell bench press", muscle: "Chest", equipment: "Dumbbell", image: dumbbellBenchPress },
  { name: "Incline dumbbell press", muscle: "Chest", equipment: "Dumbbell", image: inclineDumbbellPress },
  { name: "Cable fly", muscle: "Chest", equipment: "Cable", image: cableFly },
  { name: "Chest press", muscle: "Chest", equipment: "Machine", image: chestPress },
  { name: "Pec deck", muscle: "Chest", equipment: "Machine", image: pecDeck },
  { name: "Pull-up", muscle: "Back", equipment: "Bodyweight", image: pullUp },
  { name: "Leg extension", muscle: "Legs", equipment: "Machine", image: legExtension },
  { name: "Seated leg curl", muscle: "Legs", equipment: "Machine", image: seatedLegCurl },
  { name: "Hack squat", muscle: "Legs", equipment: "Machine", image: hackSquat },
  { name: "Hip thrust", muscle: "Legs", equipment: "Barbell", image: hipThrust },
  { name: "Standing calf raise", muscle: "Legs", equipment: "Machine", image: standingCalfRaise },
  { name: "Preacher curl", muscle: "Arms", equipment: "Machine", image: preacherCurl },
  { name: "Ab wheel rollout", muscle: "Core", equipment: "Other", image: abWheelRollout },
  { name: "Decline bench press", muscle: "Chest", equipment: "Barbell", image: declineBenchPress },
  { name: "Chest dip", muscle: "Chest", equipment: "Bodyweight", image: chestDip },
  { name: "Assisted pull-up", muscle: "Back", equipment: "Machine", image: assistedPullUp },
  { name: "Barbell row", muscle: "Back", equipment: "Barbell", image: barbellRow },
  { name: "Chest-supported row", muscle: "Back", equipment: "Dumbbell", image: chestSupportedRow },
  { name: "T-bar row", muscle: "Back", equipment: "Machine", image: tBarRow },
  { name: "Back extension", muscle: "Back", equipment: "Bodyweight", image: backExtension },
  { name: "Goblet squat", muscle: "Legs", equipment: "Dumbbell", image: gobletSquat },
  { name: "Bulgarian split squat", muscle: "Legs", equipment: "Dumbbell", image: bulgarianSplitSquat },
  { name: "Step-up", muscle: "Legs", equipment: "Dumbbell", image: stepUp },
  { name: "Lying leg curl", muscle: "Legs", equipment: "Machine", image: lyingLegCurl },
  { name: "Seated calf raise", muscle: "Legs", equipment: "Machine", image: seatedCalfRaise },
  { name: "Hip abduction", muscle: "Legs", equipment: "Machine", image: hipAbduction },
  { name: "Face pull", muscle: "Shoulders", equipment: "Cable", image: facePull },
  { name: "Shoulder press machine", muscle: "Shoulders", equipment: "Machine", image: shoulderPressMachine },
  { name: "Hammer curl", muscle: "Arms", equipment: "Dumbbell", image: hammerCurl },
  { name: "Barbell curl", muscle: "Arms", equipment: "Barbell", image: barbellCurl },
  { name: "Cable curl", muscle: "Arms", equipment: "Cable", image: cableCurl },
  { name: "Rope triceps pushdown", muscle: "Arms", equipment: "Cable", image: ropeTricepsPushdown },
  { name: "Skull crusher", muscle: "Arms", equipment: "Barbell", image: skullCrusher },
];
const search = ref("");
const selected = ref<string[]>([]);
const matches = computed(() =>
  exercises.filter((exercise) =>
    `${exercise.name} ${exercise.muscle} ${exercise.equipment}`
      .toLowerCase()
      .includes(search.value.trim().toLowerCase()),
  ),
);
</script>

<template>
  <Story title="03 Patterns/Exercise imagery">
    <Variant title="Equipment gallery">
      <main class="preview imagery-preview">
        <header class="imagery-header">
          <p class="imagery-eyebrow">Exercise library · Art direction</p>
          <h1>Familiar equipment.<br />A clearer starting point.</h1>
          <p class="note">
            46 equipment illustrations for review. Explore the silhouettes,
            materials and detail at card size.
          </p>
        </header>
        <div class="imagery-grid">
          <figure
            v-for="exercise in exercises"
            :key="exercise.name"
            class="imagery-card"
          >
            <div class="imagery-stage">
              <img :src="exercise.image" alt="" width="320" height="320" />
            </div>
            <figcaption>
              <span class="imagery-meta"
                >{{ exercise.muscle }} · {{ exercise.equipment }}</span
              >
              <h2>{{ exercise.name }}</h2>
            </figcaption>
          </figure>
        </div>
        <p class="note imagery-footer">
          Equipment artwork identifies the exercise setup. It does not
          demonstrate movement or technique.
        </p>
      </main>
    </Variant>
    <Variant title="Exercise picker">
      <main class="preview imagery-picker">
        <header class="imagery-header">
          <p class="imagery-eyebrow">Build your workout</p>
          <h1>Add exercises</h1>
          <p class="note">Choose the movements for your session.</p>
        </header>
        <BaseInput
          v-model="search"
          aria-label="Search exercises"
          placeholder="Search exercises, muscles or equipment"
        />
        <fieldset class="imagery-options">
          <legend class="note">Exercises</legend>
          <label
            v-for="exercise in matches"
            :key="exercise.name"
            class="imagery-option"
            :class="{ 'is-selected': selected.includes(exercise.name) }"
          >
            <img :src="exercise.image" alt="" width="88" height="88" />
            <span class="imagery-option-copy"
              ><strong>{{ exercise.name }}</strong
              ><span class="imagery-meta"
                >{{ exercise.muscle }} · {{ exercise.equipment }}</span
              ></span
            >
            <input v-model="selected" type="checkbox" :value="exercise.name" />
          </label>
          <p v-if="!matches.length" class="note" role="status">
            No exercises found. Try another search.
          </p>
        </fieldset>
        <p class="imagery-selection" role="status">
          {{ selected.length }} selected<span v-if="selected.length">
            · {{ selected.join(", ") }}</span
          >
        </p>
        <p class="note">Preview only. Your selection stays in this example.</p>
      </main>
    </Variant>
  </Story>
</template>

<style scoped>
.imagery-preview {
  max-width: 1160px;
  margin-inline: auto;
}
.imagery-header {
  display: grid;
  gap: 12px;
  margin-bottom: 28px;
  max-width: 580px;
}
.imagery-eyebrow {
  color: var(--ui-primary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.imagery-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.imagery-card {
  border: 1px solid var(--ui-border);
  border-radius: 16px;
  overflow: hidden;
}
.imagery-stage {
  background: var(--ui-secondary);
  aspect-ratio: 1;
}
.imagery-stage img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.imagery-card figcaption {
  display: grid;
  gap: 6px;
  padding: 18px 20px 22px;
}
.imagery-meta {
  color: var(--ui-muted-foreground);
  font-size: 12px;
  line-height: 1.5;
}
.imagery-footer {
  margin-top: 24px;
}
.imagery-picker {
  max-width: 560px;
  margin-inline: auto;
}
.imagery-options {
  display: grid;
  gap: 10px;
  border: 0;
  padding: 0;
  margin: 24px 0;
  min-width: 0;
}
.imagery-options legend {
  margin-bottom: 12px;
}
.imagery-option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 16px 8px 8px;
  border: 1px solid var(--ui-border);
  border-radius: 14px;
  cursor: pointer;
}
.imagery-option:hover,
.imagery-option.is-selected {
  background: var(--ui-secondary);
}
.imagery-option.is-selected {
  border-color: var(--ui-primary);
}
.imagery-option:focus-within {
  outline: 2px solid var(--ui-ring);
  outline-offset: 3px;
}
.imagery-option img {
  flex: 0 0 88px;
  object-fit: contain;
  background: var(--ui-secondary);
  border-radius: 9px;
}
.imagery-option-copy {
  display: grid;
  gap: 5px;
  flex: 1;
}
.imagery-option-copy strong {
  font-size: 14px;
  font-weight: 550;
}
.imagery-option input {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  accent-color: var(--ui-primary);
}
.imagery-selection {
  font-size: 13px;
  margin-bottom: 12px;
}
@media (max-width: 700px) {
  .imagery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 420px) {
  .imagery-preview,
  .imagery-picker {
    padding: 20px 16px;
  }
  .imagery-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<docs lang="md">
# Exercise imagery

## Usage

Review the equipment artwork used in the workout app. The 46 transparent PNGs use dark materials, silver highlights and a three-quarter perspective inspired by the supplied reference.

## Variants

Equipment gallery shows large illustrations. Exercise picker shows compact thumbnails alongside searchable names and native checkboxes.

## States

Unselected, selected, filtered results and no matches. Selection survives filtering within the example.

## Behavior

Search matches exercise, muscle or equipment. Click a row or use Tab and Space to select. Text remains the accessible identity; images are decorative beside their labels.

## Examples and limitations

This is an isolated art-direction pattern with 46 fixed examples, not an app integration or a ranked popularity dataset. Illustrations show equipment, not movement technique. Equipment can be shared by several exercises, so names remain essential. Generated geometry is illustrative rather than a technical equipment specification. No workouts or stored data are changed. Assets and generation prompts live under `src/assets/exercises` in the design-system workspace.
</docs>
