<script setup lang="ts">
import WorkoutAppResearchStudy from "./workout-research/WorkoutAppResearchStudy.vue";
import WorkoutAppResearchOverview from "./workout-research/WorkoutAppResearchOverview.vue";
import { references } from "./workout-research/references";
</script>
<template>
  <Story title="03 Patterns/Workout apps · research & designs">
    <Variant id="comparison" title="00 · Compare the ten" :meta="{ wrapper: false }"><WorkoutAppResearchOverview /></Variant>
    <Variant v-for="(reference, index) in references" :id="reference.id" :key="reference.id" :title="`${String(index + 1).padStart(2, '0')} · ${reference.name}`" :meta="{ wrapper: false }"><WorkoutAppResearchStudy :reference="reference" /></Variant>
  </Story>
</template>
<docs lang="md">
# Workout app research and design studies

## Usage

Compare ten source-informed active-workout formats. Start with the comparison
variant, then choose an app. Inspect at 320px, 390px and desktop widths.

## Variants

Strong: compact notebook. Hevy: exercise cards and session metrics.
Fitbod: illustrated exercise detail. JEFIT: collapsible illustration and log/rest console.
StrongLifts: large set circles. Boostcamp: program prescription and effort.
Alpha Progression: distinct suggested and actual values. Nike Training Club: circuit whiteboard.
Freeletics: one movement and prominent reps. Sweat: circuit player and up-next card.

## States

Each starts with one logged set of nine. Edit draft numbers, log, undo, change
exercise, end the paused rest preview, review logged volume or reset.
Logged ledger rows must be undone before editing. Numeric confirmation never logs.

## Behavior

All studies use local sample state. Progress and volume count logged sets only.
The Review button previews current totals, not a real finish/save operation.
Circuit-inspired studies advance exercise order when ending rest. Other studies
stay on the exercise until its sets are complete. The optional effort selector is
illustrative, not a per-set record. No swipe, hold, video or background timer behavior
is claimed. StrongLifts circles use explicit undo instead of repeated-tap decrement.

## Examples and limitations

Research checked 4 October 2026 against linked public product/help pages. The ten
are an editorial selection, not a comparable download ranking. Vendor user,
download and workout counts are different measures and are not ranked against one another.
For scale, Strong's homepage reports millions of users (with inconsistent 3M/5M
copy), Boostcamp reports 1.2M+ users and Alpha Progression's fact sheet reports
5M+ downloads. These are vendor claims, not independent active-user measurements.
Nike, Freeletics and Sweat represent broader guided training rather than direct
strength-journal peers. JEFIT and Freeletics include older interface references;
current installed screens were not verified. Sources and caveats are visible in
every variant. Layouts use our palette and illustration assets, not brand skins.
No production behavior, persistence or domain contract changes are implied.
</docs>
