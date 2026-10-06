<script setup lang="ts">
import ExplorationNotice from "../../ExplorationNotice.vue";
import StrongLiftsPrototype from "./stronglifts/StrongLiftsPrototype.vue";
</script>
<template>
  <Story title="06 Explorations/StrongLifts · interactive prototype">
    <Variant id="fresh" title="01 · Start a workout" :meta="{ wrapper: false }"><ExplorationNotice /><StrongLiftsPrototype scenario="fresh" /></Variant>
    <Variant id="training" title="02 · Mid-workout" :meta="{ wrapper: false }"><ExplorationNotice /><StrongLiftsPrototype scenario="training" /></Variant>
    <Variant id="missed" title="03 · Missed reps" :meta="{ wrapper: false }"><ExplorationNotice /><StrongLiftsPrototype scenario="missed" /></Variant>
    <Variant id="complete" title="04 · All exercises completed" :meta="{ wrapper: false }"><ExplorationNotice /><StrongLiftsPrototype scenario="complete" /></Variant>
    <Variant id="empty" title="05 · Build from empty" :meta="{ wrapper: false }"><ExplorationNotice /><StrongLiftsPrototype scenario="empty" /></Variant>
  </Story>
</template>
<docs lang="md">
# StrongLifts interaction study

## Usage

Try a complete sample workout in our palette. Tap circles to record their target reps;
repeat taps reduce the count to zero. Hold, right-click, press E on a focused
circle, or choose Edit sets for corrections. Zero is logged, blank is skipped.

## Variants and states

Fresh, mid-workout, missed reps and complete variants use a 15-set sample.
An empty variant lets you build a session. Add exercise uses an isolated sample
library and opens configuration for set count, target reps and weight. New
exercises start with editable 3 × 8 sample values. Set count ranges from 1–20,
with a minimum equal to the number already logged; removing planned sets never
removes logged work. Added circles wrap in rows of five. Fully logged exercises
move below unfinished work into collapsible Completed rows. Clearing a completed
set returns its exercise to the active list. All-complete exposes a finish action;
adding another exercise reopens the active list. Before the first logged set, the header shows only the exercise count.
Once logging begins, progress uses the current set total. Seeded
states have no running timer until a new set is logged. Reset restores the seed.
Normal rest targets are 3 minutes after success and 5 after missed reps.
Fast preview uses 6 / 10 seconds. Correcting the latest set changes its rest
target from the original start, without restarting elapsed rest.

## Behavior and limitations

Unlogged set editing changes its planned weight and target reps only. Completed reps (including
above the target) can be corrected after logging. Exercise weight changes affect
unlogged sets only. Clear explicitly removes a log. Finish confirms skipped sets.
All complete can finish directly. No data is saved or added to the workout app.

## Evidence

Official logging, timer, weight-editing documentation and marketing screenshots
were checked on 4 October 2026; links and interpretation boundaries appear in
this prototype. This is not a pixel-identical recreation of an installed app.
The initial ten-app comparison keeps its simpler explicit-undo circle concept;
this dedicated study reproduces repeated-tap correction instead.
</docs>
