<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";
import { BaseSheet, BaseButton, BaseInput, BaseSelectNative } from "@form/ui";
import { Plus, Check, Repeat2, BookmarkPlus } from "@lucide/vue";
import ExerciseCatalog from "./ExerciseCatalog.vue";
import RoutineEditor from "./RoutineEditor.vue";
import type { CompletedSession, Routine } from "../domain";
import type { RoutineValues } from "../domain/routineDrafts";
import { sessionTotals, routineFromSession } from "../domain";
import type { WorkoutWorkspace, WorkoutPage } from "./useWorkoutWorkspace";
import type { Confirmation } from "./dialogTypes";
import { fmt, longDate, sessionMinutes } from "./presentation";
const { workspace } = defineProps<{
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
} = workspace;
const emit = defineEmits<{
  navigate: [page: WorkoutPage];
  "template-saved": [];
}>();
const navigate = (page: WorkoutPage) => emit("navigate", page);
const optionSetId = ref<string | null>(null);
const optionRow = computed(() =>
  optionSetId.value ? training.rows.get(optionSetId.value) : undefined,
);
function removeOptionSet() {
  const row = optionRow.value;
  if (!row || !active.value) return;
  optionSetId.value = null;
  error.value = "";
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
  if (Number.isInteger(value) && value + amount >= 0 && value + amount <= 1000)
    training.edit(row.set.id, { reps: String(value + amount) });
}

const selectedSession = ref<string | null>(null);
const detail = computed(() =>
  selectedSession.value
    ? snapshot.value?.completed[selectedSession.value]
    : undefined,
);
const routineOpen = ref(false);
const routineEditor = useTemplateRef<InstanceType<typeof RoutineEditor>>("routineEditor");
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
const reviewSetId = ref<string | null>(null);
function reviewSets() {
  const row = training.pending.value[0];
  if (!row || saving.value) return;
  training.selectSet(row.set.id);
  reviewSetId.value = row.set.id;
  finishOpen.value = false;
}
function finishClosed(event: Event) {
  const id = reviewSetId.value;
  if (!id) return;
  event.preventDefault();
  reviewSetId.value = null;
  training.requestReviewFocus(id);
}
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
async function saveRoutine(routine: RoutineValues) {
  const existing = templateSource.value ? null : editingRoutine.value;
  const command = existing
    ? { type: "save-routine" as const, routine: { ...routine, id: existing.id } }
    : { type: "create-routine" as const, routine };
  if (await run(command, routineRevision)) {
    routineOpen.value = false;
    message.value = "Template saved";
    emit("template-saved");
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
  editRoutine(routineFromSession(session, session.id));
  templateSource.value = session;
}
async function createExercise() {
  if (!customName.value.trim() || saving.value) return;
  const previousIds = new Set(Object.keys(snapshot.value?.exercises ?? {}));
  const saved = await run({
    type: "create-exercise",
    exercise: {
      name: customName.value.trim(),
      category: customCategory.value,
      equipment: customEquipment.value,
    },
  });
  if (saved) {
    customName.value = "";
    createOpen.value = false;
    const created = Object.values(saved.exercises).find((exercise) => !previousIds.has(exercise.id));
    if (pickerOpen.value && created)
      selectedExercises.value = [...selectedExercises.value, created.id];
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
    error.value = "";
    confirmation.value = request;
  },
});
</script>

