<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import {
  BaseActions,
  BaseBackLink,
  BaseButton,
  BaseChoiceChip,
  BaseInput,
  BaseListGroup,
  BaseListRow,
  BaseMuscleMap,
  BaseNotice,
  BaseSheet,
} from "@form/ui";
import { Check, Dumbbell, Layers, PersonStanding, Shapes } from "@lucide/vue";
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
const secondaryNames = computed(() =>
  draft.value.secondaryCategories.map((group) => categoryLabel(group, t)),
);
// The row shows the first group and a count so the label keeps its width;
// the accessible name lists every group.
const secondarySummary = computed(() => {
  const [first, ...rest] = secondaryNames.value;
  if (!first) return t("dialogs.picker.none");
  return rest.length
    ? t("dialogs.picker.secondaryMore", { first, count: rest.length })
    : first;
});
watch(
  () => open,
  (value) => {
    if (value) panel.value = "overview";
  },
);

// A sub-view opens at the top, so Back is never under the sticky header, and
// the overview comes back where it was left.
let overviewScroll = 0;
async function showPanel(next: Panel, focus: Panel | "back") {
  const sheet = content.value?.closest<HTMLElement>(".sheet");
  if (panel.value === "overview" && sheet) overviewScroll = sheet.scrollTop;
  panel.value = next;
  await nextTick();
  if (sheet) sheet.scrollTop = next === "overview" ? overviewScroll : 0;
  content.value
    ?.querySelector<HTMLElement>(`[data-focus="${focus}"]`)
    ?.focus({ preventScroll: true });
}
function update(next: ExerciseDraft, from: Panel) {
  draft.value = next;
  void showPanel("overview", from);
}
function isSelected(option: string): boolean {
  if (panel.value === "muscle") return draft.value.category === option;
  return draft.value.secondaryCategories.includes(option);
}
function chooseMuscle(option: string) {
  if (panel.value === "muscle") {
    update(chooseCategory(draft.value, option), "muscle");
    return;
  }
  draft.value = toggleSecondary(draft.value, option);
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
    <form
      v-if="panel === 'overview'"
      ref="content"
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
          class="exercise-create-name-input"
          required
          maxlength="80"
          :placeholder="t('dialogs.picker.namePlaceholder')"
          @update:model-value="draft = { ...draft, name: String($event) }"
        />
      </label>
      <BaseListGroup>
        <BaseListRow
          as="button"
          chevron
          data-focus="equipment"
          :icon="Dumbbell"
          :label="t('dialogs.picker.equipment')"
          :value="equipmentLabel(draft.equipment, t)"
          @click="showPanel('equipment', 'back')"
        />
        <BaseListRow
          as="button"
          chevron
          data-focus="muscle"
          :icon="PersonStanding"
          :label="t('dialogs.picker.muscleGroup')"
          :value="categoryLabel(draft.category, t)"
          @click="showPanel('muscle', 'back')"
        />
        <BaseListRow
          as="button"
          chevron
          data-focus="secondary"
          :icon="Layers"
          :label="t('dialogs.picker.secondaryMuscles')"
          :value="secondarySummary"
          :aria-label="
            secondaryNames.length > 1
              ? `${t('dialogs.picker.secondaryMuscles')} ${secondaryNames.join(', ')}`
              : undefined
          "
          @click="showPanel('secondary', 'back')"
        />
        <BaseListRow
          as="button"
          chevron
          data-focus="kind"
          :icon="Shapes"
          :label="t('dialogs.picker.kind')"
          :value="kindLabel(draft.kind, t)"
          @click="showPanel('kind', 'back')"
        />
      </BaseListGroup>
      <BaseNotice v-if="error" tone="danger">{{ error }}</BaseNotice>
      <BaseActions sticky>
        <BaseButton type="submit" :disabled="saving || !draft.name.trim()">
          <Check :size="17" />{{ t("dialogs.picker.createSubmit") }}
        </BaseButton>
      </BaseActions>
    </form>
    <template v-else>
      <div ref="content" class="exercise-filters">
        <div class="filter-subview-actions">
          <BaseBackLink
            as="button"
            data-focus="back"
            @click="showPanel('overview', panel)"
            >{{ t("dialogs.picker.back") }}</BaseBackLink
          >
          <BaseButton
            v-if="panel === 'secondary'"
            type="button"
            variant="link"
            size="sm"
            :aria-pressed="!draft.secondaryCategories.length"
            @click="update({ ...draft, secondaryCategories: [] }, 'secondary')"
          >
            {{ t("dialogs.picker.none") }}
          </BaseButton>
          <BaseButton
            v-else-if="panel === 'kind'"
            type="button"
            variant="link"
            size="sm"
            :aria-pressed="!draft.kind"
            @click="update({ ...draft, kind: undefined }, 'kind')"
          >
            {{ t("dialogs.picker.notSet") }}
          </BaseButton>
        </div>
        <div v-if="panel === 'equipment'" class="filter-card-grid">
          <BaseChoiceChip
            v-for="option in equipmentTypes"
            :key="option"
            size="card"
            :model-value="draft.equipment === option"
            @update:model-value="
              update({ ...draft, equipment: option }, 'equipment')
            "
          >
            <template #media>
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
            </template>
            {{ equipmentLabel(option, t) }}
          </BaseChoiceChip>
        </div>
        <template v-else-if="panel === 'muscle' || panel === 'secondary'">
          <p v-if="panel === 'secondary'" class="exercise-create-hint">
            {{ t("dialogs.picker.secondaryHint") }}
          </p>
          <div class="filter-card-grid">
            <BaseChoiceChip
              v-for="option in panel === 'muscle'
                ? muscleGroups
                : secondaryOptions"
              :key="option"
              size="card"
              :model-value="isSelected(option)"
              @update:model-value="chooseMuscle(option)"
            >
              <template #media>
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
              </template>
              {{ categoryLabel(option, t) }}
            </BaseChoiceChip>
          </div>
        </template>
        <div v-else class="filter-card-grid">
          <BaseChoiceChip
            v-for="option in exerciseKinds"
            :key="option"
            size="card"
            class="exercise-kind-card"
            :model-value="draft.kind === option"
            @update:model-value="update({ ...draft, kind: option }, 'kind')"
          >
            <span class="exercise-kind-text">
              <span>{{ kindLabel(option, t) }}</span>
              <small>{{
                option === "compound"
                  ? t("exercises.kinds.compoundHint")
                  : t("exercises.kinds.isolationHint")
              }}</small>
            </span>
          </BaseChoiceChip>
        </div>
      </div>
      <BaseActions v-if="panel === 'secondary'" sticky>
        <BaseButton type="button" @click="showPanel('overview', 'secondary')">
          {{ t("dialogs.picker.done") }}
        </BaseButton>
      </BaseActions>
    </template>
  </BaseSheet>
</template>

<style scoped>
.exercise-create-form {
  display: grid;
  gap: var(--space-4);
}
.exercise-create-preview {
  display: grid;
  place-items: center;
  justify-self: center;
  width: 128px;
  height: 128px;
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  background: var(--surface);
  color: var(--muted);
}
.exercise-create-preview > * {
  max-width: 100%;
  max-height: 100%;
}
/* The label carries the large size: on touch screens inputs take
   max(16px, 100%) of their parent, so the name stays large there too. */
.exercise-create-name {
  display: grid;
  gap: var(--space-2);
  justify-items: center;
  font-size: var(--text-xl);
}
.exercise-create-name > span {
  color: var(--muted);
  font-size: var(--text-xs);
}
.exercise-create-name-input {
  height: auto;
  min-height: 44px;
  border-color: transparent;
  background: transparent;
  color: var(--text);
  font-size: var(--text-xl);
  font-weight: 600;
  letter-spacing: -0.02em;
  text-align: center;
}
.exercise-create-hint {
  margin: 0;
  color: var(--muted);
  font-size: var(--text-sm);
}
/* Type cards have no artwork: titles start at the top so they line up. */
.exercise-kind-card {
  justify-content: flex-start;
}
.exercise-kind-text {
  display: grid;
  gap: var(--space-1);
  width: 100%;
  text-align: start;
}
.exercise-kind-text small {
  color: var(--muted);
  font-size: var(--text-sm);
  font-weight: 400;
}
</style>
