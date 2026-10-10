<script setup lang="ts">
import { BaseButtonIcon, BaseButton, BaseInput, BaseTextarea, BaseInputNumber } from "@form/ui";
import { computed, ref } from "vue";
import { Plus, Trash2 } from "@lucide/vue";
import type { CompletedSession, Exercise, Routine } from "../domain";
import { parseRoutineDraft, type RoutineValues } from "../domain/routineDrafts";
import ExerciseCatalog from "./ExerciseCatalog.vue";
import RoutineEditorConfirmations from "./RoutineEditorConfirmations.vue";
import { useUnsavedChangesWarning } from "./useUnsavedChangesWarning";
import { useTranslation } from "../../../i18n";
const { routine, source, exercises, busy } = defineProps<{
  routine: Routine | null;
  source?: CompletedSession | null;
  exercises: readonly Exercise[];
  busy: boolean;
}>();
const emit = defineEmits<{ save: [routine: RoutineValues]; cancel: [] }>();
const { t } = useTranslation();
type SetDraft = {
  weightKg: string | number;
  reps: string | number;
  skipped?: boolean;
};
type ExerciseDraft = { key: string; exerciseId: string; sets: SetDraft[] };
const name = ref(routine?.name ?? "");
const description = ref(routine?.description ?? "");
const entries = ref<ExerciseDraft[]>(
  routine?.exercises.map((entry, exerciseIndex) => ({
    key: crypto.randomUUID(),
    exerciseId: entry.exerciseId,
    sets: entry.sets.map((set, setIndex) => ({
      ...set,
      skipped:
        source?.exercises[exerciseIndex]?.sets[setIndex]?.completed === false,
    })),
  })) ?? [],
);
function semanticDraft() {
  return JSON.stringify({
    name: name.value.trim(),
    description: description.value.trim(),
    exercises: entries.value.map((entry) => ({
      exerciseId: entry.exerciseId,
      sets: entry.sets.map((set) => ({
        weightKg: normalizedNumber(set.weightKg),
        reps: normalizedNumber(set.reps),
      })),
    })),
  });
}
function normalizedNumber(value: string | number) {
  const text = String(value).trim();
  return text && Number.isFinite(Number(text)) ? Number(text) : text;
}
const baseline = semanticDraft();
const dirty = computed(() => semanticDraft() !== baseline);
useUnsavedChangesWarning(() => dirty.value);
const discardOpen = ref(false);
function requestClose() {
  if (busy) return;
  if (dirty.value) {
    discardOpen.value = true;
    return;
  }
  emit("cancel");
}
function discardChanges() {
  if (busy) return;
  discardOpen.value = false;
  emit("cancel");
}
defineExpose({ requestClose, save });
type Removal =
  | { kind: "exercise"; entry: ExerciseDraft }
  | { kind: "set"; entry: ExerciseDraft; set: SetDraft };
