<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { BaseSheet, BaseButton } from "@form/ui";
import SetRow from "./SetRow.vue";
import type { useTrainingSession } from "./useTrainingSession";
const { setId, training, busy } = defineProps<{
  setId: string | null;
  training: ReturnType<typeof useTrainingSession>;
  busy: boolean;
}>();
const emit = defineEmits<{
  close: [];
  cleared: [id: string];
  options: [id: string];
  select: [id: string];
}>();
const row = computed(() => (setId ? training.rows.get(setId) : undefined));
const confirmation = ref<"clear" | "discard" | null>(null);
watch(
  () => setId,
  () => {
    confirmation.value = null;
  },
);
function forRow(action: (id: string) => unknown) {
  if (row.value) action(row.value.set.id);
}
async function confirm() {
  if (confirmation.value === "discard" && row.value)
    training.useSaved(row.value.set.id);
  if (confirmation.value === "clear") await clear();
  confirmation.value = null;
}
async function clear() {
  if (!row.value) return;
  const id = row.value.set.id;
  if (await training.clearSet(id)) emit("cleared", id);
}
</script>
<template>
  <BaseSheet
    :open="!!row"
    :title="row ? `${row.exercise.name} · Set ${row.index + 1}` : 'Edit set'"
    description="Edit values without logging, or explicitly log this set. Zero reps records a failed attempt."
    @close="emit('close')"
  >
    <div v-if="row" class="workout-editor">
      <nav class="workout-set-nav" aria-label="Choose set to edit">
        <BaseButton
          v-for="(set, index) in row.exercise.sets"
          :key="set.id"
          variant="secondary"
          :aria-current="set.id === row.set.id ? 'true' : undefined"
          @click="emit('select', set.id)"
          >Set {{ index + 1 }}</BaseButton
        >
      </nav>
      <SetRow
        :row="row"
        :busy="busy"
        :current="true"
        :dirty="training.dirty(row)"
        :conflict="training.conflict(row)"
        @edit="(values) => forRow((id) => training.edit(id, values))"
        @commit="forRow(training.commit)"
        @select="forRow(training.selectSet)"
        @options="forRow((id) => emit('options', id))"
        @discard="forRow(training.useSaved)"
        @keep="forRow(training.keepInput)"
        @recover="(draft) => forRow((id) => training.chooseDraft(id, draft))"
      />
      <BaseButton
        :disabled="busy || !row.touched"
        @click="training.commit(row.set.id, true)"
        >Save values without logging</BaseButton
      >
      <BaseButton
        v-if="row.set.completed"
        variant="secondary"
        :disabled="busy || row.touched"
        @click="training.undoSet(row.set.id)"
        >Undo log</BaseButton
      >
      <BaseButton
        v-if="row.set.completed"
        variant="secondary"
        :disabled="busy"
        @click="confirmation = 'clear'"
        >Clear logged set</BaseButton
      >
      <BaseButton
        v-if="row.touched"
        variant="ghost"
        :disabled="busy"
        @click="confirmation = 'discard'"
        >Discard input changes</BaseButton
      >
      <BaseButton variant="ghost" @click="emit('close')">Done</BaseButton>
    </div>
  </BaseSheet>
  <BaseSheet
    :open="confirmation !== null"
    :title="
      confirmation === 'clear' ? 'Clear logged set?' : 'Discard input changes?'
    "
    :description="
      confirmation === 'clear'
        ? 'This removes the logged result and returns the set to unfinished work.'
        : 'This deletes the input drafts for this set and restores its saved values.'
    "
    @close="confirmation = null"
  >
    <div class="form-actions">
      <BaseButton
        variant="secondary"
        :disabled="busy"
        @click="confirmation = null"
      >
        Cancel
      </BaseButton>
      <BaseButton :disabled="busy" @click="confirm">
        {{ confirmation === "clear" ? "Clear set" : "Discard input" }}
      </BaseButton>
    </div>
  </BaseSheet>
</template>
