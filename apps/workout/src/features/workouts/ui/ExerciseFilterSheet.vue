<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import {
  BaseBackLink,
  BaseButton,
  BaseChoiceChip,
  BaseListGroup,
  BaseListRow,
  BaseMuscleMap,
  BaseSheet,
  BaseSwitch,
} from "@form/ui";
import { Dumbbell, PersonStanding } from "@lucide/vue";
import { useTranslation } from "../../../i18n";
import { emptyCatalogFilters, type CatalogFilters } from "./catalogFilters";
import { categoryLabel, equipmentLabel } from "./exerciseLabels";
import {
  equipmentIllustrations,
  muscleIllustrations,
} from "./catalogIllustrations";

const { open, equipment, categories } = defineProps<{
  open: boolean;
  equipment: readonly string[];
  categories: readonly string[];
}>();
const emit = defineEmits<{ close: [] }>();
const { t } = useTranslation();
const filters = defineModel<CatalogFilters>({ required: true });
type Panel = "overview" | "equipment" | "muscle";
const panel = ref<Panel>("overview");
const content = useTemplateRef<HTMLElement>("content");
const title = computed(
  () =>
    ({
      overview: t("exercises.filters.title"),
      equipment: t("exercises.filters.equipment"),
      muscle: t("exercises.filters.muscleGroup"),
    })[panel.value],
);
const optionLabel = (option: string) =>
  panel.value === "equipment"
    ? equipmentLabel(option, t)
    : categoryLabel(option, t);
const options = computed(() =>
  panel.value === "equipment" ? equipment : categories,
);
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
function selected(option: string): boolean {
  return (
    (panel.value === "equipment"
      ? filters.value.equipment
      : filters.value.category) === option
  );
}
function choose(option: string) {
  const from = panel.value;
  filters.value = {
    ...filters.value,
    [from === "equipment" ? "equipment" : "category"]: option,
  };
  void showPanel("overview", from);
}
</script>
<template>
  <BaseSheet :open="open" :title="title" @close="emit('close')">
    <div ref="content" class="exercise-filters">
      <template v-if="panel === 'overview'">
        <BaseListGroup>
          <BaseListRow
            as="button"
            chevron
            data-focus="equipment"
            :icon="Dumbbell"
            :label="t('exercises.filters.equipment')"
            :value="
              filters.equipment
                ? equipmentLabel(filters.equipment, t)
                : t('exercises.filters.all')
            "
            @click="showPanel('equipment', 'back')"
          />
          <BaseListRow
            as="button"
            chevron
            data-focus="muscle"
            :icon="PersonStanding"
            :label="t('exercises.filters.muscleGroup')"
            :value="
              filters.category
                ? categoryLabel(filters.category, t)
                : t('exercises.filters.all')
            "
            @click="showPanel('muscle', 'back')"
          />
          <BaseListRow as="label" :label="t('exercises.catalog.onlyCustom')">
            <template #trailing>
              <BaseSwitch
                :model-value="filters.onlyCustom"
                @update:model-value="
                  filters = { ...filters, onlyCustom: $event }
                "
              />
            </template>
          </BaseListRow>
        </BaseListGroup>
        <div class="filter-sheet-actions">
          <BaseButton
            type="button"
            variant="link"
            size="sm"
            @click="filters = emptyCatalogFilters"
          >
            {{ t("exercises.filters.reset") }}
          </BaseButton>
          <BaseButton type="button" @click="emit('close')">
            {{ t("exercises.filters.done") }}
          </BaseButton>
        </div>
      </template>
      <template v-else>
        <div class="filter-subview-actions">
          <BaseBackLink
            as="button"
            data-focus="back"
            @click="showPanel('overview', panel)"
            >{{ t("exercises.filters.back") }}</BaseBackLink
          >
          <BaseButton
            type="button"
            variant="link"
            size="sm"
            :aria-pressed="selected('')"
            @click="choose('')"
          >
            {{ t("exercises.filters.all") }}
          </BaseButton>
        </div>
        <div class="filter-card-grid">
          <BaseChoiceChip
            v-for="option in options"
            :key="option"
            size="card"
            :model-value="selected(option)"
            @update:model-value="choose(option)"
          >
            <template #media>
              <template v-if="panel === 'equipment'">
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
              <BaseMuscleMap
                v-else-if="muscleIllustrations.has(option)"
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
            {{ optionLabel(option) }}
          </BaseChoiceChip>
        </div>
      </template>
    </div>
  </BaseSheet>
</template>
