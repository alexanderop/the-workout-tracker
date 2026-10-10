<script setup lang="ts">
import { computed } from "vue";
import type { Component } from "vue";
import { BaseSegmentedControl } from "@form/ui";
import { Check, Monitor, Moon, Sun } from "@lucide/vue";
import { useTranslation } from "../../i18n";
import { accents, themes, useAppearance } from "../appearance";

const { theme, accent, setTheme, setAccent } = useAppearance();
const { t } = useTranslation();
const themeIcons = { system: Monitor, light: Sun, dark: Moon } satisfies Record<
  (typeof themes)[number],
  Component
>;
const themeOptions = computed(() =>
  themes.map((id) => ({
    id,
    label: t(`shell.appearance.themes.${id}`),
    icon: themeIcons[id],
  })),
);
</script>

<template>
  <section class="settings-section">
    <h2 class="settings-label">{{ t("shell.appearance.theme") }}</h2>
    <BaseSegmentedControl
      :legend="t('shell.appearance.theme')"
      name="theme"
      :options="themeOptions"
      :model-value="theme"
      @update:model-value="setTheme"
    />
  </section>
  <section class="settings-section">
    <h2 class="settings-label">{{ t("shell.appearance.accent") }}</h2>
    <fieldset class="accent-options">
      <legend class="sr-only">{{ t("shell.appearance.accent") }}</legend>
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
        <span>{{ t(`shell.appearance.accents.${id}`) }}</span>
      </label>
    </fieldset>
    <p class="settings-help">{{ t("shell.appearance.help") }}</p>
  </section>
</template>

<style scoped>
.accent-options {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 4px;
  min-width: 0;
  margin: 0;
  padding: 12px 4px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: 0 1px 2px var(--ui-shadow-soft);
}
.accent-option {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  color: var(--muted);
  font-size: 13px;
}
.accent-option:has(input:checked) {
  color: var(--text);
  font-weight: 600;
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
.accent-option:has(input:focus-visible) {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: 8px;
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
