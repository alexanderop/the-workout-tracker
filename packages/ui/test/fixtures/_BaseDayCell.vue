<script setup lang="ts">
import { ref } from "vue";
import BaseDayCell from "../../src/day-cell/BaseDayCell.vue";

const selected = ref(12);
const days = [11, 12, 13];
</script>

<template>
  <main>
    <BaseDayCell
      weekday="Mon"
      :day="8"
      marked
      aria-label="Mon 8, one workout"
    />
    <div role="group" aria-label="October">
      <BaseDayCell
        v-for="day in days"
        :key="day"
        :day="day"
        :today="day === 13"
        :marked="day === 11"
        :selected="day === selected"
        :disabled="day > 13"
        :aria-label="`October ${day}`"
        @click="selected = day"
      />
      <BaseDayCell
        :day="14"
        :selected="false"
        disabled
        aria-label="October 14"
      />
    </div>
    <output data-testid="selected">{{ selected }}</output>
  </main>
</template>

<style scoped>
main,
div {
  display: flex;
  gap: var(--space-2);
  background: var(--ui-background);
  color: var(--ui-foreground);
}
</style>
