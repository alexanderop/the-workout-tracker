<script setup lang="ts">
import {
  BaseButton,
  BaseEmptyState,
  BaseInput,
  BaseListGroup,
  BaseListRow,
} from "@form/ui";
import { useTemplateRef, computed, onMounted, ref, watch, nextTick } from "vue";
import {
  Check,
  X,
  Search,
  SlidersHorizontal,
  ArrowDownAZ,
  ArrowUpAZ,
} from "@lucide/vue";
import { useTranslation } from "../../../i18n";
import type { Exercise } from "../domain";
import { categoryLabel, equipmentLabel } from "./exerciseLabels";
import ExerciseThumbnail from "./ExerciseThumbnail.vue";
import ExerciseFilterSheet from "./ExerciseFilterSheet.vue";
import {
  emptyCatalogFilters,
  filterCatalog,
  type CatalogFilters,
  type CatalogSort,
} from "./catalogFilters";
const {
  exercises,
  selected,
  busy,
  initialSearch = "",
} = defineProps<{
  exercises: readonly Exercise[];
  selected?: readonly string[];
  busy?: boolean;
  initialSearch?: string;
}>();
const emit = defineEmits<{ toggle: [id: string] }>();
const { t } = useTranslation();
const controls = useTemplateRef<HTMLElement>("controls");
const list = useTemplateRef<InstanceType<typeof BaseListGroup>>("list");
const filterButton =
  useTemplateRef<InstanceType<typeof BaseButton>>("filterButton");
