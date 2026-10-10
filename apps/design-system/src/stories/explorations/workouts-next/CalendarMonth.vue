<script setup lang="ts">
import { ChevronLeft, ChevronRight } from "@lucide/vue";
defineProps<{
  title: string;
  weekdays: string[];
  cells: ({
    key: string;
    number: number;
    label: string;
    logged: boolean;
    today: boolean;
  } | null)[];
  selected: string;
  selectedLabel: string;
  session?: { name: string; detail: string };
  iconSize: number;
}>();
defineEmits<{ previous: []; next: []; select: [key: string] }>();
</script>

<template>
  <div class="calendar-heading month-heading">
    <h2>{{ title }}</h2>
    <div>
      <button
        type="button"
        aria-label="Previous month"
        @click="$emit('previous')"
      >
        <ChevronLeft :size="iconSize" /></button
      ><button type="button" aria-label="Next month" @click="$emit('next')">
        <ChevronRight :size="iconSize" />
      </button>
    </div>
  </div>
  <div class="month-scroll">
    <div class="month-grid">
      <span
        v-for="(label, index) in weekdays"
        :key="`label-${index}`"
        class="weekday"
        >{{ label }}</span
      ><template
        v-for="(date, index) in cells"
        :key="date?.key ?? `blank-${index}`"
        ><button
          v-if="date"
          type="button"
          :aria-label="`${date.label}${date.logged ? ', workout completed' : ', no completed workout'}`"
          :aria-current="date.today ? 'date' : undefined"
          :aria-pressed="selected === date.key"
          :class="{ selected: selected === date.key, today: date.today }"
          @click="$emit('select', date.key)"
        >
          {{ date.number }}<i :class="{ logged: date.logged }" /></button
        ><span v-else
      /></template>
    </div>
  </div>
  <div class="date-detail" role="status">
    <span>{{ selectedLabel }}</span
    ><strong>{{ session?.name ?? "No completed workouts" }}</strong
    ><small v-if="session">{{ session.detail }}</small>
  </div>
</template>

<style scoped>
button {
  cursor: pointer;
  font: inherit;
  color: inherit;
}
button:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}
.calendar-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
i {
  display: block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: none;
}
i.logged {
  background: var(--accent);
}
.month-heading h2 {
  margin: 0;
  font-size: 14px;
  letter-spacing: -0.2px;
  font-weight: 500;
}
.month-heading > div {
  display: flex;
}
.month-heading button {
  display: grid;
  place-items: center;
  min-width: 44px;
  min-height: 44px;
  background: none;
  border: 0;
}
.month-scroll {
  overflow-x: auto;
}
.month-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(44px, 1fr));
  min-width: 308px;
}
.weekday {
  text-align: center;
  font-size: 10px;
  padding: 10px 0;
  color: var(--muted);
}
.month-grid button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 44px;
  border: 1px solid transparent;
  background: none;
  font-size: 12px;
  border-radius: 10px;
}
.month-grid button.today {
  border-color: var(--accent);
}
.month-grid button.selected {
  background: var(--surface);
}
.month-grid button:hover {
  background: var(--surface);
}
.date-detail {
  display: grid;
  gap: 6px;
  margin-top: 15px;
  padding: 14px 0;
  border-top: 1px solid var(--border);
}
.date-detail > span {
  color: var(--muted);
  font-size: 10px;
}
.date-detail strong {
  font-size: 13px;
  font-weight: 500;
}
.date-detail small {
  color: var(--muted);
  font-size: 11px;
}
</style>
