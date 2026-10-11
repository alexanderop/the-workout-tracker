<script setup lang="ts">
import { ArrowRight, ArrowUpRight, Dumbbell } from "@lucide/vue";
import { BaseButton } from "@form/ui";

defineProps<{
  direction: "focus" | "journal" | "compact";
  populated: boolean;
}>();
const emit = defineEmits<{ action: [label: string] }>();
</script>

<template>
  <section class="session" aria-label="Current workout">
    <div class="session-label">
      <span class="status-dot" />IN PROGRESS<span
        v-if="direction === 'compact'"
        class="session-date"
        >Today</span
      >
    </div>
    <div class="session-content">
      <div>
        <h2>{{ populated ? "Upper body" : "New workout" }}</h2>
        <p>
          {{
            populated
              ? "4 exercises · 3 of 12 sets logged"
              : "No sets logged yet"
          }}
        </p>
      </div>
      <div
        v-if="direction === 'focus'"
        class="session-symbol"
        aria-hidden="true"
      >
        <Dumbbell :size="34" :stroke-width="1.25" />
      </div>
    </div>
    <div v-if="populated" class="set-progress" aria-label="3 of 12 sets logged">
      <span v-for="set in 12" :key="set" :class="{ logged: set <= 3 }" />
    </div>
    <BaseButton
      v-if="direction !== 'journal'"
      class="continue-button"
      @click="emit('action', 'Continue workout')"
      >Continue workout<ArrowRight :size="18" aria-hidden="true"
    /></BaseButton>
    <button
      v-else
      class="editorial-continue"
      type="button"
      @click="emit('action', 'Continue workout')"
    >
      Continue workout<span
        ><ArrowUpRight :size="24" aria-hidden="true"
      /></span>
    </button>
  </section>
</template>

<style scoped>
h2,
p {
  margin: 0;
}
.session {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--surface);
}
.session-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--muted);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 1.3px;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}
.session-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin: var(--space-6) 0 var(--space-6);
}
h2 {
  font-size: var(--text-xl);
  font-weight: 550;
  letter-spacing: -0.8px;
}
.session p {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--muted);
  line-height: 1.5;
}
.session-symbol {
  color: var(--muted);
  transform: rotate(-15deg);
}
.continue-button {
  width: 100%;
  justify-content: space-between;
  min-height: 46px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}
.set-progress {
  display: flex;
  gap: var(--space-1);
  margin: 0 0 var(--space-6);
}
.set-progress span {
  height: 3px;
  flex: 1;
  border-radius: var(--radius-sm);
  background: var(--background);
}
.set-progress .logged {
  background: var(--accent);
}
.next-home--journal .session {
  padding: 0;
  background: none;
  border-radius: 0;
}
.next-home--journal .session-content {
  margin: var(--space-5) 0 0;
}
.next-home--journal h2 {
  font-size: var(--text-2xl);
  letter-spacing: -1.2px;
}
.next-home--journal .set-progress {
  margin-top: var(--space-6);
}
.next-home--journal .set-progress span {
  background: var(--surface);
}
.next-home--journal .set-progress .logged {
  background: var(--accent);
}
.editorial-continue {
  margin-top: var(--space-4);
  padding: 0 0 var(--space-5);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text);
  font-size: var(--text-sm);
  background: none;
  border: 0;
  border-bottom: 1px solid var(--border);
}
.editorial-continue > span {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  color: var(--background);
  background: var(--accent);
}
.next-home--compact .session {
  border: 1px solid var(--border);
  background: none;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
}
.session-date {
  margin-left: auto;
  font-size: var(--text-xs);
  letter-spacing: 0;
  font-weight: 400;
}
.next-home--compact .session-content {
  margin: var(--space-4) 0 var(--space-4);
}
.next-home--compact h2 {
  font-size: var(--text-lg);
}
.next-home--compact .set-progress span {
  background: var(--surface);
}
.next-home--compact .set-progress .logged {
  background: var(--accent);
}
.next-home--compact .continue-button {
  min-height: 44px;
}
@media (max-width: 350px) {
  .session {
    padding: var(--space-4);
  }
  .session-symbol {
    display: none;
  }
}
</style>
