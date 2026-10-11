<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { BaseSheet, BaseButton, BaseInput, BaseMuscleMap } from "@form/ui";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Dumbbell,
  Layers,
  PersonStanding,
  Shapes,
} from "@lucide/vue";
import { exerciseKinds, type Exercise } from "../domain";
import { categoryLabel, equipmentLabel, kindLabel } from "./exerciseLabels";
import {
  equipmentIllustrations,
  exerciseMuscleHighlights,
  muscleIllustrations,
} from "./catalogIllustrations";
import {
  chooseCategory,
  emptyExerciseDraft,
  equipmentTypes,
  exerciseFromDraft,
  muscleGroups,
  toggleSecondary,
  type ExerciseDraft,
} from "./exerciseDraft";
import { useTranslation } from "../../../i18n";

/**
 * Collects a custom exercise: name, equipment, main and secondary muscle
 * groups and exercise type. Each detail opens its own view in the sheet.
 */
const { open, saving, error } = defineProps<{
  open: boolean;
  saving: boolean;
  error: string | null;
}>();
const emit = defineEmits<{
  close: [];
  submit: [exercise: Omit<Exercise, "id" | "custom">];
}>();
const { t } = useTranslation();

type Panel = "overview" | "equipment" | "muscle" | "secondary" | "kind";
const panel = ref<Panel>("overview");
const draft = ref<ExerciseDraft>(emptyExerciseDraft);
const content = useTemplateRef<HTMLElement>("content");
const title = computed(
  () =>
    ({
      overview: t("dialogs.picker.createTitle"),
      equipment: t("dialogs.picker.equipment"),
      muscle: t("dialogs.picker.muscleGroup"),
      secondary: t("dialogs.picker.secondaryMuscles"),
      kind: t("dialogs.picker.kind"),
    })[panel.value],
);
const highlights = computed(() =>
  exerciseMuscleHighlights(
    draft.value.category,
    draft.value.secondaryCategories,
  ),
);
const secondaryOptions = computed(() =>
  muscleGroups.filter((group) => group !== draft.value.category),
);
const secondarySummary = computed(() =>
  draft.value.secondaryCategories.length
    ? draft.value.secondaryCategories
        .map((group) => categoryLabel(group, t))
        .join(", ")
    : t("dialogs.picker.none"),
);
watch(
  () => open,
  (value) => {
    if (value) panel.value = "overview";
  },
);

async function showPanel(next: Panel, focus: Panel | "back") {
  panel.value = next;
  await nextTick();
  content.value?.querySelector<HTMLElement>(`[data-focus="${focus}"]`)?.focus();
}
function update(next: ExerciseDraft, from: Panel) {
  draft.value = next;
  void showPanel("overview", from);
}
function submit() {
  if (!draft.value.name.trim() || saving) return;
  emit("submit", exerciseFromDraft(draft.value));
}
defineExpose({
  /** Clears the input after the exercise was saved. */
  reset: () => {
    draft.value = emptyExerciseDraft;
    panel.value = "overview";
  },
});
</script>