const selectionTray = useTemplateRef<HTMLElement>("selectionTray");
const search = ref(initialSearch);
watch(
  () => initialSearch,
  (value) => {
    search.value = value;
  },
);
const filters = ref<CatalogFilters>(emptyCatalogFilters);
const sort = ref<CatalogSort>("ascending");
const filtersOpen = ref(false);
const selectedExercises = computed(() =>
  (selected ?? []).flatMap((id) => {
    const exercise = exercises.find((entry) => entry.id === id);
    return exercise ? [exercise] : [];
  }),
);
const appliedFilters = computed(() => {
  const chips: { key: keyof CatalogFilters; label: string }[] = [];
  if (filters.value.equipment)
    chips.push({
      key: "equipment",
      label: equipmentLabel(filters.value.equipment, t),
    });
  if (filters.value.category)
    chips.push({
      key: "category",
      label: categoryLabel(filters.value.category, t),
    });
  if (filters.value.onlyCustom)
    chips.push({ key: "onlyCustom", label: t("exercises.catalog.onlyCustom") });
  return chips;
});
async function removeFilter(key: keyof CatalogFilters) {
  filters.value = { ...filters.value, [key]: emptyCatalogFilters[key] };
  await nextTick();
  filterButton.value?.$el.focus();
}
async function removeSelection(id: string) {
  emit("toggle", id);
  await nextTick();
  const remaining =
    selectionTray.value?.querySelector<HTMLButtonElement>("button");
  if (remaining) {
    remaining.focus();
    return;
  }
  controls.value?.querySelector<HTMLInputElement>("input")?.focus();
}
const groups = computed(() =>
  [...new Set(exercises.map((exercise) => exercise.category))].sort(),
);
const equipmentOptions = computed(() =>
  [...new Set(exercises.map((exercise) => exercise.equipment))].sort(),
);
const results = computed(() =>
  filterCatalog(exercises, {
    search: search.value,
    filters: filters.value,
    sort: sort.value,
    labels: (exercise) => [
      categoryLabel(exercise.category, t),
      equipmentLabel(exercise.equipment, t),
    ],
  }),
);
const summary = computed(() => {
  const found = t("exercises.catalog.resultCount", results.value.length);
  if (!appliedFilters.value.length) return found;
  return t("exercises.catalog.summary", {
    results: found,
    filters: t("exercises.catalog.filterCount", appliedFilters.value.length),
  });
});
const sortLabels = computed(() => {
  const ascending = t("exercises.catalog.sortAscending");
  const descending = t("exercises.catalog.sortDescending");
  return sort.value === "ascending"
    ? { current: ascending, next: descending }
    : { current: descending, next: ascending };
});
watch([search, filters, sort], () => list.value?.scrollToTop());
// The first screenful of rows mounts with the page; the rest follows after the
// first frame, so the heading and search field paint before 89 rows are built.
const firstScreenRows = 14;
const allRowsShown = ref(false);
onMounted(() =>
  requestAnimationFrame(() =>
    setTimeout(() => {
      allRowsShown.value = true;
    }),
  ),
);
const shownRows = computed(() =>
  allRowsShown.value ? results.value : results.value.slice(0, firstScreenRows),
);
async function clearSearchAndFilters() {
  search.value = "";
  filters.value = emptyCatalogFilters;
  await nextTick();
  controls.value?.querySelector<HTMLInputElement>("input")?.focus();
}
</script>
<template>
  <div ref="controls" class="catalog-controls">
    <div class="search-field picker-search">
      <Search :size="18" /><BaseInput
        v-model="search"
        :aria-label="t('exercises.catalog.searchLabel')"
        :placeholder="t('exercises.catalog.searchPlaceholder')"
        @keydown.enter.prevent
      />
    </div>
  </div>
  <div class="catalog-toolbar">
    <BaseButton
      type="button"
      ref="filterButton"
      variant="link"
      size="sm"
      class="catalog-filter-button"
      :aria-label="t('exercises.catalog.filtersButton', { summary })"
      aria-haspopup="dialog"
      @click="filtersOpen = true"
    >
      <span role="status">{{ summary }}</span>
      <SlidersHorizontal :size="20" aria-hidden="true" />
    </BaseButton>
    <BaseButton
      type="button"
      variant="link"
      size="sm"
      class="catalog-sort-button"
      :aria-label="t('exercises.catalog.sortButton', sortLabels)"
      @click="sort = sort === 'ascending' ? 'descending' : 'ascending'"
    >
      {{ sortLabels.current
      }}<ArrowDownAZ
        v-if="sort === 'ascending'"
        :size="20"
        aria-hidden="true"
      /><ArrowUpAZ v-else :size="20" aria-hidden="true" />
    </BaseButton>
  </div>
  <div
    v-if="appliedFilters.length"
    class="catalog-chips"
    :aria-label="t('exercises.catalog.appliedFilters')"
    role="group"
  >
    <BaseButton
      v-for="filter in appliedFilters"
      :key="filter.key"
      type="button"
      variant="outline"
      size="sm"
      class="catalog-chip"
      :aria-label="
        t('exercises.catalog.removeFilter', { filter: filter.label })
      "
      @click="removeFilter(filter.key)"
    >
      {{ filter.label }}<X :size="16" aria-hidden="true" />
    </BaseButton>
  </div>
  <div
    v-if="selectedExercises.length"
    ref="selectionTray"
    class="catalog-selection"
  >
    <p class="catalog-selection-count muted small" role="status">
      {{ t("exercises.catalog.selectedCount", selectedExercises.length) }}
    </p>
    <div
      class="catalog-chips"
      role="group"
      :aria-label="t('exercises.catalog.selectedExercises')"
    >
      <BaseButton
        v-for="exercise in selectedExercises"
        :key="exercise.id"
        type="button"
        variant="outline"
        size="sm"
        class="catalog-chip"
        :disabled="busy"
        :aria-label="
          t('exercises.catalog.removeSelection', { name: exercise.name })
        "
        @click="removeSelection(exercise.id)"
      >
        {{ exercise.name }}<X :size="16" aria-hidden="true" />
      </BaseButton>
    </div>
  </div>
  <BaseListGroup ref="list" class="catalog-list" scroll>
    <BaseListRow
      v-for="exercise in shownRows"
      :key="exercise.id"
      class="catalog-row"
      density="compact"
      :as="selected ? 'button' : 'div'"
      :label="exercise.name"
      :selected="selected?.includes(exercise.id)"
      :disabled="selected ? busy : undefined"
      :aria-pressed="selected ? selected.includes(exercise.id) : undefined"
      @click="selected && emit('toggle', exercise.id)"
    >
      <template #leading
        ><ExerciseThumbnail :exercise="exercise" :size="52"
      /></template>
      <template #subtitle
        ><span
          ><span class="sr-only"
            >{{ categoryLabel(exercise.category, t) }} · </span
          >{{ equipmentLabel(exercise.equipment, t)
          }}<template v-if="exercise.custom">
            · {{ t("exercises.catalog.custom") }}</template
          ></span
        ></template
      >
      <template #trailing
        ><span v-if="selected" class="catalog-check"
          ><Check v-if="selected.includes(exercise.id)" :size="17" /></span
      ></template>
    </BaseListRow>
    <BaseEmptyState
      v-if="!exercises.length"
      size="compact"
      :heading-level="3"
      :title="t('exercises.catalog.empty')"
    />
    <BaseEmptyState
      v-else-if="!results.length"
      size="compact"
      :heading-level="3"
      :title="t('exercises.catalog.noMatches')"
    >
      <template #action
        ><BaseButton variant="link" @click="clearSearchAndFilters">{{
          t("exercises.catalog.clearAll")
        }}</BaseButton></template
      >
    </BaseEmptyState>
  </BaseListGroup>
  <ExerciseFilterSheet
    v-model="filters"
    :open="filtersOpen"
    :equipment="equipmentOptions"
    :categories="groups"
    @close="filtersOpen = false"
  />
</template>

<style scoped>
.catalog-check {
  display: grid;
  flex: 0 0 24px;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 1px solid var(--muted);
  border-radius: 50%;
  color: var(--ui-selected-text);
}
.catalog-row[data-selected] .catalog-check {
  border-color: var(--ui-selected-border);
}
</style>
