<script setup lang="ts">
import { ref, useId } from "vue";
import { logEvent } from "histoire/client";
import {
  BaseButton,
  BaseMuscleMap,
  type MuscleRegion,
  type MuscleHighlight,
  type MuscleMapView,
} from "@form/ui";
const headingId = useId();
const filterGroup = ref("Legs");
const selected = ref<MuscleRegion | null>(null);
const secondSelected = ref<MuscleRegion | null>(null);
const disabled = ref(false);
const view = ref<MuscleMapView>("both");
const press: readonly MuscleHighlight[] = [
  { muscle: "chest", role: "primary" },
  { muscle: "shoulders", role: "supporting" },
  { muscle: "triceps", role: "supporting" },
];
const legs: readonly MuscleHighlight[] = [
  { muscle: "quads", role: "primary" },
  { muscle: "glutes", role: "primary" },
  { muscle: "hamstrings", role: "supporting" },
  { muscle: "calves", role: "supporting" },
  { muscle: "abs", role: "supporting" },
];
</script>
<template>
  <Story title="02 Components/BaseMuscleMap">
    <Variant title="Exercise · interactive" auto-props-disabled>
      <section class="muscle-map-example">
        <span class="muscle-map-example-eyebrow">EXERCISE FOCUS</span>
        <h3 :id="headingId">Bench press</h3>
        <p>Chest leads this movement. Shoulders and triceps support it.</p>
        <BaseMuscleMap
          v-model="selected"
          :aria-labelledby="headingId"
          :highlights="press"
          :view="view"
          interactive
          :disabled="disabled"
          @update:model-value="
            logEvent('MuscleMap selection', { muscle: $event })
          "
        />
        <footer>
          <span role="status">Selected muscle: {{ selected ?? "None" }}</span>
          <BaseButton type="button" variant="outline" @click="selected = null"
            >Reset selection</BaseButton
          >
        </footer>
      </section>
      <template #controls>
        <HstSelect
          v-model="view"
          title="View"
          :options="['both', 'front', 'back']"
        />
        <HstCheckbox v-model="disabled" title="Disabled" />
      </template>
    </Variant>
    <Variant title="Workout · read-only selection">
      <section class="muscle-map-example">
        <span class="muscle-map-example-eyebrow">WORKOUT REVIEW</span>
        <h3>Lower body day</h3>
        <p>
          The parent selects the supporting hamstrings. Their fill stays
          supporting.
        </p>
        <BaseMuscleMap
          :highlights="legs"
          model-value="hamstrings"
          aria-label="Lower body muscle involvement"
        />
      </section>
    </Variant>
    <Variant title="Illustration · labeled filter cards">
      <div class="muscle-map-example-pair">
        <button
          type="button"
          class="muscle-map-filter-example"
          :aria-pressed="filterGroup === 'Chest'"
          @click="filterGroup = 'Chest'"
        >
          <BaseMuscleMap
            presentation="illustration"
            view="front"
            :highlights="press"
          />
          <span>Chest</span>
        </button>
        <button
          type="button"
          class="muscle-map-filter-example"
          :aria-pressed="filterGroup === 'Legs'"
          @click="filterGroup = 'Legs'"
        >
          <BaseMuscleMap presentation="illustration" :highlights="legs" />
          <span>Legs</span>
        </button>
      </div>
    </Variant>
    <Variant title="Empty · no highlights">
      <section class="muscle-map-example">
        <span class="muscle-map-example-eyebrow">A FRESH START</span>
        <h3>Your next workout</h3>
        <p>Muscle involvement will appear when exercise data is provided.</p>
        <BaseMuscleMap />
      </section>
    </Variant>
    <Variant title="Independent maps · front and back">
      <div class="muscle-map-example-pair">
        <section class="muscle-map-example">
          <h3>Front view</h3>
          <p>Selected muscle: {{ selected ?? "None" }}</p>
          <BaseMuscleMap
            v-model="selected"
            :highlights="press"
            view="front"
            interactive
            aria-label="Choose a front muscle"
          />
        </section>
        <section class="muscle-map-example">
          <h3>Back view</h3>
          <p>Selected muscle: {{ secondSelected ?? "None" }}</p>
          <BaseMuscleMap
            v-model="secondSelected"
            :highlights="legs"
            view="back"
            interactive
            aria-label="Choose a back muscle"
          />
        </section>
      </div>
    </Variant>
  </Story>