const removal = ref<Removal | null>(null);
function removeConfirmed() {
  const request = removal.value;
  if (!request || busy) return;
  if (request.kind === "exercise") {
    entries.value = entries.value.filter(
      (entry) => entry.key !== request.entry.key,
    );
  }
  if (request.kind === "set") {
    request.entry.sets = request.entry.sets.filter(
      (set) => set !== request.set,
    );
  }
  removal.value = null;
}
const pickerOpen = ref(false);
const selected = ref<string[]>([]);
const error = ref("");
const names = computed(
  () => new Map(exercises.map((exercise) => [exercise.id, exercise.name])),
);
function nameOf(id: string) {
  return names.value.get(id) ?? "";
}
function toggle(id: string) {
  selected.value = selected.value.includes(id)
    ? selected.value.filter((item) => item !== id)
    : [...selected.value, id];
}
function addExercises() {
  if (entries.value.length + selected.value.length > 50) {
    error.value = t("dialogs.routineEditor.tooMany");
    return;
  }
  entries.value.push(
    ...selected.value.map((exerciseId) => ({
      key: crypto.randomUUID(),
      exerciseId,
      sets: [{ reps: 8, weightKg: 0 }],
    })),
  );
  selected.value = [];
  pickerOpen.value = false;
  error.value = "";
}
function addSet(entry: ExerciseDraft) {
  if (entry.sets.length < 30)
    entry.sets.push({
      ...(entry.sets.at(-1) ?? { reps: 8, weightKg: 0 }),
      skipped: false,
    });
}
function save() {
  if (busy) return;
  const result = parseRoutineDraft({
    name: name.value,
    description: description.value,
    exercises: entries.value,
  });
  if (!result) {
    error.value = t("dialogs.routineEditor.invalid");
    return;
  }
  emit("save", result);
}
</script>
<template>
  <form
    class="form-stack routine-editor"
    :aria-busy="busy"
    @submit.prevent="save"
  >
    <fieldset class="editor-fields form-stack" :disabled="busy">
      <label class="field"
        ><span>{{ t("dialogs.routineEditor.nameLabel") }}</span
        ><BaseInput
          v-model="name"
          class="input"
          name="routine-name"
          :placeholder="t('dialogs.routineEditor.namePlaceholder')"
          maxlength="80"
          required
      /></label>
      <label class="field"
        ><span
          >{{ t("dialogs.routineEditor.descriptionLabel") }}
          <span class="muted">{{
            t("dialogs.routineEditor.optional")
          }}</span></span
        ><BaseTextarea
          v-model="description"
          class="input"
          maxlength="240"
          rows="2"
          :placeholder="t('dialogs.routineEditor.descriptionPlaceholder')"
        />
      </label>
      <p class="muted small">
        {{ t("dialogs.routineEditor.hint") }}
      </p>
      <section
        v-for="(entry, index) in entries"
        :key="entry.key"
        class="routine-exercise"
      >
        <div class="exercise-heading">
          <h3>{{ index + 1 }}. {{ names.get(entry.exerciseId) }}</h3>
          <BaseButtonIcon
            type="button"
            :label="
              t('dialogs.routineEditor.removeExercise', {
                exercise: nameOf(entry.exerciseId),
              })
            "
            @click="removal = { kind: 'exercise', entry }"
          >
            <Trash2 :size="17" />
          </BaseButtonIcon>
        </div>
        <div
          v-for="(set, setIndex) in entry.sets"
          :key="setIndex"
          class="template-set"
        >
          <span class="muted"
            >{{ setIndex + 1
            }}<small v-if="set.skipped" class="skipped-label">{{
              t("dialogs.routineEditor.skipped")
            }}</small
            ></span
          >
          <label class="field"
            ><span>{{ t("dialogs.fields.weightKg") }}</span
            ><BaseInputNumber
              v-model="set.weightKg"
              class="input"
              :title="t('dialogs.fields.weight')"
              unit="kg"
              :decimals="2"
              :preset-step="2.5"
              :disabled="busy"
              :min="0"
              :max="1000"
              :label="
                t('dialogs.routineEditor.weightLabel', {
                  exercise: nameOf(entry.exerciseId),
                  number: setIndex + 1,
                })
              "
          /></label>
          <label class="field"
            ><span>{{ t("dialogs.fields.reps") }}</span
            ><BaseInputNumber
              v-model="set.reps"
              class="input"
              :title="t('dialogs.fields.reps')"
              :disabled="busy"
              :min="1"
              :max="1000"
              :label="
                t('dialogs.routineEditor.repsLabel', {
                  exercise: nameOf(entry.exerciseId),
                  number: setIndex + 1,
                })
              "
          /></label>
          <BaseButtonIcon
            type="button"
            :disabled="entry.sets.length <= 1"
            :label="
              t('dialogs.routineEditor.removeSetAria', {
                number: setIndex + 1,
                exercise: nameOf(entry.exerciseId),
              })
            "
            @click="removal = { kind: 'set', entry, set }"
          >
            <Trash2 :size="16" />
          </BaseButtonIcon>
        </div>
        <BaseButton
          unstyled
          type="button"
          class="text-button add-set"
          :disabled="entry.sets.length >= 30"
          @click="addSet(entry)"
        >
          <Plus :size="15" />{{ t("dialogs.routineEditor.addSet") }}
        </BaseButton>
      </section>
      <BaseButton
        unstyled
        type="button"
        class="btn secondary full-width"
        :disabled="entries.length >= 50"
        @click="pickerOpen = !pickerOpen"
      >
        <Plus :size="17" />{{
          pickerOpen
            ? t("dialogs.routineEditor.closeLibrary")
            : t("dialogs.routineEditor.addExercises")
        }}
      </BaseButton>
      <div v-if="pickerOpen" class="template-picker">
        <ExerciseCatalog
          :exercises="exercises"
          :selected="selected"
          :busy="busy"
          @toggle="toggle"
        /><BaseButton
          unstyled
          type="button"
          class="btn primary full-width"
          :disabled="!selected.length"
          @click="addExercises"
        >
          {{ t("dialogs.routineEditor.addSelected", selected.length) }}
        </BaseButton>
      </div>
    </fieldset>
    <p v-if="error" class="field-error" role="alert">{{ error }}</p>
    <div class="form-actions">
      <BaseButton
        unstyled
        type="button"
        class="btn secondary"
        :disabled="busy"
        @click="requestClose"
      >
        {{ t("dialogs.actions.cancel") }}</BaseButton
      ><BaseButton unstyled type="submit" class="btn primary" :disabled="busy">
        {{
          busy ? t("dialogs.actions.saving") : t("dialogs.routineEditor.save")
        }}
      </BaseButton>
    </div>
  </form>
  <RoutineEditorConfirmations
    :discard-open="discardOpen"
    :removal="removal?.kind ?? null"
    :busy="busy"
    @keep-editing="discardOpen = false"
    @discard="discardChanges"
    @cancel-removal="removal = null"
    @confirm-removal="removeConfirmed"
  />
</template>
<style scoped>
.editor-fields {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
}
.exercise-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.exercise-heading h3 {
  font-size: 14px;
  margin: 0;
}
.template-set {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) minmax(0, 1fr) 40px;
  gap: 10px;
  align-items: center;
  margin-block-start: 12px;
}
.input {
  width: 100%;
  min-width: 0;
  min-height: 44px;
}
.template-picker {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
}
.template-picker :deep(.catalog-list) {
  max-height: 320px;
  overflow: auto;
  overscroll-behavior: contain;
}
.skipped-label {
  display: block;
  font-size: 9px;
  margin-block-start: 4px;
}
@media (max-width: 380px) {
  .template-set {
    grid-template-columns: 20px minmax(0, 1fr) minmax(0, 1fr) 44px;
    gap: 6px;
    align-items: end;
  }
  .template-set > .muted {
    align-self: center;
  }
  .template-set .field > span {
    font-size: 11px;
    white-space: nowrap;
  }
  .template-set .input {
    padding-inline: 6px;
  }
  .routine-exercise {
    padding: 12px;
  }
}
</style>
