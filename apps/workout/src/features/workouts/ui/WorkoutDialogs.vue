<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { BaseSheet, BaseButton, BaseInput, BaseSelectNative } from "@form/ui";
import {
  Plus,
  Check,
  Repeat2,
  BookmarkPlus,
  Dumbbell,
  ArrowRight,
} from "@lucide/vue";
import ExerciseCatalog from "./ExerciseCatalog.vue";
import RoutineEditor from "./RoutineEditor.vue";
import CompletedWorkoutEditor from "./CompletedWorkoutEditor.vue";
import type { CompletedSession, Routine } from "../domain";
import {
  compareRoutineBaseline,
  type RoutineValues,
} from "../domain/routineDrafts";
import WorkoutNameRecovery from "./WorkoutNameRecovery.vue";
import { sessionTotals, routineFromSession } from "../domain";
import type { WorkoutWorkspace, WorkoutPage } from "./useWorkoutWorkspace";
import type { Confirmation } from "./dialogTypes";
import { fmt, longDate, sessionMinutes } from "./presentation";
const { workspace, templatesOpen = false } = defineProps<{
  templatesOpen?: boolean;
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
    | "workoutName"
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
  "close-templates": [];
  "template-closed": [event: Event];
}>();
const navigate = (page: WorkoutPage) => emit("navigate", page);
const optionSetId = ref<string | null>(null);
const optionRow = computed(() =>
  optionSetId.value ? training.rows.get(optionSetId.value) : undefined,
);
watch(optionRow, (row) => {
  if (optionSetId.value && !row) optionSetId.value = null;
});
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
const editingCompleted = ref<CompletedSession | null>(null);
const completedEditor =
  useTemplateRef<InstanceType<typeof CompletedWorkoutEditor>>(
    "completedEditor",
  );
function showDetail(id: string) {
  if (editingCompleted.value) {
    completedEditor.value?.requestClose();
    return;
  }
  selectedSession.value = id;
}
async function requestLeave() {
  if (!completedEditor.value) return true;
  const allowed = await completedEditor.value.requestLeave();
  if (allowed) selectedSession.value = null;
  return allowed;
}
function completedSaved() {
  editingCompleted.value = null;
  message.value = "Workout corrections saved";
}
const routineOpen = ref(false);
const templateContent = useTemplateRef<HTMLElement>("templateContent");
const routines = computed(() => Object.values(snapshot.value?.routines ?? {}));
const exercises = computed(() => snapshot.value?.exercises ?? {});
let templateFocus: string | null = null;
async function focusTemplateContent() {
  await nextTick();
  const content = templateContent.value;
  if (routineOpen.value) {
    content
      ?.querySelector<HTMLInputElement>('input[name="routine-name"]')
      ?.focus();
    return;
  }
  const buttons = Array.from(
    content?.querySelectorAll<HTMLButtonElement>("button") ?? [],
  );
  (
    buttons.find((button) => button.dataset.templateId === templateFocus) ??
    buttons[0]
  )?.focus();
}
/** Closes the editor and forgets its target so no stale conflict survives. */
function closeRoutineEditor() {
  routineOpen.value = false;
  editingRoutine.value = null;
  templateSource.value = null;
  routineConflict.value = false;
}
function cancelRoutine() {
  closeRoutineEditor();
  if (templatesOpen) void focusTemplateContent();
}
function closeTemplates() {
  if (routineOpen.value) {
    routineEditor.value?.requestClose();
    return;
  }
  emit("close-templates");
}
watch(
  () => templatesOpen,
  (open, wasOpen) => {
    if (!open && wasOpen && routineOpen.value)
      routineEditor.value?.requestClose();
  },
);
const routineEditor =
  useTemplateRef<InstanceType<typeof RoutineEditor>>("routineEditor");
const editingRoutine = ref<Routine | null>(null);
const templateSource = ref<CompletedSession | null>(null);
const routineEditorVersion = ref(0);
const routineConflict = ref(false);
const routineState = computed(() =>
  editingRoutine.value && !templateSource.value
    ? compareRoutineBaseline(
        editingRoutine.value,
        snapshot.value?.routines[editingRoutine.value.id],
      )
    : "unchanged",
);
const picker = ref<
  { kind: "start" } | { kind: "add"; sessionId: string } | null
