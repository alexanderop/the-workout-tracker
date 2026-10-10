<script setup lang="ts">
import type { Component } from "vue";
import { Check, Monitor, Moon, Sun } from "@lucide/vue";
import {
  accents,
  themes,
  useAppearance,
  type Accent,
  type Theme,
} from "./appearance";

const { theme, accent, setTheme, setAccent } = useAppearance();
const themeOptions: Record<Theme, { label: string; icon: Component }> = {
  system: { label: "System", icon: Monitor },
  light: { label: "Light", icon: Sun },
  dark: { label: "Dark", icon: Moon },
};
const accentLabels: Record<Accent, string> = {
  blue: "Blue",
  teal: "Teal",
  violet: "Violet",
  pink: "Pink",
  sand: "Sand",
};
</script>

<template>
  <section class="settings-section" aria-labelledby="appearance-title">
    <h2 id="appearance-title">Appearance</h2>
    <p class="muted small">
      Follow your device or pick a theme and an accent color. The choice stays
      on this device.
    </p>
    <fieldset class="choice-group">
      <legend class="choice-legend">Theme</legend>
      <div class="theme-options">
        <label v-for="id in themes" :key="id" class="theme-option">
          <input
            type="radio"
            name="theme"
            :value="id"
            :checked="theme === id"
            @change="setTheme(id)"
          />
          <component
            :is="themeOptions[id].icon"
            :size="20"
            aria-hidden="true"
          />
          <span>{{ themeOptions[id].label }}</span>
        </label>
      </div>
    </fieldset>
    <fieldset class="choice-group">
      <legend class="choice-legend">Accent color</legend>
      <div class="accent-options">
        <label v-for="id in accents" :key="id" class="accent-option">
          <input
            type="radio"
            name="accent"
            :value="id"
            :checked="accent === id"
            @change="setAccent(id)"
          />
          <span class="swatch">
            <span class="dot" :data-accent="id">
              <Check :size="18" stroke-width="3" aria-hidden="true" />
            </span>
          </span>
          <span>{{ accentLabels[id] }}</span>
        </label>
      </div>
    </fieldset>
  </section>
</template>

<style scoped>
.choice-group {
  min-width: 0;
  margin: 18px 0 0;
  padding: 0;
  border: 0;
}
.choice-legend {
  margin-block-end: 10px;
  padding: 0;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}
.theme-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.theme-option,
.accent-option {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 550;
}
.theme-option {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
}
.theme-option:has(input:checked) {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--text);
}
/* The native radio covers its label, so the whole control is the target. */
input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}
:is(.theme-option, .accent-option):has(input:focus-visible) {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: 8px;
}
.accent-options {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 4px;
  padding: 12px 4px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
}
.accent-option {
  flex-direction: column;
  justify-content: flex-start;
  gap: 6px;
  font-weight: 400;
}
.accent-option:has(input:checked) {
  color: var(--text);
  font-weight: 600;
}
.swatch {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 2px solid transparent;
  border-radius: 50%;
}
.accent-option:has(input:checked) .swatch {
  border-color: var(--accent);
}
.dot {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--on-accent);
}
.dot svg {
  visibility: hidden;
}
.accent-option:has(input:checked) .dot svg {
  visibility: visible;
}
</style>
