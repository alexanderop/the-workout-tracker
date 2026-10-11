<script setup lang="ts">
import ExplorationNotice from "../../ExplorationNotice.vue";
import { computed, ref } from "vue";
import { BaseInput } from "@form/ui";
import { exercises } from "./exercise-imagery/exercises";

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
  <Story title="06 Explorations/Exercise imagery">
    <Variant title="Equipment gallery"
      ><ExplorationNotice />
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
    <Variant title="Exercise picker"
      ><ExplorationNotice />
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
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  max-width: 580px;
}
.imagery-eyebrow {
  color: var(--ui-primary);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.imagery-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}
.imagery-card {
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-lg);
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
  gap: var(--space-1);
  padding: var(--space-4) var(--space-5) var(--space-5);
}
.imagery-meta {
  color: var(--ui-muted-foreground);
  font-size: var(--text-sm);
  line-height: 1.5;
}
.imagery-footer {
  margin-top: var(--space-6);
}
.imagery-picker {
  max-width: 560px;
  margin-inline: auto;
}
.imagery-options {
  display: grid;
  gap: var(--space-2);
  border: 0;
  padding: 0;
  margin: var(--space-6) 0;
  min-width: 0;
}
.imagery-options legend {
  margin-bottom: var(--space-3);
}
.imagery-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4) var(--space-2) var(--space-2);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-lg);
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
  border-radius: var(--radius-md);
}
.imagery-option-copy {
  display: grid;
  gap: var(--space-1);
  flex: 1;
}
.imagery-option-copy strong {
  font-size: var(--text-sm);
  font-weight: 550;
}
.imagery-option input {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  accent-color: var(--ui-primary);
}
.imagery-selection {
  font-size: var(--text-sm);
  margin-bottom: var(--space-3);
}
@media (max-width: 700px) {
  .imagery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 420px) {
  .imagery-preview,
  .imagery-picker {
    padding: var(--space-5) var(--space-4);
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
