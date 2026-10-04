<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Button, NumericInput, Sheet } from "@form/ui";
import { setTargetReps, type SessionExercise } from "../domain";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
const { exercise, workspace } = defineProps<{
  exercise: SessionExercise | null;
  workspace: Pick<
    WorkoutWorkspace,
    "active" | "snapshot" | "saving" | "training" | "error"
  >;
}>();
const emit = defineEmits<{ close: []; remove: [exercise: SessionExercise] }>();
const count = ref("1"),
  reps = ref("8"),
  weight = ref("0"),
  replace = ref(false),
  issue = ref("");
let revision = 0;
watch(
  () => exercise?.id,
  () => {
    if (!exercise) return;
    const first =
      exercise.sets.find((set) => !set.completed) ?? exercise.sets[0]!;
    count.value = String(exercise.sets.length);
    reps.value = String(setTargetReps(first));
    weight.value = String(first.weightKg);
    replace.value = false;
    issue.value = "";
    revision = workspace.snapshot.value?.revision ?? 0;
  },
);
const minimum = computed(() =>
  Math.max(1, exercise?.sets.filter((set) => set.completed).length ?? 1),
);
async function save() {
  const active = workspace.active.value;
  if (!exercise || !active) return;
  const saved = await workspace.training.configureExercise(
    {
      type: "configure-exercise",
      sessionId: active.id,
      exerciseId: exercise.id,
      setCount: Number(count.value),
      ...(replace.value
        ? {
            values: {
              reps: Number(reps.value),
              weightKg: Number(weight.value),
            },
          }
        : {}),
    },
    revision,
  );
  if (saved) {
    emit("close");
    return;
  }
  issue.value =
    workspace.error.value ||
    workspace.training.notice.value ||
    "Could not save this configuration. Close and reopen it to review the latest values.";
}
</script>
<template>
  <Sheet
    :open="!!exercise"
    :title="exercise ? `Configure ${exercise.name}` : 'Configure exercise'"
    description="Change the remaining work. Logged sets stay unchanged."
    @close="emit('close')"
  >
    <div class="workout-editor">
      <NumericInput
        v-model="count"
        label="Number of sets"
        title="Number of sets"
        :min="minimum"
        :max="30"
        :disabled="workspace.saving.value"
      />
      <label class="workout-config-toggle"
        ><input
          v-model="replace"
          type="checkbox"
          :disabled="workspace.saving.value"
        />
        Set weight and reps for all remaining sets</label
      >
      <template v-if="replace"
        ><NumericInput
          v-model="reps"
          label="Target reps"
          title="Target reps"
          :min="1"
          :disabled="workspace.saving.value" /><NumericInput
          v-model="weight"
          label="Working weight"
          title="Working weight"
          unit="kg"
          :decimals="2"
          :preset-step="2.5"
          :disabled="workspace.saving.value"
      /></template>
      <p class="muted small">
        Changing only the count preserves different targets. Added sets copy the
        last set’s planned reps and weight. Removing sets never removes logged
        work. Weight includes the bar.
      </p>
      <p v-if="issue" class="field-error" role="alert">{{ issue }}</p>
      <Button :disabled="workspace.saving.value" @click="save"
        >Save exercise settings</Button
      >
      <Button
        v-if="exercise"
        variant="ghost"
        :disabled="workspace.saving.value"
        @click="emit('remove', exercise)"
        >Remove exercise</Button
      >
    </div>
  </Sheet>
</template>
