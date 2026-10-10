<script setup lang="ts">
import { BaseButton } from "@form/ui";
import { useTranslation } from "../../../i18n";
import type { Exercise, SessionExercise, WorkoutSet } from "../domain";
import ExerciseCatalog from "./ExerciseCatalog.vue";
const {
  exercise,
  remaining,
  logged,
  catalog,
  selection,
  replacement,
  busy,
  canAdd,
} = defineProps<{
  exercise: SessionExercise;
  remaining: readonly WorkoutSet[];
  logged: number;
  catalog: readonly Exercise[];
  selection: readonly string[];
  replacement: Exercise | undefined;
  busy: boolean;
  canAdd: boolean;
}>();
const emit = defineEmits<{
  toggle: [id: string];
  add: [];
  save: [];
}>();
const { t } = useTranslation();
</script>
<template>
  <template v-if="!remaining.length">
    <p>{{ t("training.config.allLogged") }}</p>
    <BaseButton :disabled="busy || !canAdd" @click="emit('add')">{{
      t("training.config.addExercises")
    }}</BaseButton>
  </template>
  <p v-else-if="logged && !canAdd">{{ t("training.config.fullWorkout") }}</p>
  <template v-else>
    <ExerciseCatalog
      :exercises="catalog"
      :selected="selection"
      :busy="busy"
      @toggle="emit('toggle', $event)"
    />
    <template v-if="replacement">
      <p class="muted small">
        {{
          t(
            "training.config.moves",
            { replacement: replacement.name },
            remaining.length,
          )
        }}
      </p>
      <p v-if="logged" class="muted small">
        {{ t("training.config.stays", { exercise: exercise.name }, logged) }}
      </p>
      <p v-if="exercise.note" class="muted small">
        {{ t("training.config.noteNotCopied") }}
      </p>
    </template>
    <BaseButton :disabled="!replacement || busy" @click="emit('save')">{{
      t("training.config.replaceRemaining")
    }}</BaseButton>
  </template>
</template>
