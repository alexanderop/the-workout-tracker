<script setup lang="ts">
import { computed, ref } from "vue";
import { Sheet } from "@form/ui";
import { Plus, Check, Repeat2, BookmarkPlus } from "@lucide/vue";
import ExerciseCatalog from "./ExerciseCatalog.vue";
import RoutineEditor from "./RoutineEditor.vue";
import type { CompletedSession, Routine } from "../domain";
import { sessionTotals, routineFromSession } from "../domain";
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
const templateSource = ref<CompletedSession | null>(null);
let routineRevision = 0;
const pickerOpen = ref(false);
const selectedExercises = ref<string[]>([]);
const customName = ref("");
const customCategory = ref("Other");
const customEquipment = ref("Other");
const createOpen = ref(false);
function toggleExercise(id: string) {
  selectedExercises.value = selectedExercises.value.includes(id)
    ? selectedExercises.value.filter((value) => value !== id)
    : [...selectedExercises.value, id];
}
function openPicker() {
  selectedExercises.value = [];
  pickerOpen.value = true;
}
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
    if (saved.active.exercises.length === 0) openPicker();
  }
}
function editRoutine(routine: Routine | null) {
  templateSource.value = null;
  editingRoutine.value = routine;
  routineRevision = snapshot.value?.revision ?? 0;
  routineOpen.value = true;
}
async function saveRoutine(routine: Routine) {
  if (await run({ type: "save-routine", routine }, routineRevision)) {
    routineOpen.value = false;
    message.value = "Template saved";
  }
}
async function addExercises() {
  if (!active.value || !selectedExercises.value.length) return;
  const previousCount = active.value.exercises.length;
  const saved = await run({
    type: "add-exercises",
    sessionId: active.value.id,
    exerciseIds: selectedExercises.value,
  });
  if (saved?.active) {
    const first = saved.active.exercises[previousCount];
    if (first) training.selectExercise(first.id);
    pickerOpen.value = false;
    selectedExercises.value = [];
  }
}
async function repeatWorkout(id: string) {
  if (await run({ type: "repeat", completedId: id })) {
    selectedSession.value = null;
    navigate("session");
  }
}
function convertWorkout(id: string) {
  const session = snapshot.value?.completed[id];
  if (!session) return;
  selectedSession.value = null;
  editRoutine(routineFromSession(session, crypto.randomUUID()));
  templateSource.value = session;
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
      equipment: customEquipment.value,
    },
  });
  if (saved) {
    customName.value = "";
    createOpen.value = false;
    if (pickerOpen.value)
      selectedExercises.value = [...selectedExercises.value, id];
  }
}
async function finishWorkout() {
  const id = active.value?.id;
  if (!id) return;
  if (await training.run({ type: "finish", sessionId: id })) {
    finishOpen.value = false;
    navigate("workouts");
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
  openPicker,
  repeatWorkout,
  convertWorkout,
  openCreateExercise: () => {
    createOpen.value = true;
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
    :title="editingRoutine ? 'Edit template' : 'Create template'"
    description="Set up the exercises you want to come back to."
    wide
    @close="routineOpen = false"
    ><RoutineEditor
      v-if="routineOpen"
      :key="editingRoutine?.id ?? 'new'"
      :routine="editingRoutine"
      :source="templateSource"
      :exercises="catalog"
      :busy="saving"
      @save="saveRoutine"
      @cancel="routineOpen = false"
    />
    <p v-if="error" class="field-error" role="alert">{{ error }}</p></Sheet
  >
  <Sheet
    :open="pickerOpen"
    title="Add exercises"
    description="Choose the movements for this workout."
    @close="pickerOpen = false"
  >
    <ExerciseCatalog
      :exercises="catalog"
      :selected="selectedExercises"
      :busy="saving"
      @toggle="toggleExercise"
    />
    <div class="picker-actions">
      <button class="text-button" :disabled="saving" @click="createOpen = true">
        <Plus :size="16" />Create your own</button
      ><button
        class="btn primary full-width"
        :disabled="saving || !selectedExercises.length"
        @click="addExercises"
      >
        Add {{ selectedExercises.length }}
        {{ selectedExercises.length === 1 ? "exercise" : "exercises"
        }}<Check :size="17" />
      </button>
    </div>
    <p v-if="error" class="field-error" role="alert">{{ error }}</p>
  </Sheet>
  <Sheet
    :open="createOpen"
    title="Create exercise"
    description="Add a movement to your personal library."
    @close="createOpen = false"
  >
    <form class="form-stack" @submit.prevent="createExercise">
      <label class="field"
        ><span>Exercise name</span
        ><input
          v-model="customName"
          class="input"
          required
          maxlength="80"
          placeholder="e.g. Cable lateral raise"
      /></label>
      <label class="field"
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
      >
      <label class="field"
        ><span>Equipment</span
        ><select v-model="customEquipment" class="input">
          <option
            v-for="item in [
              'Barbell',
              'Dumbbell',
              'Cable',
              'Machine',
              'Bodyweight',
              'Band',
              'Kettlebell',
              'Other',
            ]"
            :key="item"
          >
            {{ item }}
          </option>
        </select></label
      >
      <button
        class="btn primary full-width"
        type="submit"
        :disabled="saving || !customName.trim()"
      >
        <Plus :size="17" />Create exercise
      </button>
      <p v-if="error" class="field-error" role="alert">{{ error }}</p>
    </form>
  </Sheet>
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
    <div v-if="training.pending.value.length" class="draft-finish-notice">
      <p>
        You have input drafts in {{ training.pending.value.length }} sets. Save
        the values before finishing. This does not log any additional sets.
      </p>
      <button
        class="btn secondary"
        :disabled="saving"
        @click="training.saveEdits()"
      >
        Save input values
      </button>
      <button class="text-button" @click="finishOpen = false">
        Review my sets
      </button>
      <p
        v-if="training.pending.value.some((row) => row.issue)"
        class="field-error"
        role="alert"
      >
        Some values need attention. Return to the highlighted set to review
        them.
      </p>
    </div>
    <p v-if="error" class="field-error" role="alert">{{ error }}</p>
    <div class="form-actions">
      <button
        class="btn secondary"
        :disabled="saving"
        @click="finishOpen = false"
      >
        Keep training</button
      ><button
        class="btn primary"
        :disabled="saving || !!training.pending.value.length"
        @click="finishWorkout"
      >
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
      <div class="detail-actions">
        <button
          class="btn primary"
          :disabled="saving || !!active"
          @click="repeatWorkout(detail.id)"
        >
          <Repeat2 :size="17" />Repeat workout</button
        ><button class="btn secondary" @click="convertWorkout(detail.id)">
          <BookmarkPlus :size="17" />Save as template
        </button>
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
