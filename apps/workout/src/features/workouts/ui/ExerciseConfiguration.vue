<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { BaseButton, BaseInputNumber, BaseSheet, BaseTextarea } from "@form/ui";
import { ArrowLeftRight, List, Plus, StickyNote, Trash2 } from "@lucide/vue";
import { setTargetReps, type Command, type SessionExercise } from "../domain";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import ExerciseCatalog from "./ExerciseCatalog.vue";
import { fmt } from "./presentation";
import { useUnsavedChangesWarning } from "./useUnsavedChangesWarning";
import { useLeaveConfirmation } from "./useLeaveConfirmation";
const { exercise, workspace } = defineProps<{
  exercise: SessionExercise | null;
  workspace: Pick<
    WorkoutWorkspace,
    "active" | "snapshot" | "saving" | "training" | "error"
  >;
}>();
const emit = defineEmits<{
  close: [];
  remove: [exercise: SessionExercise];
  edit: [setId: string];
  add: [];
  replaced: [exerciseId: string];
}>();
type View = "actions" | "configure" | "note" | "replace";
const view = ref<View>("actions");
const count = ref("1"),
  reps = ref("8"),
  weight = ref("0");
const replaceTargets = ref(false),
  note = ref(""),
  selection = ref<string[]>([]);
const issue = ref("");
const exitConfirmation = useLeaveConfirmation();
const dismiss = exitConfirmation.open;
const savePending = ref(false);
const removalOpen = ref(false);
const body = useTemplateRef<HTMLElement>("body");
let revision = 0;
const baseline = ref("");
let replacementFocusId: string | null = null;
const formState = () =>
  JSON.stringify([
    count.value,
    reps.value,
    weight.value,
    replaceTargets.value,
    note.value,
  ]);
const dirty = computed(() =>
  !!exercise && (view.value === "note" || view.value === "configure") && formState() !== baseline.value,
);
useUnsavedChangesWarning(() => dirty.value);
const minimum = computed(() =>
  Math.max(1, exercise?.sets.filter((set) => set.completed).length ?? 1),
);
const remaining = computed(
  () => exercise?.sets.filter((set) => !set.completed) ?? [],
);
const logged = computed(
  () => exercise?.sets.filter((set) => set.completed).length ?? 0,
);
const targets = computed(() =>
  remaining.value.length ? remaining.value : (exercise?.sets ?? []),
);
const sameValue = <T,>(values: T[]) =>
  new Set(values).size === 1 ? values[0] : undefined;
