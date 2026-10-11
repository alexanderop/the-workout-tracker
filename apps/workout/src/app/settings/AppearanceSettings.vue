<script setup lang="ts">
import { computed } from "vue";
import type { Component } from "vue";
import { BaseColorSwatch, BaseSegmentedControl } from "@form/ui";
import { Monitor, Moon, Sun } from "@lucide/vue";
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
      <BaseColorSwatch
        v-for="id in accents"
        :key="id"
        name="accent"
        :value="id"
        :accent="id"
        :model-value="accent"
        @update:model-value="setAccent(id)"
      >
        {{ t(`shell.appearance.accents.${id}`) }}
      </BaseColorSwatch>
    </fieldset>
    <p class="settings-help">{{ t("shell.appearance.help") }}</p>
  </section>
</template>

<style scoped>
.accent-options {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-1);
  min-width: 0;
  margin: 0;
  padding: var(--space-3) var(--space-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  box-shadow: 0 1px 2px var(--ui-shadow-soft);
}
</style>
