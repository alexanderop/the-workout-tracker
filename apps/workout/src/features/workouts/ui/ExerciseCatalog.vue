<script setup lang="ts">
import { BaseInput, BaseSelectNative, BaseButton } from "@form/ui";
import { useTemplateRef, computed, ref, watch } from "vue";
import { Check, Search } from "@lucide/vue";
import type { Exercise } from "../domain";
import ExerciseThumbnail from "./ExerciseThumbnail.vue";
const { exercises, selected, busy } = defineProps<{
  exercises: readonly Exercise[];
  selected?: readonly string[];
  busy?: boolean;
}>();
const emit = defineEmits<{ toggle: [id: string] }>();
const list = useTemplateRef<HTMLElement>("list");
const search = ref("");
const muscle = ref("");
const equipment = ref("");
const groups = computed(() =>
  [...new Set(exercises.map((exercise) => exercise.category))].sort(),
);
const equipmentOptions = computed(() =>
  [...new Set(exercises.map((exercise) => exercise.equipment))].sort(),
);
const results = computed(() =>
  exercises.filter(
    (exercise) =>
      (!muscle.value || exercise.category === muscle.value) &&
      (!equipment.value || exercise.equipment === equipment.value) &&
      `${exercise.name} ${exercise.category} ${exercise.equipment}`
        .toLowerCase()
        .includes(search.value.trim().toLowerCase()),
  ),
);
watch([search, muscle, equipment], () => {
  if (list.value) list.value.scrollTop = 0;
});
</script>
<template>
  <div class="catalog-controls">
    <div class="search-field picker-search">
      <Search :size="18" /><BaseInput
        v-model="search"
        aria-label="Search exercises"
        placeholder="Find an exercise"
        @keydown.enter.prevent
      />
    </div>
    <div class="catalog-filters">
      <label class="field"
        ><span>Muscle group</span
        ><BaseSelectNative v-model="muscle" class="input">
          <option value="">{{ selected ? "All" : "All muscles" }}</option>
          <option v-for="group in groups" :key="group">{{ group }}</option>
        </BaseSelectNative></label
      >
      <label class="field"
        ><span>Equipment</span
        ><BaseSelectNative v-model="equipment" class="input">
          <option value="">{{ selected ? "All" : "All equipment" }}</option>
          <option v-for="item in equipmentOptions" :key="item">
            {{ item }}
          </option>
        </BaseSelectNative></label
      >
    </div>
  </div>
  <p class="catalog-count muted small" role="status">
    {{ results.length }} exercises<span v-if="selected?.length">
      · {{ selected.length }} selected</span
    >
  </p>
  <div ref="list" class="picker-list catalog-list">
    <component
      :is="selected ? BaseButton : 'div'"
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
          >{{ exercise.category }} · {{ exercise.equipment
          }}<span v-if="exercise.custom"> · Custom</span></small
        ></span
      >
      <span v-if="selected" class="catalog-check"
        ><Check v-if="selected.includes(exercise.id)" :size="17"
      /></span>
    </component>
    <p v-if="!results.length" class="empty-inline muted">
      No matches. Try another filter or create your own exercise.
    </p>
  </div>
</template>
