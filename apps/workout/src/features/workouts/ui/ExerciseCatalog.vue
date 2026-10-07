<script setup lang="ts">
import { BaseInput, BaseButton } from "@form/ui";
import { useTemplateRef, computed, ref, watch, nextTick } from "vue";
import {
  Check,
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
const search = ref(initialSearch);
const filters = ref<CatalogFilters>(emptyCatalogFilters);
const sort = ref<CatalogSort>("ascending");
const filtersOpen = ref(false);
const filterCount = computed(
  () =>
    Number(Boolean(filters.value.category)) +
    Number(Boolean(filters.value.equipment)) +
    Number(filters.value.onlyCustom),
);
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
      class="catalog-filter-button"
      aria-label="Filters"
      aria-haspopup="dialog"
      @click="filtersOpen = true"
    >
      <span role="status"
        >{{ results.length }}
        {{ results.length === 1 ? "exercise" : "exercises"
        }}<span v-if="filterCount">
          · {{ filterCount }}
          {{ filterCount === 1 ? "filter" : "filters" }}</span
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
  <p
    v-if="selected?.length"
    class="catalog-selection-count muted small"
    role="status"
  >
    {{ selected.length }} selected
  </p>
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
