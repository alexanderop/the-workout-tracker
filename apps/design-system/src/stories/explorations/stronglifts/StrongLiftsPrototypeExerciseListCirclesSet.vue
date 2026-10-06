<script setup lang="ts">
import { onUnmounted } from "vue";
import type { CircleSet } from "./useCircleWorkout";
const { set, exercise, number, editing } = defineProps<{ set: CircleSet; exercise: string; number: number; editing: boolean }>();
const emit = defineEmits<{ tap: []; edit: [] }>();
let timeout: ReturnType<typeof setTimeout> | undefined;
let held = false;
let origin = { x: 0, y: 0 };
function cancel() { clearTimeout(timeout); }
function start(event: PointerEvent) {
  if (event.button !== 0) return;
  held = false;
  origin = { x: event.clientX, y: event.clientY };
  timeout = setTimeout(() => { held = true; emit("edit"); }, 500);
}
function move(event: PointerEvent) {
  if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 8) { cancel(); held = true; }
}
function activate() {
  cancel();
  if (held) { held = false; return; }
  if (editing) { emit("edit"); return; }
  emit("tap");
}
onUnmounted(cancel);
</script>
<template>
  <button class="sl-circle" :class="{ 'sl-logged': set.reps !== null, 'sl-missed': set.reps !== null && set.reps < set.target }"
    :aria-label="`${exercise} set ${number}: ${set.reps === null ? 'not logged' : `${set.reps} reps`}. ${editing ? 'Edit set' : 'Tap to log or reduce reps'}`"
    @pointerdown="start" @pointermove="move" @pointerup="cancel" @pointercancel="cancel" @pointerleave="cancel"
    @contextmenu.prevent="emit('edit')" @keydown.e.prevent="emit('edit')" @click="activate">
    <span>{{ set.reps ?? set.target }}</span><small>{{ set.reps === null ? 'target' : 'reps' }}</small>
  </button>
</template>
