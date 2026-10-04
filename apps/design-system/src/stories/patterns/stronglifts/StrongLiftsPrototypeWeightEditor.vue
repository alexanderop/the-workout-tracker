<script setup lang="ts">
import { ref } from "vue";
import { Button, NumericInput, Sheet } from "@form/ui";
import type { CircleExercise } from "./useCircleWorkout";
const { exercise } = defineProps<{ exercise: CircleExercise }>();
const emit = defineEmits<{ close: []; save: [weight: number, reps: number, sets: number] }>();
const count = ref(String(exercise.sets.length));
const target = ref(String(exercise.target));
const minimumSets = Math.max(1, exercise.sets.filter(set => set.reps !== null).length);
const weight = ref(String(exercise.weight));
function adjust(amount: number) { weight.value = String(Math.max(0, Number(weight.value) + amount)); }
</script>
<template>
  <Sheet :open="true" :title="`Configure ${exercise.name}`" description="Set up the remaining work. Logged sets are preserved." @close="emit('close')">
    <div class="sl-editor">
      <NumericInput v-model="count" label="Number of sets" title="Number of sets" :min="minimumSets" :max="20" />
      <NumericInput v-model="target" label="Target reps per set" title="Target reps" :min="1" :max="100" />
      <NumericInput v-model="weight" label="Working weight" title="Working weight" unit="kg" :decimals="2" :preset-step="2.5" />
      <div class="sl-actions"><Button variant="secondary" @click="adjust(-2.5)">−2.5 kg</Button><Button variant="secondary" @click="adjust(2.5)">+2.5 kg</Button></div>
      <Button variant="ghost" @click="weight = String(Math.round(Number(weight) * 90) / 100)">Deload 10%</Button>
      <p>Weight includes the bar. New targets apply to unlogged sets. Reducing the count removes only unlogged sets; recorded work stays.</p>
      <Button @click="emit('save', Number(weight), Number(target), Number(count))">Apply exercise settings</Button>
    </div>
  </Sheet>
</template>
