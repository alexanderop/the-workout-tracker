<script lang="ts">
import { ref } from "vue";

// The first screen paints before any artwork is requested, so the images do
// not compete with the text and controls for the network.
const painted = ref(false);
let scheduled = false;
function paintedAfterFirstFrame() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(() =>
      setTimeout(() => {
        painted.value = true;
      }),
    );
  }
  return painted;
}
</script>

<script setup lang="ts">
import { computed, watch } from "vue";
import { Dumbbell } from "@lucide/vue";
import type { Exercise } from "../domain";
import { exerciseArtwork } from "./exerciseArtwork";
// `size` is the edge of the square in px; the strip uses the 64px default and
// list rows the 52px artwork of the list-row contract.
const { exercise, size = 64 } = defineProps<{
  exercise?: Exercise;
  size?: number;
  /** No surface of its own, for a tile that draws the background. */
  plain?: boolean;
}>();
const source = computed(() => exerciseArtwork(exercise));
const failed = ref(false);
const ready = paintedAfterFirstFrame();
watch(source, () => {
  failed.value = false;
});
</script>
<template>
  <span
    class="exercise-thumbnail"
    :style="{ '--thumb': `${size}px` }"
    :data-plain="plain ? '' : undefined"
    aria-hidden="true"
  >
    <img
      v-if="source && !failed"
      :src="ready ? source : undefined"
      alt=""
      width="64"
      height="64"
      loading="lazy"
      decoding="async"
      @error="failed = true"
    />
    <Dumbbell v-else :size="22" />
  </span>
</template>
<style scoped>
.exercise-thumbnail {
  --thumb: 64px;
  display: grid;
  place-items: center;
  flex: 0 0 var(--thumb);
  width: var(--thumb);
  height: var(--thumb);
  overflow: clip;
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--muted);
}
.exercise-thumbnail[data-plain] {
  background: transparent;
}
.exercise-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
