<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Dumbbell } from "@lucide/vue";
import type { Exercise } from "../domain";
import { exerciseArtwork } from "./exerciseArtwork";
const { exercise } = defineProps<{ exercise?: Exercise }>();
const source = computed(() => exerciseArtwork(exercise));
const failed = ref(false);
watch(source, () => { failed.value = false; });
</script>
<template>
  <span class="exercise-thumbnail" aria-hidden="true">
    <img v-if="source && !failed" :src="source" alt="" width="64" height="64" loading="lazy" decoding="async" @error="failed = true" />
    <Dumbbell v-else :size="22" />
  </span>
</template>
<style scoped>
.exercise-thumbnail { display: grid; place-items: center; flex: 0 0 64px; width: 64px; height: 64px; overflow: hidden; border-radius: 10px; background: var(--surface); color: var(--muted); }
.exercise-thumbnail img { width: 100%; height: 100%; object-fit: contain; }
</style>
