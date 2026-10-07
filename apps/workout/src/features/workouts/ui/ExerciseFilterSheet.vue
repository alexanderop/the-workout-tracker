<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { BaseSheet, BaseMuscleMap } from "@form/ui";
import {
  ArrowLeft,
  ChevronRight,
  Dumbbell,
  PersonStanding,
  Check,
} from "@lucide/vue";
import { emptyCatalogFilters, type CatalogFilters } from "./catalogFilters";
import {
  equipmentIllustrations,
  muscleIllustrations,
} from "./catalogIllustrations";

const { open, equipment, categories } = defineProps<{
  open: boolean;
  equipment: readonly string[];
  categories: readonly string[];
}>();
const filters = defineModel<CatalogFilters>({ required: true });
const emit = defineEmits<{ close: [] }>();
type Panel = "overview" | "equipment" | "muscle";
const panel = ref<Panel>("overview");
const content = useTemplateRef<HTMLElement>("content");
const title = computed(
  () =>
    ({ overview: "Filters", equipment: "Equipment", muscle: "Muscle group" })[
      panel.value
    ],
);
const options = computed(() =>
  panel.value === "equipment" ? equipment : categories,
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
        <div class="filter-overview-group">
          <button
            type="button"
            class="filter-overview-row"
            data-focus="equipment"
            @click="showPanel('equipment', 'back')"
          >
            <Dumbbell aria-hidden="true" :size="22" /><span>Equipment</span
            ><small>{{ filters.equipment || "All" }}</small
            ><ChevronRight aria-hidden="true" :size="18" />
          </button>
          <button
            type="button"
            class="filter-overview-row"
            data-focus="muscle"
            @click="showPanel('muscle', 'back')"
          >
            <PersonStanding aria-hidden="true" :size="22" /><span
              >Muscle group</span
            ><small>{{ filters.category || "All" }}</small
            ><ChevronRight aria-hidden="true" :size="18" />
          </button>
        </div>
        <label class="filter-custom-toggle">
          <span>Only custom exercises</span>
          <input
            type="checkbox"
            role="switch"
            :checked="filters.onlyCustom"
            @change="filters = { ...filters, onlyCustom: !filters.onlyCustom }"
          />
        </label>
        <div class="filter-sheet-actions">
          <button
            type="button"
            class="text-button"
            @click="filters = emptyCatalogFilters"
          >
            Reset filters
          </button>
          <button type="button" class="btn primary" @click="emit('close')">
            Done
          </button>
        </div>
      </template>
      <template v-else>
        <div class="filter-subview-actions">
          <button
            type="button"
            class="text-button"
            data-focus="back"
            @click="showPanel('overview', panel)"
          >
            <ArrowLeft aria-hidden="true" :size="18" />Back
          </button>
          <button
            type="button"
            class="text-button"
            :aria-pressed="selected('')"
            @click="choose('')"
          >
            All
          </button>
        </div>
        <div class="filter-card-grid">
          <button
            v-for="option in options"
            :key="option"
            type="button"
            class="filter-choice-card"
            :aria-pressed="selected(option)"
            @click="choose(option)"
          >
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
            <span>{{ option }}</span
            ><Check
              v-if="selected(option)"
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
