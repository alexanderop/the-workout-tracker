<script setup lang="ts">
import {
  BaseFeedback,
  BaseConfirmSheet,
  BaseButtonIcon,
  BaseButton,
  BaseFieldError,
  BaseInputNumber,
  BaseNotice,
} from "@form/ui";
import { computed, useTemplateRef, watch, nextTick, ref } from "vue";
import { Check, MoreHorizontal, Save, Target } from "@lucide/vue";
import type { TrainingRow } from "./useTrainingSession";
import type { RawValues, SetDraft } from "../domain/drafts";
import type { Barbell } from "../domain";
import type { SetSuggestion } from "../domain/exerciseHistory";
import BarbellPlates from "./BarbellPlates.vue";
import { useFormat, useTranslation } from "../../../i18n";
const { row, barbell, busy, current, dirty, conflict, suggestion } =
  defineProps<{
    row: TrainingRow;
    /** Earlier values offered for this unlogged set; applied only on tap. */
    suggestion?: SetSuggestion | null;
    /** The lifter's bar and plates, for barbell exercises only. */
    barbell?: Barbell | null;
    busy: boolean;
    current: boolean;
    dirty: boolean;
    conflict: boolean;
  }>();
const emit = defineEmits<{
  edit: [values: Partial<RawValues>];
  commit: [];
  select: [];
  options: [];
  discard: [];
  keep: [];
  recover: [draft: SetDraft];
}>();
const { t } = useTranslation();
const format = useFormat();
const discardOpen = ref(false);
const savedSummary = computed(() =>
  t(
    row.set.completed
      ? "training.setRow.savedLogged"
      : "training.setRow.savedNotLogged",
    {
      weight: format.value.number(row.set.weightKg),
      reps: row.set.reps,
    },
  ),
);
const offered = computed(() => {
  if (!current || conflict || !suggestion) return null;
  const weight = String(suggestion.weightKg);
  const reps = String(suggestion.reps);
  if (row.weight === weight && row.reps === reps) return null;
  return {
    values: { weight, reps },
    text: t("training.setRow.suggestion", {
      weight: format.value.number(suggestion.weightKg),
      reps,
    }),
  };
});
async function applySuggestion(values: RawValues) {
  emit("edit", values);
  await nextTick();
  form.value
    ?.querySelector<HTMLButtonElement>(".set-toggle")
    ?.focus({ preventScroll: true });
}
const toggleLabel = () => {
  const values = { n: row.index + 1, exercise: row.exercise.name };
  if (!row.set.completed) return t("training.setRow.logSet", values);
  return dirty
    ? t("training.setRow.saveSet", values)
    : t("training.setRow.loggedSet", values);
};
const form = useTemplateRef<HTMLFormElement>("form");
watch(
  () => row.issue,
  async (issue) => {
    if (!issue) return;
    await nextTick();
    form.value?.scrollIntoView({ block: "center", behavior: "instant" });
  },
);
defineExpose({
  get setId() {
    return row.set.id;
  },
  focus() {
    form.value
      ?.querySelector<HTMLButtonElement>(".set-options")
      ?.focus({ preventScroll: true });
  },
  focusLog() {
    form.value
      ?.querySelector<HTMLButtonElement>(".set-toggle")
      ?.focus({ preventScroll: true });
  },
  scrollIntoView() {
    form.value?.scrollIntoView({ block: "nearest", behavior: "instant" });
  },
});
</script>
<template>
  <form
    ref="form"
    :id="`set-form-${row.set.id}`"
    class="set-form"
    :class="{ 'is-current': current }"
    @submit.prevent="emit('commit')"
  >
    <div
      class="set-row"
      :class="{ completed: row.set.completed, edited: dirty }"
    >
      <BaseButtonIcon
        variant="secondary"
        class="set-number"
        :label="
          t('training.setRow.select', {
            n: row.index + 1,
            exercise: row.exercise.name,
          })
        "
        :aria-current="current ? 'true' : undefined"
        @click="emit('select')"
      >
        {{ row.index + 1 }}
      </BaseButtonIcon>
      <BaseInputNumber
        :model-value="row.weight"
        :title="t('training.setRow.weight')"
        :unit="t('training.setRow.kg')"
        :decimals="2"
        :preset-step="2.5"
        class="set-input"
        :aria-invalid="!!row.issue"
        :aria-describedby="row.issue ? `set-issue-${row.set.id}` : undefined"
        :label="
          t('training.setRow.weightLabel', {
            n: row.index + 1,
            exercise: row.exercise.name,
          })
        "
        :disabled="busy"
        @update:model-value="emit('edit', { weight: $event })"
        @open="emit('select')"
      >
        <template v-if="barbell" #aside="{ value }">
          <BarbellPlates :total-kg="value" :barbell="barbell" />
        </template>
      </BaseInputNumber>
      <BaseInputNumber
        :model-value="row.reps"
        :title="t('training.setRow.reps')"
        :min="0"
        class="set-input"
        :aria-invalid="!!row.issue"
        :aria-describedby="row.issue ? `set-issue-${row.set.id}` : undefined"
        :label="
          t('training.setRow.repsLabel', {
            n: row.index + 1,
            exercise: row.exercise.name,
          })
        "
        :disabled="busy"
        @update:model-value="emit('edit', { reps: $event })"
        @open="emit('select')"
      />
      <BaseButtonIcon
        type="submit"
        :variant="current && !row.set.completed ? 'default' : 'secondary'"
        class="set-toggle"
        :class="{ logged: row.set.completed, 'has-draft': dirty }"
        :label="toggleLabel()"
        :aria-disabled="row.set.completed && !dirty"
        :disabled="busy"
      >
        <BaseFeedback :active="row.set.completed">
          <Save v-if="dirty && row.set.completed" :size="18" /><Check
            v-else
            :size="19"
          />
        </BaseFeedback>
        <span v-if="row.set.completed && !dirty" class="set-logged-label">{{
          t("training.setRow.logged")
        }}</span>
      </BaseButtonIcon>
      <BaseButtonIcon
        type="button"
        class="set-options"
        :label="
          t('training.setRow.options', {
            n: row.index + 1,
            exercise: row.exercise.name,
          })
        "
        :disabled="busy"
        @click="emit('options')"
      >
        <MoreHorizontal :size="20" />
      </BaseButtonIcon>
    </div>
    <BaseButton
      v-if="offered"
      type="button"
      variant="secondary"
      size="sm"
      class="set-suggestion"
      :aria-label="
        t('training.setRow.suggestionLabel', {
          n: row.index + 1,
          exercise: row.exercise.name,
          values: offered.text,
        })
      "
      :disabled="busy"
      @click="applySuggestion(offered.values)"
      ><Target :size="16" />{{ offered.text }}</BaseButton
    >
    <BaseFieldError
      v-if="row.issue"
      :id="`set-issue-${row.set.id}`"
      class="set-issue"
      :errors="[row.issue]"
    />
    <div v-if="conflict" class="draft-conflict">
      <p>{{ t("training.setRow.conflict") }}</p>
      <p>{{ savedSummary }}</p>
      <BaseButton
        type="button"
        variant="link"
        size="row"
        :disabled="busy"
        @click="emit('keep')"
      >
        {{ t("training.setRow.keepInput") }}
      </BaseButton>
      <BaseButton
        v-for="draft in row.alternatives"
        :key="draft.id"
        type="button"
        variant="link"
        size="row"
        @click="emit('recover', draft)"
      >
        {{
          t("training.setRow.reviewDraft", {
            weight: draft.weight || t("training.setRow.empty"),
            reps: draft.reps || t("training.setRow.empty"),
          })
        }}
      </BaseButton>
      <BaseButton
        type="button"
        variant="link"
        size="row"
        @click="discardOpen = true"
      >
        {{ t("training.setRow.useSaved") }}
      </BaseButton>
    </div>
    <BaseNotice v-if="row.storageIssue" class="set-issue" tone="danger">{{
      row.storageIssue
    }}</BaseNotice>
    <p v-else-if="row.touched && !conflict" class="draft-note">
      {{
        row.set.completed
          ? t("training.setRow.retainedLogged")
          : t("training.setRow.retainedUnlogged")
      }}
    </p>
  </form>
  <BaseConfirmSheet
    v-model:open="discardOpen"
    intent="destructive"
    :title="t('training.discardInput.title')"
    :description="t('training.discardInput.description')"
    :cancel-label="t('dialogs.actions.keepEditing')"
    :confirm-label="t('training.discardInput.action')"
    :busy="busy"
    @confirm="
      emit('discard');
      discardOpen = false;
    "
  />
</template>
