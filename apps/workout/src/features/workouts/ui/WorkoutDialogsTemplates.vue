<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import {
  BaseButton,
  BaseEmptyState,
  BaseListGroup,
  BaseListRow,
  BaseNotice,
  BaseSheet,
} from "@form/ui";
import { Plus, BookmarkPlus, Dumbbell } from "@lucide/vue";
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
const previewLimit = 3;
/** The first exercise names of a template, with how many more it holds. */
function preview(routine: Routine): string {
  const names = routine.exercises
    .slice(0, previewLimit)
    .flatMap((entry) => exercises.value[entry.exerciseId]?.name ?? []);
  const more = routine.exercises.length - previewLimit;
  if (more > 0) names.push(t("dialogs.templates.more", { count: more }));
  return names.join(" · ");
}
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
      <BaseNotice
        v-if="routineOpen && routineConflict"
        tone="danger"
        class="conflict-notice"
      >
        {{
          routineState === "deleted"
            ? t("dialogs.templates.deleted")
            : t("dialogs.templates.changed")
        }}
        <template v-if="routineState !== 'deleted'" #action>
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="saving"
            @click="useSavedRoutine"
            >{{ t("dialogs.templates.useSaved") }}</BaseButton
          >
          <BaseButton
            size="sm"
            :disabled="saving"
            @click="keepRoutineChanges"
            >{{ t("dialogs.templates.keepMine") }}</BaseButton
          >
        </template>
      </BaseNotice>
      <template v-if="!routineOpen">
        <BaseButton
          v-if="routines.length"
          class="new-template"
          variant="secondary"
          @click="editRoutine(null)"
          ><Plus :size="17" />{{
            t("dialogs.templates.newTemplate")
          }}</BaseButton
        >
        <BaseEmptyState
          v-if="!routines.length"
          :title="t('dialogs.templates.emptyTitle')"
          :body="t('dialogs.templates.emptyDescription')"
        >
          <template #icon><BookmarkPlus :size="26" /></template>
          <template #action
            ><BaseButton variant="secondary" @click="editRoutine(null)">
              <Plus :size="17" />{{ t("dialogs.templates.createTemplate") }}
            </BaseButton></template
          >
        </BaseEmptyState>
        <BaseListGroup v-else>
          <BaseListRow
            v-for="routine in routines"
            :key="routine.id"
            :icon="Dumbbell"
            :label="routine.name"
          >
            <template #subtitle>
              <span v-if="routine.description">{{ routine.description }}</span>
              <span class="template-preview">{{ preview(routine) }}</span>
              <span>{{
                t("dialogs.templates.exerciseCount", routine.exercises.length)
              }}</span>
              <span class="template-actions">
                <BaseButton
                  variant="ghost"
                  size="sm"
                  :aria-label="
                    t('dialogs.templates.editAria', { name: routine.name })
                  "
                  :data-template-id="routine.id"
                  @click="editRoutine(routine)"
                >
                  {{ t("dialogs.templates.edit") }}
                </BaseButton>
                <BaseButton
                  variant="secondary"
                  size="sm"
                  :disabled="saving || !!active"
                  :aria-label="
                    t('dialogs.templates.startAria', { name: routine.name })
                  "
                  @click="emit('start', routine.id)"
                >
                  {{ t("dialogs.templates.start") }}
                </BaseButton>
              </span>
            </template>
          </BaseListRow>
        </BaseListGroup>
      </template>
    </div>
    <BaseNotice v-if="error" tone="danger">{{ error }}</BaseNotice></BaseSheet
  >
</template>

<style scoped>
.conflict-notice {
  margin-block-start: var(--space-5);
}
.new-template {
  margin-block-end: var(--space-4);
}
.template-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-block-start: var(--space-2);
}
.template-preview {
  overflow-wrap: anywhere;
}
</style>
