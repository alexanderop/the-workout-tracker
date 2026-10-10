<script setup lang="ts">
import { BaseInputNumber, BaseButtonIcon } from "@form/ui";
import { Check, Undo2 } from "@lucide/vue";
import type { DemoSet } from "./demoSet";
const { sets, name, previousWeight, prescription = false } = defineProps<{ sets: DemoSet[]; name: string; previousWeight: number; prescription?: boolean }>();
const emit = defineEmits<{ edit: [id: number, field: "weight" | "reps", value: string | number]; toggle: [id: number] }>();
</script>
<template>
  <table class="research-table">
    <caption>{{ name }} sets</caption>
    <thead><tr><th scope="col">Set</th><th scope="col">{{ prescription ? 'Target' : 'Previous' }}</th><th scope="col">kg</th><th scope="col">Reps</th><th scope="col">Log</th></tr></thead>
    <tbody><tr v-for="(set, index) in sets" :key="set.id" :class="{ 'is-logged': set.logged }">
      <th scope="row">{{ index + 1 }}</th><td class="reference-value">{{ prescription ? '8 reps' : `${previousWeight} × 8` }}</td>
      <td><BaseInputNumber :model-value="set.weight" :label="`${name} set ${index + 1} weight`" title="Weight" unit="kg" :decimals="2" :disabled="set.logged" @update:model-value="emit('edit', set.id, 'weight', $event)" /></td>
      <td><BaseInputNumber :model-value="set.reps" :label="`${name} set ${index + 1} repetitions`" title="Repetitions" :min="1" :disabled="set.logged" @update:model-value="emit('edit', set.id, 'reps', $event)" /></td>
      <td><BaseButtonIcon :label="`${set.logged ? 'Undo' : 'Log'} ${name} set ${index + 1}`" @click="emit('toggle', set.id)"><Undo2 v-if="set.logged" :size="16" /><Check v-else :size="16" /></BaseButtonIcon></td>
    </tr></tbody>
  </table>
</template>
<style scoped>
.research-table { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 12px; }
caption { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
th { font-weight: 500; }
thead { color: var(--ui-muted-foreground); font-size: 10px; }
th, td { padding: 5px 2px; text-align: center; }
th:first-child { width: 26px; }
th:last-child { width: 44px; }
.reference-value { color: var(--ui-muted-foreground); font-size: 10px; }
.is-logged { background: var(--ui-secondary); color: var(--ui-primary); }
td :deep(.ui-numeric-trigger) { width: 100%; min-height: 44px; padding: 4px; font-size: 15px; }
</style>
