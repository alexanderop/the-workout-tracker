<script setup lang="ts">
import { computed, ref } from "vue";
import { Sheet } from "@form/ui";
import { Search, Dumbbell, Plus, Check } from "@lucide/vue";
import RoutineEditor from "./RoutineEditor.vue";
import type { Routine } from "../domain";
import { sessionTotals } from "../domain";
import type { WorkoutWorkspace, WorkoutPage } from "./useWorkoutWorkspace";
import type { Confirmation } from "./dialogTypes";
import { fmt, longDate, sessionMinutes } from "./presentation";
const props = defineProps<{
  workspace: Pick<
    WorkoutWorkspace,
    | "snapshot"
    | "saving"
    | "message"
    | "error"
    | "run"
    | "training"
    | "active"
    | "catalog"
    | "activeTotals"
    | "elapsed"
  >;
}>();
const {
  snapshot,
  saving,
  message,
  error,
  run,
  training,
  active,
  catalog,
  activeTotals,
  elapsed,
} = props.workspace;
const emit = defineEmits<{ navigate: [page: WorkoutPage] }>();
const navigate = (page: WorkoutPage) => emit("navigate", page);
const optionSetId = ref<string | null>(null);
const optionRow = computed(() =>
  optionSetId.value ? training.rows.get(optionSetId.value) : undefined,
);
function removeOptionSet() {
  const row = optionRow.value;
  if (!row || !active.value) return;
  optionSetId.value = null;
  confirmation.value = {
    title: "Remove set?",
    description: "This removes the set and its draft from your active workout.",
    command: {
      type: "remove-set",
      sessionId: active.value.id,
      exerciseId: row.exercise.id,
      setId: row.set.id,
    },
  };
}
function adjustReps(amount: number) {
  const row = optionRow.value;
  if (!row) return;
  const value = Number(row.reps);
  if (Number.isInteger(value) && value + amount >= 1 && value + amount <= 1000)
    training.edit(row.set.id, { reps: String(value + amount) });
}

const selectedSession = ref<string | null>(null);
const detail = computed(() =>
  selectedSession.value
    ? snapshot.value?.completed[selectedSession.value]
    : undefined,
);
const routineOpen = ref(false);
const editingRoutine = ref<Routine | null>(null);
let routineRevision = 0;
const pickerOpen = ref(false);
const exerciseSearch = ref("");
const customName = ref("");
const customCategory = ref("Other");
const pickerResults = computed(() =>
  catalog.value.filter((ex) =>
    `${ex.name} ${ex.category}`
      .toLowerCase()
      .includes(exerciseSearch.value.toLowerCase()),
  ),
);
const finishOpen = ref(false);
const confirmation = ref<Confirmation | null>(null);
async function startWorkout(routineId: string | null) {
  if (active.value) {
    navigate("session");
    return;
  }
  const saved = await run({ type: "start", routineId });
  if (saved?.active) {
    navigate("session");
    if (saved.active.exercises.length === 0) pickerOpen.value = true;
  }
}
function editRoutine(routine: Routine | null) {
  editingRoutine.value = routine;
  routineRevision = snapshot.value?.revision ?? 0;
  routineOpen.value = true;
}
async function saveRoutine(routine: Routine) {
  if (await run({ type: "save-routine", routine }, routineRevision)) {
    routineOpen.value = false;
    message.value = "Routine saved";
  }
}
async function addExercise(exerciseId: string) {
  if (!active.value) return;
  if (
    await run({ type: "add-exercise", sessionId: active.value.id, exerciseId })
  ) {
    pickerOpen.value = false;
    exerciseSearch.value = "";
  }
}
async function createExercise() {
  if (!customName.value.trim() || saving.value) return;
  const id = crypto.randomUUID();
  const saved = await run({
    type: "save-exercise",
    exercise: {
      id,
      name: customName.value.trim(),
      category: customCategory.value,
      custom: true,
    },
  });
  if (saved) {
    customName.value = "";
    await addExercise(id);
  }
}
async function finishWorkout() {
  const id = active.value?.id;
  if (!id) return;
  if (await training.run({ type: "finish", sessionId: id })) {
    finishOpen.value = false;
    navigate("history");
    selectedSession.value = id;
    message.value = "Workout saved. Another session in the books.";
  }
}
async function confirmAction() {
  if (!confirmation.value) return;
  const command = confirmation.value.command;
  if (await training.run(command)) {
    confirmation.value = null;
    if (command.type === "discard") navigate("workouts");
  }
}
defineExpose({
  startWorkout,
  editRoutine,
  showDetail: (id: string) => {
    selectedSession.value = id;
  },
  openPicker: () => {
    pickerOpen.value = true;
  },
  openFinish: () => {
    finishOpen.value = true;
  },
  showOptions: (id: string) => {
    optionSetId.value = id;
  },
  confirm: (request: Confirmation) => {
    confirmation.value = request;
  },
});
</script>