</template>
<style scoped>
.muscle-map-filter-example {
  width: 160px;
  padding: 16px;
  color: var(--ui-foreground);
  background: var(--ui-muted);
  border: 2px solid transparent;
  border-radius: 24px;
  font: inherit;
}
.muscle-map-filter-example[aria-pressed="true"] {
  border-color: var(--ui-primary);
}
.muscle-map-filter-example:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 4px;
}
.muscle-map-example {
  width: 100%;
  max-width: 560px;
  padding: 24px;
  box-sizing: border-box;
  color: var(--ui-foreground);
  background: var(--ui-background);
  border: 1px solid var(--ui-border);
  border-radius: 24px;
}
.muscle-map-example-eyebrow {
  color: var(--ui-primary);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
}
.muscle-map-example h3 {
  margin: 8px 0;
  font-size: 23px;
  letter-spacing: -0.035em;
}
.muscle-map-example p,
.muscle-map-example footer {
  color: var(--ui-muted-foreground);
  font-size: 13px;
  line-height: 1.6;
}
.muscle-map-example footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-block-start: 20px;
}
.muscle-map-example-pair {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
</style>
<docs lang="md">
# Muscle Map

## Usage

Import `BaseMuscleMap`, `MuscleHighlight`, `MuscleRegion` and `MuscleMapView` from `@form/ui`. Pass readonly `highlights` records with a `muscle` identifier and a `role` of `primary` or `supporting`. Omitted muscles display as not highlighted. When roles conflict, primary wins regardless of input order. Consumers own headings, cards, exercise metadata and calculations.

```vue
<BaseMuscleMap
  v-model="selectedMuscle"
  :highlights="[{ muscle: 'chest', role: 'primary' }]"
  view="both"
  interactive
  aria-label="Choose a muscle"
/>
```

## Variants

Exercise selection, a read-only lower-body selection, empty data and two independently controlled maps. `view` accepts `front`, `back` or `both` (default). The text list follows the visible geometry and lists shared regions only once. Changing views preserves selection, even when its region becomes hidden.

`presentation="illustration"` renders only decorative figures for a labeled parent card. It hides labels, legend and region controls, including when `interactive` is supplied. The parent must provide the visible label and interaction. The default `full` presentation retains the complete text equivalent.

## States

Primary, supporting, unhighlighted, selected and disabled. Use Controls to change the view and disable selection. The parent reset button demonstrates controlled state. The read-only example outlines a supporting muscle without changing its role. Empty means no supplied involvement, not proof that a muscle was untrained.

## Behavior

Read-only by default. Enable `interactive` and bind standard `v-model` (`modelValue` / `update:modelValue`) for native selection buttons. Selecting a region again clears it. Tab, Enter and Space work with visible focus. `disabled` inhibits user selection but still displays parent updates. Read-only maps never emit selection changes.

The decorative diagrams have a text equivalent listing every visible region and its role. Selection changes only the outline. Map shapes are not touch targets. Native attributes, listeners and classes fall through to the root group with `data-slot="muscle-map"`. Supply `aria-label` or `aria-labelledby` to name it; without either, the fallback is “Muscle map”. Multiple instances own no shared selection state.

## Examples and limitations

All examples use illustrative local data. No workout storage, exercise mapping, set counting, recovery prediction or fatigue model is included. Consumers validate external data before constructing highlights. Numeric coverage is not part of this API. The geometry is schematic, not an anatomical or exercise-technique guide. The component has no card padding, background, heading or fixed maximum width.
</docs>
