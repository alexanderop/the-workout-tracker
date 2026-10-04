<script setup lang="ts">
import { useTrainingSession } from "../../../src/features/workouts/ui/useTrainingSession";
import { useWorkouts } from "../../../src/features/workouts/ui/useWorkouts";
import SetRow from "../../../src/features/workouts/ui/SetRow.vue";
import type { Workouts, DraftJournal } from "../../../src/features/workouts";
const props = defineProps<{ workouts: Workouts; drafts: DraftJournal }>();
const { snapshot, saving, run } = useWorkouts(props.workouts);
const training = useTrainingSession({
  snapshot,
  saving,
  run,
  journal: props.drafts,
});
</script>
<template>
  <SetRow
    v-for="row in training.rows.values()"
    :key="row.set.id"
    :row="row"
    :busy="saving"
    :current="training.current.value?.set.id === row.set.id"
    :dirty="training.dirty(row)"
    :conflict="training.conflict(row)"
    @edit="(values) => training.edit(row.set.id, values)"
    @commit="training.commit(row.set.id)"
    @select="training.selected.value = row.set.id"
    @discard="training.useSaved(row.set.id)"
    @keep="training.keepInput(row.set.id)"
  />
  <button @click="training.undo">Undo last log</button>
</template>
