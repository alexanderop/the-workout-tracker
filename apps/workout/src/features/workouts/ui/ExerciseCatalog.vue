<script setup lang="ts">
import { BaseInput, BaseButton } from "@form/ui";
import { useTemplateRef, computed, ref, watch, nextTick } from "vue";
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
const list = useTemplateRef<HTMLElement>("list");
const filterButton = useTemplateRef<HTMLButtonElement>("filterButton");
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
  filterButton.value?.focus();
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
    labels: (exercise) =>
      `${categoryLabel(exercise.category, t)} ${equipmentLabel(exercise.equipment, t)}`,
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
watch([search, filters, sort], () => {
  if (list.value) list.value.scrollTop = 0;
});
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
    <button
      type="button"
      ref="filterButton"
      class="catalog-filter-button"
      :aria-label="t('exercises.catalog.filtersButton', { summary })"
      aria-haspopup="dialog"
      @click="filtersOpen = true"
    >
      <span role="status">{{ summary }}</span>
      <SlidersHorizontal :size="20" aria-hidden="true" />
    </button>
    <button
      type="button"
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
    </button>
  </div>
  <div
    v-if="appliedFilters.length"
    class="catalog-chips"
    :aria-label="t('exercises.catalog.appliedFilters')"
    role="group"
  >
    <button
      v-for="filter in appliedFilters"
      :key="filter.key"
      type="button"
      class="catalog-chip"
      :aria-label="
        t('exercises.catalog.removeFilter', { filter: filter.label })
      "
      @click="removeFilter(filter.key)"
    >
      {{ filter.label }}<X :size="16" aria-hidden="true" />
    </button>
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
      <button
        v-for="exercise in selectedExercises"
        :key="exercise.id"
        type="button"
        class="catalog-chip"
        :disabled="busy"
        :aria-label="
          t('exercises.catalog.removeSelection', { name: exercise.name })
        "
        @click="removeSelection(exercise.id)"
      >
        {{ exercise.name }}<X :size="16" aria-hidden="true" />
      </button>
    </div>
  </div>
  <div ref="list" class="picker-list catalog-list">
    <component
      :is="selected ? BaseButton : 'div'"
      :unstyled="selected ? true : undefined"
      v-for="exercise in results"
      :key="exercise.id"
      class="catalog-row"
      :class="{ 'is-selected': selected?.includes(exercise.id) }"
      :type="selected ? 'button' : undefined"
      :disabled="selected ? busy : undefined"
      :aria-pressed="selected ? selected.includes(exercise.id) : undefined"
      @click="selected && emit('toggle', exercise.id)"
    >
      <ExerciseThumbnail :exercise="exercise" />
      <span class="catalog-row-name"
        >{{ exercise.name
        }}<small
          ><span class="sr-only"
            >{{ categoryLabel(exercise.category, t) }} · </span
          >{{ equipmentLabel(exercise.equipment, t)
          }}<span v-if="exercise.custom">
            · {{ t("exercises.catalog.custom") }}</span
          ></small
        ></span
      >
      <span v-if="selected" class="catalog-check"
        ><Check v-if="selected.includes(exercise.id)" :size="17"
      /></span>
    </component>
    <div v-if="!exercises.length" class="empty-inline muted">
      <p>{{ t("exercises.catalog.empty") }}</p>
    </div>
    <div v-else-if="!results.length" class="empty-inline muted">
      <p>{{ t("exercises.catalog.noMatches") }}</p>
      <button type="button" class="text-button" @click="clearSearchAndFilters">
        {{ t("exercises.catalog.clearAll") }}
      </button>
    </div>
  </div>
  <ExerciseFilterSheet
    v-model="filters"
    :open="filtersOpen"
    :equipment="equipmentOptions"
    :categories="groups"
    @close="filtersOpen = false"
  />
</template>