<template>
  <Sheet
    :open="!!optionRow"
    :title="
      optionRow
        ? `Set ${optionRow.index + 1} of ${optionRow.exercise.name}`
        : 'Set options'
    "
    description="Adjust repetitions or remove this set."
    @close="optionSetId = null"
  >
    <template v-if="optionRow">
      <div class="repetition-adjuster">
        <button
          class="btn secondary"
          :disabled="saving || Number(optionRow.reps) <= 1"
          aria-label="Decrease repetitions"
          @click="adjustReps(-1)"
        >
          −</button
        ><strong>{{ optionRow.reps || "—" }} reps</strong
        ><button
          class="btn secondary"
          :disabled="saving || Number(optionRow.reps) >= 1000"
          aria-label="Increase repetitions"
          @click="adjustReps(1)"
        >
          +
        </button>
      </div>
      <button
        class="btn secondary full-width"
        :disabled="saving || optionRow.exercise.sets.length <= 1"
        @click="removeOptionSet"
      >
        Remove set
      </button>
    </template>
  </Sheet>
  <Sheet
    :open="routineOpen"
    :title="editingRoutine ? 'Edit routine' : 'Create routine'"
    description="Set up the exercises you want to come back to."
    wide
    @close="routineOpen = false"
    ><RoutineEditor
      v-if="routineOpen"
      :key="editingRoutine?.id ?? 'new'"
      :routine="editingRoutine"
      :exercises="catalog"
      :busy="saving"
      @save="saveRoutine"
      @cancel="routineOpen = false"
    />
    <p v-if="error" class="field-error" role="alert">{{ error }}</p></Sheet
  >
  <Sheet
    :open="pickerOpen"
    title="Add exercise"
    description="Choose an exercise or add your own."
    @close="pickerOpen = false"
    ><div class="search-field picker-search">
      <Search :size="18" /><input
        v-model="exerciseSearch"
        aria-label="Search exercises"
        placeholder="Search exercises or muscle groups"
      />
    </div>
    <div class="picker-list">
      <button
        v-for="exercise in pickerResults"
        :key="exercise.id"
        :disabled="saving"
        @click="addExercise(exercise.id)"
      >
        <span class="routine-symbol"><Dumbbell :size="17" /></span
        ><span
          >{{ exercise.name }}<small>{{ exercise.category }}</small></span
        ><Plus :size="18" />
      </button>
      <p v-if="!pickerResults.length" class="muted">
        No exercises found. Add your own below.
      </p>
    </div>
    <form class="custom-exercise" @submit.prevent="createExercise">
      <h3>Create an exercise</h3>
      <label class="field"
        ><span>Exercise name</span
        ><input
          v-model="customName"
          class="input"
          required
          maxlength="80"
          placeholder="e.g. Cable lateral raise" /></label
      ><label class="field"
        ><span>Muscle group</span
        ><select v-model="customCategory" class="input">
          <option
            v-for="group in [
              'Chest',
              'Back',
              'Legs',
              'Shoulders',
              'Arms',
              'Core',
              'Other',
            ]"
            :key="group"
          >
            {{ group }}
          </option>
        </select></label
      ><button
        class="btn secondary full-width"
        type="submit"
        :disabled="saving || !customName.trim()"
      >
        <Plus :size="17" />Create and add exercise
      </button>
    </form>
    <p v-if="error" role="alert">{{ error }}</p></Sheet
  >
  <Sheet
    :open="finishOpen"
    title="Finish this workout?"
    description="Only logged sets count toward your progress. Unlogged sets stay in the session record."
    @close="finishOpen = false"
    ><div class="finish-stats">
      <div>
        <strong>{{ activeTotals.completedSets }}</strong
        ><span>sets logged</span>
      </div>
      <div>
        <strong>{{ fmt(activeTotals.volumeKg) }}</strong
        ><span>kg volume</span>
      </div>
      <div>
        <strong>{{ elapsed }}</strong
        ><span>elapsed</span>
      </div>
    </div>
    <div class="form-actions">
      <button
        class="btn secondary"
        :disabled="saving"
        @click="finishOpen = false"
      >
        Keep training</button
      ><button class="btn primary" :disabled="saving" @click="finishWorkout">
        Save workout<Check :size="17" />
      </button></div
  ></Sheet>
  <Sheet
    :open="confirmation !== null"
    :title="confirmation?.title ?? 'Confirm'"
    :description="confirmation?.description"
    @close="confirmation = null"
    ><div class="form-actions">
      <button
        class="btn secondary"
        :disabled="saving"
        @click="confirmation = null"
      >
        Keep it</button
      ><button class="btn primary" :disabled="saving" @click="confirmAction">
        {{
          confirmation?.command.type === "discard"
            ? "Discard workout"
            : "Remove"
        }}
      </button>
    </div></Sheet
  >
  <Sheet
    :open="!!detail"
    :title="detail?.name ?? 'Workout'"
    :description="detail ? longDate(detail.finishedAt) : ''"
    wide
    @close="selectedSession = null"
    ><template v-if="detail"
      ><div class="finish-stats">
        <div>
          <strong>{{ sessionTotals(detail).completedSets }}</strong
          ><span>sets logged</span>
        </div>
        <div>
          <strong>{{ fmt(sessionTotals(detail).volumeKg) }}</strong
          ><span>kg volume</span>
        </div>
        <div>
          <strong>{{ sessionMinutes(detail) }}</strong
          ><span>minutes</span>
        </div>
      </div>
      <section
        v-for="exercise in detail.exercises"
        :key="exercise.id"
        class="detail-exercise"
      >
        <h3>{{ exercise.name }}</h3>
        <div
          v-for="(set, index) in exercise.sets"
          :key="set.id"
          class="detail-set"
        >
          <span class="muted">Set {{ index + 1 }}</span
          ><span>{{ fmt(set.weightKg) }} kg × {{ set.reps }} reps</span
          ><span class="detail-status"
            ><Check v-if="set.completed" :size="15" />{{
              set.completed ? "Logged" : "Not logged"
            }}</span
          >
        </div>
      </section></template
    ></Sheet
  >
</template>