>(null);
const pickerOpen = computed(() => picker.value !== null);
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
  if (!active.value) return;
  picker.value = { kind: "add", sessionId: active.value.id };
}
const finishSessionId = ref<string | null>(null);
const finishOpen = computed(() => finishSessionId.value !== null);
watch(
  () => active.value?.id,
  (id) => {
    if (finishSessionId.value !== id) finishSessionId.value = null;
  },
  { flush: "sync" },
);
const reviewSetId = ref<string | null>(null);
function reviewSets() {
  const row = training.pending.value[0];
  if (!row || saving.value) return;
  training.selectSet(row.set.id);
  reviewSetId.value = row.set.id;
  finishSessionId.value = null;
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
  if (routineId === null) {
    selectedExercises.value = [];
    picker.value = { kind: "start" };
    return;
  }
  const saved = await run({ type: "start", routineId });
  if (saved?.active) {
    navigate("session");
  }
}
function editRoutine(
  routine: Routine | null,
  source: CompletedSession | null = null,
) {
  templateSource.value = source;
  editingRoutine.value = routine;
  routineConflict.value = false;
  routineEditorVersion.value++;
  error.value = "";
  routineOpen.value = true;
  templateFocus = routine?.id ?? null;
  void focusTemplateContent();
}
async function saveRoutine(routine: RoutineValues) {
  if (saving.value) return;
  const existing = templateSource.value ? null : editingRoutine.value;
  if (routineState.value !== "unchanged") {
    routineConflict.value = true;
    return;
  }
  const command = existing
    ? {
        type: "save-routine" as const,
        routine: { ...routine, id: existing.id },
      }
    : { type: "create-routine" as const, routine };
  if (await run(command, snapshot.value?.revision ?? 0)) {
    closeRoutineEditor();
    templateFocus = existing?.id ?? null;
    void focusTemplateContent();
    message.value = "Template saved";
    emit("template-saved");
  }
}
function useSavedRoutine() {
  const saved =
    editingRoutine.value && snapshot.value?.routines[editingRoutine.value.id];
  if (!saved || saving.value) return;
  editingRoutine.value = saved;
  routineConflict.value = false;
  routineEditorVersion.value++;
  error.value = "";
  void focusTemplateContent();
}
function keepRoutineChanges() {
  const saved =
    editingRoutine.value && snapshot.value?.routines[editingRoutine.value.id];
  if (!saved || saving.value) return;
  editingRoutine.value = saved;
  routineConflict.value = false;
  error.value = "";
  routineEditor.value?.save();
}
function closePicker() {
  if (saving.value) return;
  picker.value = null;
  selectedExercises.value = [];
}
async function addExercises() {
  const intent = picker.value;
  if (!intent || !selectedExercises.value.length || saving.value) return;
  const previousIds = new Set(
    active.value?.exercises.map((exercise) => exercise.id),
  );
  const command =
    intent.kind === "start"
      ? {
          type: "start-selected" as const,
          exerciseIds: selectedExercises.value,
        }
      : {
          type: "add-exercises" as const,
          sessionId: intent.sessionId,
          exerciseIds: selectedExercises.value,
        };
  const saved = await run(command);
  if (!saved?.active) return;
  const first = saved.active.exercises.find(
    (exercise) => !previousIds.has(exercise.id),
  );
  if (first) training.selectExercise(first.id);
  picker.value = null;
  selectedExercises.value = [];
  if (intent.kind === "start") navigate("session");
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
  editRoutine(routineFromSession(session, session.id), session);
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
    const created = Object.values(saved.exercises).find(
      (exercise) => !previousIds.has(exercise.id),
    );
    if (pickerOpen.value && created)
      selectedExercises.value = [...selectedExercises.value, created.id];
  }
}
async function finishWorkout() {
  const id = finishSessionId.value;
  if (!id || active.value?.id !== id) {
    finishSessionId.value = null;
    return;
  }
  if (workspace.workoutName.dirty.value) return;
  if (await training.run({ type: "finish", sessionId: id })) {
    finishSessionId.value = null;
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
  requestLeave,
  startWorkout,
  editRoutine,
  showDetail,
  openPicker,
  repeatWorkout,
  convertWorkout,
  openCreateExercise: () => {
    createOpen.value = true;
  },
  openFinish: () => {
    if (!active.value || workspace.workoutName.dirty.value) return;
    finishSessionId.value = active.value.id;
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
  <WorkoutNameRecovery :controller="workspace.workoutName" />
  <BaseSheet
    :open="!!optionRow"
    :title="
      optionRow
        ? `Set ${optionRow.index + 1} of ${optionRow.exercise.name}`
        : 'Set options'
    "
    description="Adjust repetitions, undo logging or remove this set."
    @close="optionSetId = null"
  >
    <template v-if="optionRow">
      <BaseButton
        v-if="optionRow.set.completed"
        variant="secondary"
        :disabled="saving || optionRow.touched"
        @click="training.undoSet(optionRow.set.id)"
        >Undo log</BaseButton
      >
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
    :open="routineOpen || templatesOpen"
    :title="
      routineOpen
        ? editingRoutine && !templateSource
          ? 'Edit template'
          : 'Create template'
        : 'Templates'
    "
    description="Set up the exercises you want to come back to."
    wide
    @close="closeTemplates"
    @close-auto-focus="emit('template-closed', $event)"
    ><div ref="templateContent">
      <RoutineEditor
        v-if="routineOpen"
        ref="routineEditor"
        :key="routineEditorVersion"
        :routine="editingRoutine"
        :source="templateSource"
        :exercises="catalog"
        :busy="saving"
        @save="saveRoutine"
        @cancel="cancelRoutine"
      />
      <div v-if="routineOpen && routineConflict" class="draft-finish-notice">
        <p role="alert">
          {{
            routineState === "deleted"
              ? "This template was deleted in another tab. Your input is still here, but it cannot be saved to the deleted template."
              : "This template changed in another tab. Your input is still here. Choose which version to keep."
          }}
        </p>
        <div v-if="routineState !== 'deleted'" class="form-actions">
          <BaseButton
            variant="secondary"
            :disabled="saving"
            @click="useSavedRoutine"
            >Use saved version</BaseButton
          >
          <BaseButton :disabled="saving" @click="keepRoutineChanges"
            >Keep my changes</BaseButton
          >
        </div>
      </div>
      <template v-if="!routineOpen">
        <BaseButton
          v-if="routines.length"
          unstyled
          class="btn secondary"
          @click="editRoutine(null)"
          ><Plus :size="17" />New template</BaseButton
        >
        <div v-if="!routines.length" class="overview-empty">
          <BookmarkPlus :size="26" />
          <h2>Your shortcuts to the next session</h2>
          <p class="muted">
            Save a past workout as a template, or create one with your favorite
            exercises.
          </p>
          <BaseButton unstyled class="btn secondary" @click="editRoutine(null)">
            <Plus :size="17" />Create template
          </BaseButton>
        </div>
        <div v-else class="routine-grid">
          <article
            v-for="routine in routines"
            :key="routine.id"
            class="routine-card panel"
          >
            <header>
              <span class="routine-symbol"><Dumbbell :size="20" /></span
              ><BaseButton
                unstyled
                class="text-button"
                :aria-label="`Edit ${routine.name}`"
                :data-template-id="routine.id"
                @click="editRoutine(routine)"
              >
                Edit
              </BaseButton>
            </header>
            <h2>{{ routine.name }}</h2>
            <p class="muted small routine-description">
              {{ routine.description || "A plan for your next session." }}
            </p>
            <ul class="exercise-preview">
              <li
                v-for="(entry, index) in routine.exercises.slice(0, 4)"
                :key="index"
              >
                <span>{{ exercises[entry.exerciseId]?.name }}</span
                ><span class="muted"
                  >{{ entry.sets.length }}
                  {{ entry.sets.length === 1 ? "set" : "sets" }}</span
                >
              </li>
              <li v-if="routine.exercises.length > 4" class="muted">
                + {{ routine.exercises.length - 4 }} more
              </li>
            </ul>
            <footer>
              <span class="muted small"
                >{{ routine.exercises.length }} exercises</span
              ><BaseButton
                unstyled
                class="btn secondary"
                :disabled="saving || !!active"
                :aria-label="`Start ${routine.name}`"
                @click="startWorkout(routine.id)"
              >
                Start<ArrowRight :size="16" />
              </BaseButton>
            </footer>
          </article>
        </div>
      </template>
    </div>
    <p v-if="error" class="field-error" role="alert">{{ error }}</p></BaseSheet
  >
  <BaseSheet
    :open="pickerOpen"
    :title="picker?.kind === 'start' ? 'Select exercises' : 'Add exercises'"
    description="Choose the movements for this workout."
    @close="closePicker"
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
        {{ picker?.kind === "start" ? "Start" : "Add" }} ({{
          selectedExercises.length
        }})<Check :size="17" />
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
    @close="finishSessionId = null"
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
        Your input is retained on this device but has not been applied to the
        workout. Apply it before finishing, or review your sets to change or
        discard it. Applying values does not log additional sets.
      </p>
      <ul aria-label="Sets with retained input">
        <li v-for="row in training.pending.value" :key="row.set.id">
          {{ row.exercise.name }} · Set {{ row.index + 1 }}
        </li>
      </ul>
      <BaseButton
        unstyled
        class="btn secondary"
        :disabled="saving"
        @click="training.saveEdits()"
      >
        Apply input values
      </BaseButton>
      <BaseButton
        unstyled
        class="text-button"
        :disabled="saving"
        @click="reviewSets"
      >
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
        @click="finishSessionId = null"
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
    :open="!!detail && !editingCompleted"
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
      </section>
      <div class="detail-actions">
        <BaseButton
          variant="secondary"
          :disabled="saving"
          @click="editingCompleted = detail"
          >Edit workout</BaseButton
        >
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
    </template></BaseSheet
  >
  <CompletedWorkoutEditor
    v-if="editingCompleted"
    ref="completedEditor"
    :session="editingCompleted"
    :workspace="workspace"
    @close="editingCompleted = null"
    @saved="completedSaved"
  />
</template>

<style scoped>
.exercise-history-note {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  margin-block: 12px;
}
</style>
