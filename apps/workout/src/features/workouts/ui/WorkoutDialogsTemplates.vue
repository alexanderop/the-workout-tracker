<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { BaseSheet, BaseButton } from "@form/ui";
import { Plus, BookmarkPlus, Dumbbell, ArrowRight } from "@lucide/vue";
import RoutineEditor from "./RoutineEditor.vue";
import type { CompletedSession, Routine } from "../domain";
import {
  compareRoutineBaseline,
  type RoutineValues,
} from "../domain/routineDrafts";
import type { WorkoutWorkspace } from "./useWorkoutWorkspace";
import { useTranslation } from "../../../i18n";

const { workspace, open = false } = defineProps<{
  open?: boolean;
  workspace: Pick<
    WorkoutWorkspace,
    | "snapshot"
    | "saving"
    | "error"
    | "notify"
    | "clearError"
    | "run"
    | "active"
    | "catalog"
  >;
}>();
const emit = defineEmits<{
  start: [routineId: string];
  "template-saved": [];
  "close-templates": [];
  "template-closed": [event: Event];
}>();
const { t } = useTranslation();
const { snapshot, saving, error, notify, clearError, run, active, catalog } =
  workspace;

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
/** Closes the editor and forgets its target so no stale conflict survives. */
function closeRoutineEditor() {
  routineOpen.value = false;
  editingRoutine.value = null;
  templateSource.value = null;
  routineConflict.value = false;
}
function cancelRoutine() {
  closeRoutineEditor();
  if (open) void focusTemplateContent();
}
function closeTemplates() {
  if (routineOpen.value) {
    routineEditor.value?.requestClose();
    return;
  }
  emit("close-templates");
}
watch(
  () => open,
  (isOpen, wasOpen) => {
    if (!isOpen && wasOpen && routineOpen.value)
      routineEditor.value?.requestClose();
  },
);
function editRoutine(
  routine: Routine | null,
  source: CompletedSession | null = null,
) {
  templateSource.value = source;
  editingRoutine.value = routine;
  routineConflict.value = false;
  routineEditorVersion.value++;
  clearError();
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
    notify(t("dialogs.notices.templateSaved"));
    emit("template-saved");
  }
}
function savedRoutine() {
  const saved =
    editingRoutine.value && snapshot.value?.routines[editingRoutine.value.id];
  if (!saved || saving.value) return null;
  editingRoutine.value = saved;
  routineConflict.value = false;
  clearError();
  return saved;
}
function useSavedRoutine() {
  if (!savedRoutine()) return;
  routineEditorVersion.value++;
  void focusTemplateContent();
}
function keepRoutineChanges() {
  if (savedRoutine()) routineEditor.value?.save();
}
defineExpose({ editRoutine });
</script>

<template>
  <BaseSheet
    :open="routineOpen || open"
    :title="
      routineOpen
        ? editingRoutine && !templateSource
          ? t('dialogs.templates.editTitle')
          : t('dialogs.templates.createTitle')
        : t('dialogs.templates.title')
    "
    :description="t('dialogs.templates.description')"
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
              ? t("dialogs.templates.deleted")
              : t("dialogs.templates.changed")
          }}
        </p>
        <div v-if="routineState !== 'deleted'" class="form-actions">
          <BaseButton
            variant="secondary"
            :disabled="saving"
            @click="useSavedRoutine"
            >{{ t("dialogs.templates.useSaved") }}</BaseButton
          >
          <BaseButton :disabled="saving" @click="keepRoutineChanges">{{
            t("dialogs.templates.keepMine")
          }}</BaseButton>
        </div>
      </div>
      <template v-if="!routineOpen">
        <BaseButton
          v-if="routines.length"
          unstyled
          class="btn secondary"
          @click="editRoutine(null)"
          ><Plus :size="17" />{{
            t("dialogs.templates.newTemplate")
          }}</BaseButton
        >
        <div v-if="!routines.length" class="overview-empty">
          <BookmarkPlus :size="26" />
          <h2>{{ t("dialogs.templates.emptyTitle") }}</h2>
          <p class="muted">
            {{ t("dialogs.templates.emptyDescription") }}
          </p>
          <BaseButton unstyled class="btn secondary" @click="editRoutine(null)">
            <Plus :size="17" />{{ t("dialogs.templates.createTemplate") }}
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
                :aria-label="
                  t('dialogs.templates.editAria', { name: routine.name })
                "
                :data-template-id="routine.id"
                @click="editRoutine(routine)"
              >
                {{ t("dialogs.templates.edit") }}
              </BaseButton>
            </header>
            <h2>{{ routine.name }}</h2>
            <p class="muted small routine-description">
              {{
                routine.description || t("dialogs.templates.defaultDescription")
              }}
            </p>
            <ul class="exercise-preview">
              <li
                v-for="(entry, index) in routine.exercises.slice(0, 4)"
                :key="index"
              >
                <span>{{ exercises[entry.exerciseId]?.name }}</span
                ><span class="muted">{{
                  t("dialogs.templates.setCount", entry.sets.length)
                }}</span>
              </li>
              <li v-if="routine.exercises.length > 4" class="muted">
                {{
                  t("dialogs.templates.more", {
                    count: routine.exercises.length - 4,
                  })
                }}
              </li>
            </ul>
            <footer>
              <span class="muted small">{{
                t("dialogs.templates.exerciseCount", routine.exercises.length)
              }}</span
              ><BaseButton
                unstyled
                class="btn secondary"
                :disabled="saving || !!active"
                :aria-label="
                  t('dialogs.templates.startAria', { name: routine.name })
                "
                @click="emit('start', routine.id)"
              >
                {{ t("dialogs.templates.start") }}<ArrowRight :size="16" />
              </BaseButton>
            </footer>
          </article>
        </div>
      </template>
    </div>
    <p v-if="error" class="field-error" role="alert">{{ error }}</p></BaseSheet
  >
</template>
