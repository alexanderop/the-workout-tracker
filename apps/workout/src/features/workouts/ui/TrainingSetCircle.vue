<script setup lang="ts">
import { onUnmounted, useTemplateRef } from "vue";
import type { TrainingRow } from "./useTrainingSession";
const { row, busy, needsReview } = defineProps<{
  row: TrainingRow;
  busy: boolean;
  needsReview: boolean;
}>();
const emit = defineEmits<{ tap: []; edit: [] }>();
const button = useTemplateRef<HTMLButtonElement>("button");
let hold: ReturnType<typeof setTimeout> | undefined;
let held = false;
let pressing = false;
let origin = { x: 0, y: 0 };
function cancel() {
  clearTimeout(hold);
  pressing = false;
}
function start(event: PointerEvent) {
  if (event.button !== 0 || busy) return;
  held = false;
  pressing = true;
  origin = { x: event.clientX, y: event.clientY };
  hold = setTimeout(() => {
    held = true;
    emit("edit");
  }, 500);
}
function move(event: PointerEvent) {
  if (!pressing) return;
  if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) < 8)
    return;
  cancel();
  held = true;
}
function activate(event: MouseEvent) {
  cancel();
  if (held && event.detail !== 0) {
    held = false;
    return;
  }
  held = false;
  if (needsReview) {
    emit("edit");
    return;
  }
  emit("tap");
}
onUnmounted(cancel);
defineExpose({
  setId: row.set.id,
  focus: () => button.value?.focus({ preventScroll: true }),
});
</script>
<template>
  <button
    ref="button"
    type="button"
    class="workout-circle"
    :disabled="busy"
    :class="{ 'is-logged': row.set.completed, 'needs-review': needsReview }"
    :aria-label="`${row.exercise.name}, set ${row.index + 1}, ${row.set.reps} ${row.set.completed ? 'reps logged' : 'target reps'}, ${row.set.weightKg} kilograms. ${needsReview ? 'Review draft' : 'Tap to log or reduce reps'}`"
    @pointerdown="start"
    @pointermove="move"
    @pointerup="cancel"
    @pointercancel="cancel"
    @pointerleave="cancel"
    @contextmenu.prevent="emit('edit')"
    @keydown.e.prevent="emit('edit')"
    @click="activate"
  >
    <strong>{{ row.set.reps }}</strong
    ><small>{{
      needsReview ? "Review" : row.set.completed ? "reps" : "target"
    }}</small>
  </button>
</template>