const repsSummary = computed(() => {
  const reps = sameValue(targets.value.map(setTargetReps));
  return reps === undefined ? "Mixed reps" : `${reps} reps`;
});
const weightSummary = computed(() => {
  const weight = sameValue(targets.value.map((set) => set.weightKg));
  return weight === undefined ? "Mixed kg" : `${fmt(weight)} kg`;
});
const catalog = computed(() =>
  Object.values(workspace.snapshot.value?.exercises ?? {}).filter(
    (item) => item.id !== exercise?.exerciseId,
  ),
);
const replacement = computed(() =>
  catalog.value.find((item) => item.id === selection.value[0]),
);
const title = computed(
  () =>
    `${{ actions: "", configure: "Configure ", note: "Note for ", replace: "Replace " }[view.value]}${exercise?.name ?? "Exercise"}`,
);
function reset() {
  const first = remaining.value[0] ?? exercise?.sets[0];
  if (!exercise || !first) return;
  count.value = String(exercise.sets.length);
  reps.value = String(setTargetReps(first));
  weight.value = String(first.weightKg);
  replaceTargets.value = false;
  note.value = exercise.note ?? "";
  selection.value = [];
  revision = workspace.snapshot.value?.revision ?? 0;
  issue.value = "";
  exitConfirmation.settle(false);
  removalOpen.value = false;
  baseline.value = formState();
}
watch(
  () => exercise?.id,
  () => {
    settleExit(false);
    view.value = "actions";
    reset();
  },
);
async function show(next: View, field?: "Target reps" | "Working weight") {
  reset();
  view.value = next;
  if (field) replaceTargets.value = true;
  baseline.value = formState();
  await nextTick();
  const target = field
    ? body.value?.querySelector<HTMLElement>(`[aria-label="${field}"]`)
    : body.value?.querySelector<HTMLElement>("textarea, button, input");
  target?.focus();
}
function settleExit(discard: boolean) {
  if (discard) {
    baseline.value = formState();
    emit("close");
  }
  exitConfirmation.settle(discard);
}
function requestExit(kind: "close" | "leave"): Promise<boolean> {
  if (workspace.saving.value || savePending.value) return Promise.resolve(false);
  if (!dirty.value && !dismiss.value) {
    if (kind === "close") emit("close");
    return Promise.resolve(true);
  }
  return exitConfirmation.request();
}
function close() { void requestExit("close"); }
function requestLeave() { return requestExit("leave"); }
defineExpose({ requestLeave });
async function save(
  command: Extract<
    Command,
    { type: "configure-exercise" | "set-exercise-note" | "replace-exercise" }
  >,
) {
  const priorIds = new Set(
    workspace.active.value?.exercises.map((item) => item.id),
  );
  savePending.value = true;
  try {
    if (await workspace.training.editExercise(command, revision)) {
      if (command.type === "replace-exercise") {
        const added = workspace.active.value?.exercises.find(
          (item) => !priorIds.has(item.id),
        );
        if (added) replacementFocusId = added.id;
      }
      baseline.value = formState();
      emit("close");
      return;
    }
    issue.value =
      workspace.error.value ||
      workspace.training.notice.value ||
      "Could not save. Your input is still here.";
  } finally {
    savePending.value = false;
  }
}
function restoreFocus(event: Event) {
  if (!replacementFocusId) return;
  event.preventDefault();
  const id = replacementFocusId;
  replacementFocusId = null;
  emit("replaced", id);
}
function requestConfiguration() {
  if (exercise && Number(count.value) < exercise.sets.length) {
    removalOpen.value = true;
    return;
  }
  saveConfiguration();
}
function saveConfiguration() {
  removalOpen.value = false;
  if (!exercise || !workspace.active.value) return;
  void save({
    type: "configure-exercise",
    sessionId: workspace.active.value.id,
    exerciseId: exercise.id,
    setCount: Number(count.value),
    ...(replaceTargets.value
      ? { values: { reps: Number(reps.value), weightKg: Number(weight.value) } }
      : {}),
  });
}
function saveNote() {
  if (!exercise || !workspace.active.value) return;
  void save({
    type: "set-exercise-note",
    sessionId: workspace.active.value.id,
    exerciseId: exercise.id,
    note: note.value,
  });
}
function saveReplacement() {
  if (!exercise || !workspace.active.value || !replacement.value) return;
  void save({
    type: "replace-exercise",
    sessionId: workspace.active.value.id,
    exerciseId: exercise.id,
    replacementExerciseId: replacement.value.id,
  });
}
</script>
<template>
  <BaseSheet
    :open="!!exercise || savePending"
    :title="title"
    @close="close"
    @close-auto-focus="restoreFocus"
  >
    <div v-if="exercise" ref="body" class="workout-editor">
      <template v-if="view === 'actions'">
        <div class="exercise-option-targets">
          <BaseButton
            variant="secondary"
            :disabled="workspace.saving.value"
            @click="show('configure')"
            >{{ exercise.sets.length }}
            {{ exercise.sets.length === 1 ? "set" : "sets" }}</BaseButton
          >
          <BaseButton
            variant="secondary"
            :disabled="workspace.saving.value"
            @click="show('configure', 'Target reps')"
            >{{ repsSummary }}</BaseButton
          >
          <BaseButton
            variant="secondary"
            :disabled="workspace.saving.value"
            @click="show('configure', 'Working weight')"
            >{{ weightSummary }}</BaseButton
          >
        </div>
        <div class="exercise-option-group">
        <BaseButton
          variant="secondary"
          :disabled="workspace.saving.value"
          @click="exercise.sets[0] && emit('edit', exercise.sets[0].id)"
          ><List :size="18" />Edit sets</BaseButton
        >
        <BaseButton
          variant="secondary"
          :disabled="workspace.saving.value"
          @click="show('note')"
          ><StickyNote :size="18" />{{
            exercise.note ? "Edit note" : "Add note"
          }}</BaseButton
        >
        </div>
        <div class="exercise-option-group">
        <BaseButton
          variant="secondary"
          :disabled="workspace.saving.value"
          @click="show('replace')"
          ><ArrowLeftRight :size="18" />Replace exercise</BaseButton
        >
        <BaseButton
          variant="secondary"
          :disabled="workspace.saving.value"
          @click="emit('remove', exercise)"
          ><Trash2 :size="18" />Remove exercise</BaseButton
        >
        </div>
        <BaseButton
          variant="ghost"
          :disabled="
            workspace.saving.value ||
            (workspace.active.value?.exercises.length ?? 0) >= 50
          "
          @click="emit('add')"
          ><Plus :size="18" />Add exercises</BaseButton
        >
      </template>
      <template v-else-if="view === 'configure'">
        <label class="field"><span>Number of sets</span>
        <BaseInputNumber
          v-model="count"
          label="Number of sets"
          title="Number of sets"
          :min="minimum"
          :max="30"
          :disabled="workspace.saving.value"
        /></label>
        <label class="workout-config-toggle"
          ><input
            v-model="replaceTargets"
            type="checkbox"
            :disabled="workspace.saving.value"
          />Set weight and reps for all remaining sets</label
        >
        <template v-if="replaceTargets">
          <BaseInputNumber
            v-model="reps"
            label="Target reps"
            title="Target reps"
            :min="1"
            :max="1000"
            :disabled="workspace.saving.value"
          />
          <BaseInputNumber
            v-model="weight"
            label="Working weight"
            title="Working weight"
            unit="kg"
            :min="0"
            :max="1000"
            :decimals="2"
            :preset-step="2.5"
            :disabled="workspace.saving.value"
          />
        </template>
        <p class="muted small">
          Logged sets stay unchanged. Changing only the count preserves
          different targets. Added sets copy the last set’s planned reps and
          weight. Weight includes the bar.
        </p>
        <BaseButton
          :disabled="workspace.saving.value"
          @click="requestConfiguration"
          >Save exercise settings</BaseButton
        >
      </template>
      <template v-else-if="view === 'note'">
        <label class="field"
          ><span>Workout note</span
          ><BaseTextarea
            v-model="note"
            :maxlength="2000"
            :rows="5"
            :disabled="workspace.saving.value"
        /></label>
        <p class="muted small">
          {{ note.length }} / 2000 · Saved with this workout only.
        </p>
        <BaseButton :disabled="workspace.saving.value" @click="saveNote"
          >Save note</BaseButton
        >
      </template>
      <template v-else>
        <template v-if="!remaining.length">
          <p>All sets are logged. Add another exercise to keep training.</p>
          <BaseButton
            :disabled="
              workspace.saving.value ||
              (workspace.active.value?.exercises.length ?? 0) >= 50
            "
            @click="emit('add')"
            >Add exercises</BaseButton
          >
        </template>
        <p
          v-else-if="
            logged && (workspace.active.value?.exercises.length ?? 0) >= 50
          "
        >
          This workout has 50 exercises. Remove an exercise before replacing the
          remaining sets.
        </p>
        <template v-else>
          <ExerciseCatalog
            :exercises="catalog"
            :selected="selection"
            :busy="workspace.saving.value"
            @toggle="selection = selection.includes($event) ? [] : [$event]"
          />
          <template v-if="replacement">
            <p class="muted small">
              {{ remaining.length }} remaining
              {{ remaining.length === 1 ? "set moves" : "sets move" }} to
              {{ replacement.name }} with planned reps and 0 kg.
            </p>
            <p v-if="logged" class="muted small">
              {{ logged }} logged
              {{ logged === 1 ? "set stays" : "sets stay" }} with
              {{ exercise.name }}.
            </p>
            <p v-if="exercise.note" class="muted small">
              The note is not copied to the replacement.
            </p>
          </template>
          <BaseButton
            :disabled="!replacement || workspace.saving.value"
            @click="saveReplacement"
            >Replace remaining sets</BaseButton
          >
        </template>
      </template>
      <p v-if="issue" class="field-error" role="alert">{{ issue }}</p>
      <BaseButton
        v-if="issue"
        variant="secondary"
        :disabled="workspace.saving.value"
        @click="reset"
        >Reload saved values</BaseButton
      >
      <BaseButton
        v-if="view !== 'actions' && !dismiss"
        variant="ghost"
        :disabled="workspace.saving.value"
        @click="close"
        >Cancel</BaseButton
      >
    </div>
  </BaseSheet>
  <BaseSheet
    :open="dismiss"
    title="Discard unsaved changes?"
    description="This deletes your unsaved note or configuration changes. Saved workout values stay unchanged."
    @close="settleExit(false)"
  >
    <div class="form-actions">
      <BaseButton
        variant="secondary"
        :disabled="workspace.saving.value"
        @click="settleExit(false)"
      >
        Keep editing
      </BaseButton>
      <BaseButton
        :disabled="workspace.saving.value"
        @click="settleExit(true)"
      >
        Discard changes
      </BaseButton>
    </div>
  </BaseSheet>
  <BaseSheet
    :open="removalOpen"
    title="Remove unfinished sets?"
    description="Reducing the set count removes unfinished sets and their target values. Logged sets stay in your workout."
    @close="removalOpen = false"
  >
    <div class="form-actions">
      <BaseButton variant="secondary" @click="removalOpen = false">
        Cancel
      </BaseButton>
      <BaseButton
        :disabled="workspace.saving.value"
        @click="saveConfiguration"
      >
        Remove sets
      </BaseButton>
    </div>
  </BaseSheet>
</template>
<style scoped>
.exercise-option-targets {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.exercise-option-targets :deep(button) {
  padding-inline: 8px;
}
.exercise-option-targets :deep(button) {
  border-radius: 18px;
  min-height: 58px;
}
.exercise-option-group {
  display: grid;
  overflow: clip;
  background: var(--surface);
  border-radius: 14px;
}
.exercise-option-group :deep(button) {
  justify-content: flex-start;
  gap: 14px;
  min-height: 52px;
  padding-inline: 18px;
  border: 0;
  border-radius: 0;
  font-size: 16px;
  font-weight: 450;
}
.exercise-option-group :deep(button + button) {
  border-block-start: 1px solid var(--background);
}
.exercise-option-group :deep(button svg) {
  color: var(--muted);
}
</style>
