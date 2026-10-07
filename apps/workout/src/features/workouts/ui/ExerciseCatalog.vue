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
import type { Exercise } from "../domain";
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
const controls = useTemplateRef<HTMLElement>("controls");
const list = useTemplateRef<HTMLElement>("list");
const filterButton = useTemplateRef<HTMLButtonElement>("filterButton");
const selectionTray = useTemplateRef<HTMLElement>("selectionTray");
const search = ref(initialSearch);
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
    chips.push({ key: "equipment", label: filters.value.equipment });
  if (filters.value.category)
    chips.push({ key: "category", label: filters.value.category });
  if (filters.value.onlyCustom)
    chips.push({ key: "onlyCustom", label: "Only custom exercises" });
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
  filterCatalog(exercises, search.value, filters.value, sort.value),
);
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
        aria-label="Search exercises"
        placeholder="Find an exercise"
        @keydown.enter.prevent
      />
    </div>
  </div>
  <div class="catalog-toolbar">
    <button
      type="button"
      ref="filterButton"
      class="catalog-filter-button"
      aria-label="Filters"
      aria-haspopup="dialog"
      @click="filtersOpen = true"
    >
      <span role="status"
        >{{ results.length }}
        {{ results.length === 1 ? "exercise" : "exercises"
        }}<span v-if="appliedFilters.length">
          · {{ appliedFilters.length }}
          {{ appliedFilters.length === 1 ? "filter" : "filters" }}</span
        ></span
      >
      <SlidersHorizontal :size="20" aria-hidden="true" />
    </button>
    <button
      type="button"
      class="catalog-sort-button"
      :aria-label="sort === 'ascending' ? 'Sort Z to A' : 'Sort A to Z'"
      @click="sort = sort === 'ascending' ? 'descending' : 'ascending'"
    >
      {{ sort === "ascending" ? "A–Z" : "Z–A"
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
    aria-label="Applied filters"
    role="group"
  >
    <button
      v-for="filter in appliedFilters"
      :key="filter.key"
      type="button"
      class="catalog-chip"
      :aria-label="`Remove ${filter.label} filter`"
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
      {{ selectedExercises.length }} selected
    </p>
    <div class="catalog-chips" role="group" aria-label="Selected exercises">
      <button
        v-for="exercise in selectedExercises"
        :key="exercise.id"
        type="button"
        class="catalog-chip"
        :disabled="busy"
        :aria-label="`Remove ${exercise.name} from selection`"
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
          ><span class="sr-only">{{ exercise.category }} · </span
          >{{ exercise.equipment
          }}<span v-if="exercise.custom"> · Custom</span></small
        ></span
      >
      <span v-if="selected" class="catalog-check"
        ><Check v-if="selected.includes(exercise.id)" :size="17"
      /></span>
    </component>
    <div v-if="!results.length" class="empty-inline muted">
      <p>No matching exercises.</p>
      <button type="button" class="text-button" @click="clearSearchAndFilters">
        Clear search and filters
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
