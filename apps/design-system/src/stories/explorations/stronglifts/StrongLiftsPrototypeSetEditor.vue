<script setup lang="ts">
import { ref } from "vue";
import { BaseButton, BaseInputNumber, BaseSheet } from "@form/ui";
import type { CircleSet } from "./useCircleWorkout";
const { set, title } = defineProps<{ set: CircleSet; title: string }>();
const emit = defineEmits<{
  close: [];
  save: [weight: number, reps: number];
  clear: [];
}>();
const weight = ref(String(set.weight));
const reps = ref(String(set.reps ?? set.target));
</script>
<template>
  <BaseSheet
    open
    :title="title"
    description="Correct this individual set."
    @close="emit('close')"
  >
    <div class="sl-editor">
      <BaseInputNumber
        v-model="weight"
        label="Set weight"
        title="Set weight"
        unit="kg"
        :decimals="2"
        :preset-step="2.5"
      />
      <BaseInputNumber
        v-model="reps"
        :label="set.reps === null ? 'Target reps' : 'Completed reps'"
        title="Reps"
        :max="100"
      />
      <p>
        {{
          set.reps === null
            ? "This changes planned values only. Tap its circle afterward to record the target reps."
            : "Zero reps is a failed attempt. Clear the set if it was never attempted."
        }}
      </p>
      <BaseButton @click="emit('save', Number(weight), Number(reps))"
        >Save changes</BaseButton
      >
      <BaseButton
        v-if="set.reps !== null"
        variant="secondary"
        @click="emit('clear')"
        >Clear set</BaseButton
      >
    </div>
  </BaseSheet>
</template>
