<script setup lang="ts">
import { computed, useAttrs } from "vue";
import {
  bodyViews,
  muscleRegions,
  type MuscleHighlight,
  type MuscleMapView,
  type MuscleRegion,
} from "./regions";
import { useUiText } from "../ui-text";

const {
  highlights = [],
  view = "both",
  interactive = false,
  disabled = false,
  presentation = "full",
} = defineProps<{
  highlights?: readonly MuscleHighlight[];
  view?: MuscleMapView;
  interactive?: boolean;
  disabled?: boolean;
  presentation?: "full" | "illustration";
}>();
const selected = defineModel<MuscleRegion | null>({ default: null });
const attrs = useAttrs();
const uiText = useUiText();
const text = computed(() => uiText.value.muscleMap);
const roles = computed(() => {
  const result: Partial<Record<MuscleRegion, MuscleHighlight["role"]>> = {};
  for (const { muscle, role } of highlights) {
    if (result[muscle] === "primary") continue;
    result[muscle] = role;
  }
  return result;
});
const visibleViews = computed(() =>
  bodyViews.filter((bodyView) => view === "both" || bodyView.id === view),
);
const rows = computed(() => {
  const visibleRegions = new Set(
    visibleViews.value.flatMap((bodyView) =>
      bodyView.regions.map((region) => region.id),
    ),
  );
  return muscleRegions
    .filter((id) => visibleRegions.has(id))
    .map((id) => {
      const role = roles.value[id];
      return {
        id,
        label: text.value.regions[id],
        involvement: role ? text.value[role] : text.value.notHighlighted,
      };
    });
});
function accessibleLabel(): string | undefined {
  if (
    attrs["aria-label"] !== undefined ||
    attrs["aria-labelledby"] !== undefined
  )
    return undefined;
  return text.value.label;
}
function select(region: MuscleRegion): void {
  if (disabled || !interactive) return;
  selected.value = selected.value === region ? null : region;
}
</script>

<template>
  <div
    class="ui-muscle-map"
    :class="{ 'ui-muscle-map-illustration': presentation === 'illustration' }"
    data-slot="muscle-map"
    :role="presentation === 'full' ? 'group' : undefined"
    :aria-hidden="presentation === 'illustration' ? true : undefined"
    :aria-label="accessibleLabel()"
  >
    <div class="ui-muscle-map-figures" aria-hidden="true">
      <div
        v-for="bodyView in visibleViews"
        :key="bodyView.id"
        class="ui-muscle-map-view"
      >
        <svg viewBox="0 0 180 340" focusable="false">
          <path
            class="ui-muscle-map-outline"
            d="M78 48 Q64 40 69 20 Q72 7 90 7 Q108 7 111 20 Q116 40 102 48 L105 57 Q137 56 144 84 L155 130 165 168 Q170 181 160 185 L149 174 128 122 119 108 116 148 127 179 128 213 119 247 121 280 117 312 125 328 Q114 337 102 329 L97 302 93 269 90 238 87 269 83 302 78 329 Q66 337 55 328 L63 312 59 280 61 247 52 213 53 179 64 148 61 108 52 122 31 174 20 185 Q10 181 15 168 L25 130 36 84 Q43 56 75 57Z"
          />
          <path
            v-for="region in bodyView.regions"
            :key="region.id"
            :d="region.path"
            class="ui-muscle-map-region"
            :class="{
              'is-highlighted': roles[region.id] !== undefined,
              'is-primary': roles[region.id] === 'primary',
              'is-selected': selected === region.id,
            }"
          />
        </svg>
        <span v-if="presentation === 'full'">{{ text[bodyView.id] }}</span>
      </div>
    </div>
    <div v-if="presentation === 'full'" class="ui-muscle-map-legend">
      <span><i class="is-primary" />{{ text.primary }}</span
      ><span><i class="is-supporting" />{{ text.supporting }}</span
      ><span><i />{{ text.notHighlighted }}</span>
    </div>
    <p v-if="interactive && presentation === 'full'" class="ui-muscle-map-hint">
      {{ text.hint }}
    </p>
    <ul v-if="presentation === 'full'" class="ui-muscle-map-list">
      <li v-for="region in rows" :key="region.id">
        <button
          v-if="interactive"
          type="button"
          :disabled="disabled"
          :aria-pressed="selected === region.id"
          @click="select(region.id)"
        >
          <span>{{ region.label }}</span
          ><small>{{ region.involvement }}</small>
        </button>
        <div v-else>
          <span>{{ region.label }}</span
          ><small>{{ region.involvement }}</small>
        </div>
      </li>
    </ul>
  </div>
</template>
