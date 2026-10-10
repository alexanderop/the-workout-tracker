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
const { exercise } = defineProps<{ exercise?: Exercise }>();
const source = computed(() => exerciseArtwork(exercise));
const failed = ref(false);
const ready = paintedAfterFirstFrame();
watch(source, () => {
  failed.value = false;
});
</script>
<template>
  <span class="exercise-thumbnail" aria-hidden="true">
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
  display: grid;
  place-items: center;
  flex: 0 0 64px;
  width: 64px;
  height: 64px;
  overflow: clip;
  border-radius: 10px;
  background: var(--surface);
  color: var(--muted);
}
.exercise-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
