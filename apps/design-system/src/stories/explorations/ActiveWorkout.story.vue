<script setup lang="ts">
import ExplorationNotice from "../../ExplorationNotice.vue";
import ActiveWorkoutConcept from "./active-workout/ActiveWorkoutConcept.vue";
</script>

<template>
  <Story title="06 Explorations/Active workout explorations">
    <Variant title="A · Focus" :meta="{ wrapper: false }"
      ><ExplorationNotice />
      <ActiveWorkoutConcept mode="focus" />
    </Variant>
    <Variant title="B · Overview" :meta="{ wrapper: false }"
      ><ExplorationNotice />
      <ActiveWorkoutConcept mode="overview" />
    </Variant>
    <Variant title="C · Rhythm" :meta="{ wrapper: false }"
      ><ExplorationNotice />
      <ActiveWorkoutConcept mode="rhythm" />
    </Variant>
  </Story>
</template>

<docs lang="md">
# Active workout explorations

## Usage

Three proposals for phone use between sets. Compare them at Phone · narrow,
Phone · short, Phone · tall and Desktop. These are ideas, not approved product changes.

## Variants

- **Focus:** one large set editor, a quiet exercise selector and a single logging action. Best for low attention and one-handed entry; reviewing other sets takes more navigation.
- **Overview:** all exercises and their logged sets stay visible above the editor. Best for switching equipment or reviewing the plan; the current action sits lower on small screens.
- **Rhythm:** alternates between entering a set and a prominent rest panel. Best for a steady training cadence; the changing layout may feel less predictable.

Suggested direction: Focus as the default, an expandable Overview, and Rhythm's rest treatment after logging.

## States

Each proposal starts with one of nine sample sets logged. Try numeric editing,
logging, undo, switching exercises, resting and completing all sets. Reset restores the sample.

## Behavior

Confirming a numeric editor changes only the draft. Log set records that draft
in local demo state. Undo removes the last demonstration log. Progress counts
logged sets only. Switching exercises retains their drafts.

## Examples and limitations

No workout storage, real history, automatic timer, finish command, conflict handling,
exercise management or draft recovery is connected. The rest display is a fixed
sample, explicitly labeled. Actual integration would preserve all production safeguards.
The comparison values and workout title are fictional. No changes to the app are implied.
</docs>
