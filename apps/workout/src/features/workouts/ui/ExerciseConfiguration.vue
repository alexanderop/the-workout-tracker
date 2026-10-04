<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { Button, NumericInput, Sheet, Textarea } from "@form/ui";
import { ArrowLeftRight, List, Plus, StickyNote, Trash2 } from "@lucide/vue";
import { setTargetReps, type Command, type SessionExercise } from "../domain";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import ExerciseCatalog from "./ExerciseCatalog.vue";
import { fmt } from "./presentation";
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
const issue = ref(""),
  dismiss = ref(false);
const savePending = ref(false);
const body = useTemplateRef<HTMLElement>("body");
let revision = 0;
let baseline = "";
let replacementFocusId: string | null = null;
const formState = () =>
  JSON.stringify([
    count.value,
    reps.value,
    weight.value,
    replaceTargets.value,
    note.value,
  ]);
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
const repsSummary = computed(() =>
  new Set(targets.value.map(setTargetReps)).size === 1
    ? `${setTargetReps(targets.value[0]!)} reps`
    : "Mixed reps",
);
const weightSummary = computed(() =>
  new Set(targets.value.map((set) => set.weightKg)).size === 1
    ? `${fmt(targets.value[0]!.weightKg)} kg`
    : "Mixed kg",
);
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
  if (!exercise) return;
  const first = remaining.value[0] ?? exercise.sets[0]!;
  count.value = String(exercise.sets.length);
  reps.value = String(setTargetReps(first));
  weight.value = String(first.weightKg);
  replaceTargets.value = false;
  note.value = exercise.note ?? "";
  selection.value = [];
  revision = workspace.snapshot.value?.revision ?? 0;
  issue.value = "";
  dismiss.value = false;
  baseline = formState();
}
watch(
  () => exercise?.id,
  () => {
    view.value = "actions";
    reset();
  },
);
async function show(next: View, field?: "Target reps" | "Working weight") {
  reset();
  view.value = next;
  if (field) replaceTargets.value = true;
  baseline = formState();
  await nextTick();
  const target = field
    ? body.value?.querySelector<HTMLElement>(`[aria-label="${field}"]`)
    : body.value?.querySelector<HTMLElement>("textarea, button, input");
  target?.focus();
}
function close() {
  if (workspace.saving.value) return;
  if (
    (view.value === "note" || view.value === "configure") &&
    formState() !== baseline
  ) {
    dismiss.value = true;
    return;
  }
  emit("close");
}
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
function saveConfiguration() {
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
  <Sheet
    :open="!!exercise || savePending"
    :title="title"
    @close="close"
    @close-auto-focus="restoreFocus"
  >
    <div v-if="exercise" ref="body" class="workout-editor">
      <template v-if="dismiss">
        <p>Discard unsaved changes?</p>
        <Button :disabled="workspace.saving.value" @click="dismiss = false"
          >Keep editing</Button
        >
        <Button
          variant="secondary"
          :disabled="workspace.saving.value"
          @click="emit('close')"
          >Discard changes</Button
        >
      </template>
      <template v-else-if="view === 'actions'">
        <div class="exercise-option-targets">
          <Button
            variant="secondary"
            :disabled="workspace.saving.value"
            @click="show('configure')"
            >{{ exercise.sets.length }}
            {{ exercise.sets.length === 1 ? "set" : "sets" }}</Button
          >
          <Button
            variant="secondary"
            :disabled="workspace.saving.value"
            @click="show('configure', 'Target reps')"
            >{{ repsSummary }}</Button
          >
          <Button
            variant="secondary"
            :disabled="workspace.saving.value"
            @click="show('configure', 'Working weight')"
            >{{ weightSummary }}</Button
          >
        </div>
        <div class="exercise-option-group">
        <Button
          variant="secondary"
          :disabled="workspace.saving.value"
          @click="emit('edit', exercise.sets[0]!.id)"
          ><List :size="18" />Edit sets</Button
        >
        <Button
          variant="secondary"
          :disabled="workspace.saving.value"
          @click="show('note')"
          ><StickyNote :size="18" />{{
            exercise.note ? "Edit note" : "Add note"
          }}</Button
        >
        </div>
        <div class="exercise-option-group">
        <Button
          variant="secondary"
          :disabled="workspace.saving.value"
          @click="show('replace')"
          ><ArrowLeftRight :size="18" />Replace exercise</Button
        >
        <Button
          variant="secondary"
          :disabled="workspace.saving.value"
          @click="emit('remove', exercise)"
          ><Trash2 :size="18" />Remove exercise</Button
        >
        </div>
        <Button
          variant="ghost"
          :disabled="
            workspace.saving.value ||
            (workspace.active.value?.exercises.length ?? 0) >= 50
          "
          @click="emit('add')"
          ><Plus :size="18" />Add exercises</Button
        >
      </template>
      <template v-else-if="view === 'configure'">
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
            v-model="replaceTargets"
            type="checkbox"
            :disabled="workspace.saving.value"
          />Set weight and reps for all remaining sets</label
        >
        <template v-if="replaceTargets">
          <NumericInput
            v-model="reps"
            label="Target reps"
            title="Target reps"
            :min="1"
            :max="1000"
            :disabled="workspace.saving.value"
          />
          <NumericInput
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
        <Button
          :disabled="workspace.saving.value"
          @click="saveConfiguration"
          >Save exercise settings</Button
        >
      </template>
      <template v-else-if="view === 'note'">
        <label class="field"
          ><span>Workout note</span
          ><Textarea
            v-model="note"
            :maxlength="2000"
            :rows="5"
            :disabled="workspace.saving.value"
        /></label>
        <p class="muted small">
          {{ note.length }} / 2000 · Saved with this workout only.
        </p>
        <Button :disabled="workspace.saving.value" @click="saveNote"
          >Save note</Button
        >
      </template>
      <template v-else>
        <template v-if="!remaining.length">
          <p>All sets are logged. Add another exercise to keep training.</p>
          <Button
            :disabled="
              workspace.saving.value ||
              (workspace.active.value?.exercises.length ?? 0) >= 50
            "
            @click="emit('add')"
            >Add exercises</Button
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
            @toggle="selection = [$event]"
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
          <Button
            :disabled="!replacement || workspace.saving.value"
            @click="saveReplacement"
            >Replace remaining sets</Button
          >
        </template>
      </template>
      <p v-if="issue" class="field-error" role="alert">{{ issue }}</p>
      <Button
        v-if="issue"
        variant="secondary"
        :disabled="workspace.saving.value"
        @click="reset"
        >Reload saved values</Button
      >
      <Button
        v-if="view !== 'actions' && !dismiss"
        variant="ghost"
        :disabled="workspace.saving.value"
        @click="close"
        >Cancel</Button
      >
    </div>
  </Sheet>
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
  overflow: hidden;
  background: var(--surface);
  border-radius: 20px;
}
.exercise-option-group :deep(button) {
  justify-content: flex-start;
  min-height: 64px;
  padding-inline: 20px;
  border: 0;
  border-radius: 0;
  font-size: 15px;
}
</style>
