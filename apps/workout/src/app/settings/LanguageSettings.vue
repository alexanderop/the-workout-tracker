<script setup lang="ts">
import { useTranslation } from "../i18n";
import { endonyms, languages } from "./language";
import { useLanguageSetting } from "./useLanguage";

const { language, setLanguage, loadFailed } = useLanguageSetting();
const { t } = useTranslation();
const label = (id: (typeof languages)[number]) =>
  id === "system" ? t("shell.language.system") : endonyms[id];
</script>

<template>
  <section class="settings-section" aria-labelledby="language-title">
    <h2 id="language-title">{{ t("shell.language.title") }}</h2>
    <p class="muted small">{{ t("shell.language.help") }}</p>
    <fieldset class="choice-group">
      <legend class="choice-legend">{{ t("shell.language.legend") }}</legend>
      <div class="language-options">
        <label v-for="id in languages" :key="id" class="language-option">
          <input
            type="radio"
            name="language"
            :value="id"
            :checked="language === id"
            @change="setLanguage(id)"
          />
          <span>{{ label(id) }}</span>
        </label>
      </div>
    </fieldset>
    <p v-if="loadFailed" class="field-error" role="alert">
      {{ t("shell.language.loadFailed") }}
    </p>
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
.language-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.language-option {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--muted);
  font-size: 13px;
  font-weight: 550;
  text-align: center;
}
.language-option:has(input:checked) {
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
.language-option:has(input:focus-visible) {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