<template>
  <BaseSheet
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
        <BaseButton
          unstyled
          class="btn secondary"
          :disabled="saving || Number(optionRow.reps) <= 0"
          aria-label="Decrease repetitions"
          @click="adjustReps(-1)"
        >
          −</BaseButton
        ><strong>{{ optionRow.reps || "—" }} reps</strong
        ><BaseButton
          unstyled
          class="btn secondary"
          :disabled="saving || Number(optionRow.reps) >= 1000"
          aria-label="Increase repetitions"
          @click="adjustReps(1)"
        >
          +
        </BaseButton>
      </div>
      <BaseButton
        unstyled
        class="btn secondary full-width"
        :disabled="saving || optionRow.exercise.sets.length <= 1"
        @click="removeOptionSet"
      >
        Remove set
      </BaseButton>
    </template>
  </BaseSheet>
  <BaseSheet
    :open="routineOpen"
    :title="
      editingRoutine && !templateSource ? 'Edit template' : 'Create template'
    "
    description="Set up the exercises you want to come back to."
    wide
    @close="routineEditor?.requestClose()"
    ><RoutineEditor
      v-if="routineOpen"
      ref="routineEditor"
      :key="editingRoutine?.id ?? 'new'"
      :routine="editingRoutine"
      :source="templateSource"
      :exercises="catalog"
      :busy="saving"
      @save="saveRoutine"
      @cancel="routineOpen = false"
    />
    <p v-if="error" class="field-error" role="alert">{{ error }}</p></BaseSheet
  >
  <BaseSheet
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
      <BaseButton
        unstyled
        class="text-button"
        :disabled="saving"
        @click="createOpen = true"
      >
        <Plus :size="16" />Create your own</BaseButton
      ><BaseButton
        unstyled
        class="btn primary full-width"
        :disabled="saving || !selectedExercises.length"
        @click="addExercises"
      >
        Add {{ selectedExercises.length }}
        {{ selectedExercises.length === 1 ? "exercise" : "exercises"
        }}<Check :size="17" />
      </BaseButton>
    </div>
    <p v-if="error" class="field-error" role="alert">{{ error }}</p>
  </BaseSheet>
  <BaseSheet
    :open="createOpen"
    title="Create exercise"
    description="Add a movement to your personal library."
    @close="createOpen = false"
  >
    <form class="form-stack" @submit.prevent="createExercise">
      <label class="field"
        ><span>Exercise name</span
        ><BaseInput
          v-model="customName"
          class="input"
          required
          maxlength="80"
          placeholder="e.g. Cable lateral raise"
      /></label>
      <label class="field"
        ><span>Muscle group</span
        ><BaseSelectNative v-model="customCategory" class="input">
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
        </BaseSelectNative></label
      >
      <label class="field"
        ><span>Equipment</span
        ><BaseSelectNative v-model="customEquipment" class="input">
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
        </BaseSelectNative></label
      >
      <BaseButton
        unstyled
        class="btn primary full-width"
        type="submit"
        :disabled="saving || !customName.trim()"
      >
        <Plus :size="17" />Create exercise
      </BaseButton>
      <p v-if="error" class="field-error" role="alert">{{ error }}</p>
    </form>
  </BaseSheet>
  <BaseSheet
    :open="finishOpen"
    title="Finish this workout?"
    description="Only logged sets count toward your progress. Unlogged sets stay in the session record."
    @close="finishOpen = false"
    @close-auto-focus="finishClosed"
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
      <BaseButton
        unstyled
        class="btn secondary"
        :disabled="saving"
        @click="training.saveEdits()"
      >
        Save input values
      </BaseButton>
      <BaseButton unstyled class="text-button" :disabled="saving" @click="reviewSets">
        Review my sets
      </BaseButton>
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
      <BaseButton
        unstyled
        class="btn secondary"
        :disabled="saving"
        @click="finishOpen = false"
      >
        Keep training</BaseButton
      ><BaseButton
        unstyled
        class="btn primary"
        :disabled="saving || !!training.pending.value.length"
        @click="finishWorkout"
      >
        Save workout<Check :size="17" />
      </BaseButton></div
  ></BaseSheet>
  <BaseSheet
    :open="confirmation !== null"
    :title="confirmation?.title ?? 'Confirm'"
    :description="confirmation?.description"
    @close="!saving && (confirmation = null)"
    >
    <p v-if="error" class="field-error" role="alert">{{ error }}</p>
    <div class="form-actions">
      <BaseButton
        unstyled
        class="btn secondary"
        :disabled="saving"
        @click="confirmation = null"
      >
        Cancel</BaseButton
      ><BaseButton
        unstyled
        class="btn primary"
        :disabled="saving"
        @click="confirmAction"
      >
        <span v-if="confirmation?.command.type === 'discard'">
          Discard workout
        </span>
        <span v-else-if="confirmation?.command.type === 'remove-set'">
          Remove set
        </span>
        <span v-else>Remove exercise</span>
      </BaseButton>
    </div></BaseSheet
  >
  <BaseSheet
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
        <BaseButton
          unstyled
          class="btn primary"
          :disabled="saving || !!active"
          @click="repeatWorkout(detail.id)"
        >
          <Repeat2 :size="17" />Repeat workout</BaseButton
        ><BaseButton
          unstyled
          class="btn secondary"
          @click="convertWorkout(detail.id)"
        >
          <BookmarkPlus :size="17" />Save as template
        </BaseButton>
      </div>
      <section
        v-for="exercise in detail.exercises"
        :key="exercise.id"
        class="detail-exercise"
      >
        <h3>{{ exercise.name }}</h3>
        <p v-if="exercise.note" class="exercise-history-note muted small">
          {{ exercise.note }}
        </p>
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
    ></BaseSheet
  >
</template>

<style scoped>
.exercise-history-note {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  margin-block: 12px;
}
</style>
