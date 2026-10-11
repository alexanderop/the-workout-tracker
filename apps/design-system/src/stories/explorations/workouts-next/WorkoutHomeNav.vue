<script setup lang="ts">
import { Dumbbell, Library, TrendingUp, Settings } from "@lucide/vue";

const emit = defineEmits<{ action: [label: string]; home: [] }>();
</script>

<template>
  <nav class="home-nav" aria-label="Main navigation">
    <button type="button" aria-current="page" @click="emit('home')">
      <Dumbbell :size="22" :stroke-width="1.6" /><span>Workouts</span>
    </button>
    <button type="button" @click="emit('action', 'Exercises')">
      <Library :size="22" :stroke-width="1.6" /><span>Exercises</span>
    </button>
    <button type="button" @click="emit('action', 'Progress')">
      <TrendingUp :size="22" :stroke-width="1.6" /><span>Progress</span>
    </button>
    <button type="button" @click="emit('action', 'Settings')">
      <Settings :size="22" :stroke-width="1.6" /><span>Settings</span>
    </button>
  </nav>
</template>

<style scoped>
.home-nav {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--border);
  padding: var(--space-3) var(--space-3) var(--space-4);
  gap: var(--space-1);
}
.home-nav button {
  display: grid;
  justify-items: center;
  align-content: center;
  gap: var(--space-2);
  min-height: 48px;
  padding: var(--space-1);
  border: 0;
  background: none;
  color: var(--muted);
  font-size: var(--text-xs);
}
.home-nav button[aria-current] {
  color: var(--accent);
}
.next-home--compact .home-nav button[aria-current] {
  border-radius: var(--radius-md);
  background: var(--surface);
}
@media (min-width: 700px) {
  .next-home:not(.is-framed) .home-nav {
    padding-inline: max(
      var(--space-6),
      calc(
        (
            100% -
              calc(
                var(--space-8) + var(--space-8) + var(--space-8) +
                  var(--space-8) + var(--space-8) + var(--space-8) +
                  var(--space-8) + var(--space-8) + var(--space-8) +
                  var(--space-8) + var(--space-8) + var(--space-8) +
                  var(--space-8) + var(--space-8) + var(--space-6) +
                  var(--space-1)
              )
          ) /
          2
      )
    );
  }
}
</style>
