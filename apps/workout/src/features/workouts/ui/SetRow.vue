<script setup lang="ts">
import {
  BaseFeedback,
  BaseSheet,
  BaseButtonIcon,
  BaseButton,
  BaseInputNumber,
} from "@form/ui";
import { computed, useTemplateRef, watch, nextTick, ref } from "vue";
import { Check, MoreHorizontal, Save } from "@lucide/vue";
import type { TrainingRow } from "./useTrainingSession";
import type { RawValues, SetDraft } from "../domain/drafts";
import { useFormat, useTranslation } from "../../../i18n";
const { row, busy, current, dirty, conflict } = defineProps<{
  row: TrainingRow;
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
      <BaseButton
        unstyled
        type="button"
        class="set-number"
        :aria-label="
          t('training.setRow.select', {
            n: row.index + 1,
            exercise: row.exercise.name,
          })
        "
        :aria-current="current ? 'true' : undefined"
        @click="emit('select')"
      >
        {{ row.index + 1 }}
      </BaseButton>
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
      />
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
      <BaseButton
        unstyled
        type="submit"
        class="set-toggle"
        :class="{ logged: row.set.completed, 'has-draft': dirty }"
        :aria-label="toggleLabel()"
        :aria-disabled="row.set.completed && !dirty"
        :disabled="busy"
      >
        <BaseFeedback :active="row.set.completed">
          <Save v-if="dirty && row.set.completed" :size="18" /><Check
            v-else
            :size="19"
          />
        </BaseFeedback>
        <span v-if="row.set.completed && !dirty" class="set-logged-label"
          >{{ t("training.setRow.logged") }}</span
        >
      </BaseButton>
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
    <p
      v-if="row.issue"
      :id="`set-issue-${row.set.id}`"
      class="field-error"
      role="alert"
    >
      {{ row.issue }}
    </p>
    <div v-if="conflict" class="draft-conflict">
      <p>{{ t("training.setRow.conflict") }}</p>
      <p>{{ savedSummary }}</p>
      <BaseButton
        unstyled
        type="button"
        class="text-button"
        :disabled="busy"
        @click="emit('keep')"
      >
        {{ t("training.setRow.keepInput") }}
      </BaseButton>
      <BaseButton
        unstyled
        v-for="draft in row.alternatives"
        :key="draft.id"
        type="button"
        class="text-button"
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
        unstyled
        type="button"
        class="text-button"
        @click="discardOpen = true"
      >
        {{ t("training.setRow.useSaved") }}
      </BaseButton>
    </div>
    <p v-if="row.storageIssue" class="field-error" role="alert">
      {{ row.storageIssue }}
    </p>
    <p v-else-if="row.touched && !conflict" class="draft-note">
      {{
        row.set.completed
          ? t("training.setRow.retainedLogged")
          : t("training.setRow.retainedUnlogged")
      }}
    </p>
  </form>
  <BaseSheet
    :open="discardOpen"
:title="t('training.discardInput.title')"
    :description="t('training.discardInput.description')"
    @close="discardOpen = false"
  >
    <div class="form-actions">
      <BaseButton variant="secondary" @click="discardOpen = false">
        {{ t("training.discardInput.keepEditing") }}
      </BaseButton>
      <BaseButton
        :disabled="busy"
        @click="
          emit('discard');
          discardOpen = false;
        "
      >
        {{ t("training.discardInput.action") }}
      </BaseButton>
    </div>
  </BaseSheet>
</template>
