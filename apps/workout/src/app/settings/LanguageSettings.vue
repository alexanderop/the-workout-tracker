<script setup lang="ts">
import { computed } from "vue";
import { BaseSegmentedControl } from "@form/ui";
import { useTranslation } from "../../i18n";
import { languages } from "../language";
import { useLanguageSetting } from "../useLanguage";
import { languageLabel } from "./summaries";

const { language, setLanguage, loadFailed } = useLanguageSetting();
const { t } = useTranslation();
const options = computed(() =>
  languages.map((id) => ({ id, label: languageLabel(id, t) })),
);
</script>

<template>
  <BaseSegmentedControl
    :legend="t('shell.language.legend')"
    name="language"
    :options="options"
    :model-value="language"
    @update:model-value="setLanguage"
  />
  <p class="settings-help">{{ t("shell.language.help") }}</p>
  <p v-if="loadFailed" class="field-error" role="alert">
    {{ t("shell.language.loadFailed") }}
  </p>
</template>