<template>
  <BaseSheet
    :open="open"
    :title="title"
    :description="
      panel === 'overview' ? t('dialogs.picker.createDescription') : undefined
    "
    @close="emit('close')"
  >
    <div ref="content" class="exercise-filters exercise-create">
      <form
        v-if="panel === 'overview'"
        class="exercise-create-form"
        @submit.prevent="submit"
      >
        <div class="exercise-create-preview" aria-hidden="true">
          <BaseMuscleMap
            v-if="highlights.length"
            presentation="illustration"
            :highlights="highlights"
          />
          <Dumbbell v-else :size="40" />
        </div>
        <label class="exercise-create-name">
          <span>{{ t("dialogs.picker.nameLabel") }}</span>
          <BaseInput
            :model-value="draft.name"
            class="input"
            required
            maxlength="80"
            :placeholder="t('dialogs.picker.namePlaceholder')"
            @update:model-value="draft = { ...draft, name: String($event) }"
          />
        </label>
        <div class="filter-overview-group">
          <button
            type="button"
            class="filter-overview-row"
            data-focus="equipment"
            @click="showPanel('equipment', 'back')"
          >
            <Dumbbell aria-hidden="true" :size="22" /><span>{{
              t("dialogs.picker.equipment")
            }}</span
            ><small>{{ equipmentLabel(draft.equipment, t) }}</small
            ><ChevronRight aria-hidden="true" :size="18" />
          </button>
        </div>
        <div class="filter-overview-group">
          <button
            type="button"
            class="filter-overview-row"
            data-focus="muscle"
            @click="showPanel('muscle', 'back')"
          >
            <PersonStanding aria-hidden="true" :size="22" /><span>{{
              t("dialogs.picker.muscleGroup")
            }}</span
            ><small>{{ categoryLabel(draft.category, t) }}</small
            ><ChevronRight aria-hidden="true" :size="18" />
          </button>
          <button
            type="button"
            class="filter-overview-row"
            data-focus="secondary"
            @click="showPanel('secondary', 'back')"
          >
            <Layers aria-hidden="true" :size="22" /><span>{{
              t("dialogs.picker.secondaryMuscles")
            }}</span
            ><small>{{ secondarySummary }}</small
            ><ChevronRight aria-hidden="true" :size="18" />
          </button>
        </div>
        <div class="filter-overview-group">
          <button
            type="button"
            class="filter-overview-row"
            data-focus="kind"
            @click="showPanel('kind', 'back')"
          >
            <Shapes aria-hidden="true" :size="22" /><span>{{
              t("dialogs.picker.kind")
            }}</span
            ><small>{{ kindLabel(draft.kind, t) }}</small
            ><ChevronRight aria-hidden="true" :size="18" />
          </button>
        </div>
        <div class="picker-actions">
          <BaseButton
            unstyled
            class="btn primary full-width"
            type="submit"
            :disabled="saving || !draft.name.trim()"
          >
            <Check :size="17" />{{ t("dialogs.picker.createSubmit") }}
          </BaseButton>
        </div>
        <p v-if="error" class="field-error" role="alert">{{ error }}</p>
      </form>
      <template v-else>
        <div class="filter-subview-actions">
          <button
            type="button"
            class="text-button"
            data-focus="back"
            @click="showPanel('overview', panel)"
          >
            <ArrowLeft aria-hidden="true" :size="18" />{{
              t("dialogs.picker.back")
            }}
          </button>
          <button
            v-if="panel === 'secondary'"
            type="button"
            class="text-button"
            :aria-pressed="!draft.secondaryCategories.length"
            @click="update({ ...draft, secondaryCategories: [] }, 'secondary')"
          >
            {{ t("dialogs.picker.none") }}
          </button>
          <button
            v-else-if="panel === 'kind'"
            type="button"
            class="text-button"
            :aria-pressed="!draft.kind"
            @click="update({ ...draft, kind: undefined }, 'kind')"
          >
            {{ t("dialogs.picker.notSet") }}
          </button>
        </div>
        <div v-if="panel === 'equipment'" class="filter-card-grid">
          <button
            v-for="option in equipmentTypes"
            :key="option"
            type="button"
            class="filter-choice-card"
            :aria-pressed="draft.equipment === option"
            @click="update({ ...draft, equipment: option }, 'equipment')"
          >
            <img
              v-if="equipmentIllustrations.get(option)"
              :src="equipmentIllustrations.get(option)"
              alt=""
              loading="lazy"
            />
            <Dumbbell
              v-else
              class="filter-fallback"
              aria-hidden="true"
              :size="48"
            />
            <span>{{ equipmentLabel(option, t) }}</span
            ><Check
              v-if="draft.equipment === option"
              class="filter-choice-check"
              aria-hidden="true"
              :size="18"
            />
          </button>
        </div>
        <template v-else-if="panel === 'muscle' || panel === 'secondary'">
          <p v-if="panel === 'secondary'" class="exercise-create-hint">
            {{ t("dialogs.picker.secondaryHint") }}
          </p>
          <div class="filter-card-grid">
            <button
              v-for="option in panel === 'muscle'
                ? muscleGroups
                : secondaryOptions"
              :key="option"
              type="button"
              class="filter-choice-card"
              :aria-pressed="
                panel === 'muscle'
                  ? draft.category === option
                  : draft.secondaryCategories.includes(option)
              "
              @click="
                panel === 'muscle'
                  ? update(chooseCategory(draft, option), 'muscle')
                  : (draft = toggleSecondary(draft, option))
              "
            >
              <BaseMuscleMap
                v-if="muscleIllustrations.has(option)"
                presentation="illustration"
                :view="muscleIllustrations.get(option)?.view"
                :highlights="muscleIllustrations.get(option)?.highlights"
              />
              <PersonStanding
                v-else
                class="filter-fallback"
                aria-hidden="true"
                :size="48"
              />
              <span>{{ categoryLabel(option, t) }}</span
              ><Check
                v-if="
                  panel === 'muscle'
                    ? draft.category === option
                    : draft.secondaryCategories.includes(option)
                "
                class="filter-choice-check"
                aria-hidden="true"
                :size="18"
              />
            </button>
          </div>
          <BaseButton
            v-if="panel === 'secondary'"
            unstyled
            class="btn primary full-width"
            @click="showPanel('overview', 'secondary')"
          >
            {{ t("dialogs.picker.done") }}
          </BaseButton>
        </template>
        <div v-else class="filter-card-grid">
          <button
            v-for="option in exerciseKinds"
            :key="option"
            type="button"
            class="filter-choice-card exercise-kind-card"
            :aria-pressed="draft.kind === option"
            @click="update({ ...draft, kind: option }, 'kind')"
          >
            <span>{{ kindLabel(option, t) }}</span>
            <small>{{
              option === "compound"
                ? t("exercises.kinds.compoundHint")
                : t("exercises.kinds.isolationHint")
            }}</small
            ><Check
              v-if="draft.kind === option"
              class="filter-choice-check"
              aria-hidden="true"
              :size="18"
            />
          </button>
        </div>
      </template>
    </div>
  </BaseSheet>
</template>
