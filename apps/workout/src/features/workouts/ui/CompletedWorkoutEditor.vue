<script setup lang="ts">
import { computed, onScopeDispose, ref } from "vue";
import { BaseSheet, BaseButton, BaseInput, BaseInputNumber } from "@form/ui";
import type { CompletedSession } from "../domain";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import { useCompletedWorkoutEditor } from "./useCompletedWorkoutEditor";
import { useUnsavedChangesWarning } from "./useUnsavedChangesWarning";

const { session, workspace } = defineProps<{
  session: CompletedSession;
  workspace: Pick<WorkoutWorkspace, "snapshot" | "saving" | "error" | "run">;
}>();
const emit = defineEmits<{ close: []; saved: [] }>();
const editor = useCompletedWorkoutEditor(session, workspace);
const { draft, baseline, dirty, pending, state, localError } = editor;
const rows = computed(
  () => new Map(draft.value.sets.map((set) => [set.setId, set])),
);
const keypadOpen = ref(false);
useUnsavedChangesWarning(() => dirty.value || keypadOpen.value);
const discardIntent = ref<"close" | "reload" | "navigate" | null>(null);
let finishNavigation: ((allow: boolean) => void) | null = null;
function requestClose() {
  if (pending.value) return;
  if (dirty.value) {
    discardIntent.value = "close";
    return;
  }
  emit("close");
}
function requestReload() {
  if (pending.value) return;
  if (dirty.value) {
    discardIntent.value = "reload";
    return;
  }
  editor.reload();
}
function keepEditing() {
  discardIntent.value = null;
  finishNavigation?.(false);
  finishNavigation = null;
}
function discard() {
  if (pending.value) return;
  const intent = discardIntent.value;
  discardIntent.value = null;
  if (intent === "reload") {
    editor.reload();
    return;
  }
  finishNavigation?.(true);
  finishNavigation = null;
  emit("close");
}
function requestLeave(): boolean | Promise<boolean> {
  if (pending.value || keypadOpen.value) return false;
  if (!dirty.value) {
    emit("close");
    return true;
  }
  finishNavigation?.(false);
  discardIntent.value = "navigate";
  return new Promise<boolean>((resolve) => {
    finishNavigation = resolve;
  });
}
onScopeDispose(() => {
  finishNavigation?.(false);
});
async function save() {
  if (await editor.save()) emit("saved");
}
defineExpose({ requestClose, requestLeave });
</script>
<template>
  <BaseSheet
    open
    title="Edit workout"
    description="Correct the workout name and logged values. Changes save together."
    wide
    @close="requestClose"
  >
    <form class="form-stack" :aria-busy="pending" @submit.prevent="save">
      <fieldset class="completed-fields form-stack" :disabled="pending">
        <label class="field"
          ><span>Workout name</span
          ><BaseInput
            v-model="draft.name"
            name="completed-name"
            class="input"
            maxlength="80"
            required
        /></label>
        <section
          v-for="exercise in baseline.exercises"
          :key="exercise.id"
          class="completed-exercise"
        >
          <h3>{{ exercise.name }}</h3>
          <div
            v-for="(set, index) in exercise.sets"
            :key="set.id"
            class="completed-set"
          >
            <span class="muted">Set {{ index + 1 }}</span>
            <template v-if="rows.get(set.id)">
              <label class="field"
                ><span>Weight · kg</span
                ><BaseInputNumber
                  :model-value="rows.get(set.id)!.weightKg"
                  :label="`${exercise.name} set ${index + 1} weight`"
                  title="Weight"
                  unit="kg"
                  :min="0"
                  :max="1000"
                  :decimals="2"
                  :preset-step="2.5"
                  :disabled="pending"
                  @open="keypadOpen = true"
                  @close="keypadOpen = false"
                  @update:model-value="rows.get(set.id)!.weightKg = $event"
              /></label>
              <label class="field"
                ><span>Reps</span
                ><BaseInputNumber
                  :model-value="rows.get(set.id)!.reps"
                  :label="`${exercise.name} set ${index + 1} reps`"
                  title="Reps"
                  :min="0"
                  :max="1000"
                  :disabled="pending"
                  @open="keypadOpen = true"
                  @close="keypadOpen = false"
                  @update:model-value="rows.get(set.id)!.reps = $event"
              /></label>
            </template>
            <p v-else class="unlogged muted">
              {{ set.weightKg }} kg × {{ set.reps }} reps · Not logged,
              read-only
            </p>
          </div>
        </section>
      </fieldset>
      <div v-if="state !== 'ready'" class="draft-finish-notice" role="alert">
        <p>
          {{
            state === "missing"
              ? "This workout is no longer saved. Your input is still here to copy, but it cannot recreate the workout."
              : "Saved data changed while you were editing. Your input is still here. Reload saved values before making corrections."
          }}
        </p>
        <BaseButton
          v-if="state === 'conflict'"
          type="button"
          variant="secondary"
          :disabled="pending"
          @click="requestReload"
          >Reload saved values</BaseButton
        >
      </div>
      <p v-else-if="localError" class="field-error" role="alert">
        {{ localError }}
      </p>
      <div class="form-actions completed-actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="pending"
          @click="requestClose"
          >Cancel</BaseButton
        >
        <BaseButton type="submit" :disabled="pending || state !== 'ready'">{{
          pending ? "Saving…" : "Save changes"
        }}</BaseButton>
      </div>
    </form>
  </BaseSheet>
  <BaseSheet
    :open="discardIntent !== null"
    title="Discard workout changes?"
    :description="
      discardIntent === 'reload'
        ? 'Reloading replaces your input with the latest saved values.'
        : 'Your unsaved corrections will be lost.'
    "
    @close="keepEditing"
  >
    <div class="form-actions">
      <BaseButton variant="secondary" @click="keepEditing"
        >Keep editing</BaseButton
      >
      <BaseButton :disabled="pending" @click="discard">{{
        discardIntent === "reload" ? "Discard and reload" : "Discard changes"
      }}</BaseButton>
    </div>
  </BaseSheet>
</template>
<style scoped>
.completed-fields {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
}
.completed-exercise h3 {
  font-size: 15px;
}
.completed-set {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}
.unlogged {
  grid-column: 2 / -1;
  font-size: 12px;
}
.completed-actions {
  position: sticky;
  bottom: 0;
  padding-block: 12px;
  background: var(--background);
}
</style>
