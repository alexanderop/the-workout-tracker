<script setup lang="ts">
import { BaseButton, BaseListGroup, BaseListRow } from "@form/ui";
import { ArrowDownToLine, Check } from "@lucide/vue";
import { useTranslation } from "../../i18n";

defineProps<{
  installed: boolean;
  offlineReady: boolean;
  onInstall: () => void;
}>();
const { t } = useTranslation();
</script>

<template>
  <BaseListGroup>
    <BaseListRow
      :icon="ArrowDownToLine"
      tone="primary"
      :label="t('shell.install.settings.home')"
      :description="t('shell.install.settings.hint')"
    />
    <BaseListRow
      :icon="Check"
      :tone="offlineReady ? 'primary' : 'muted'"
      :label="
        offlineReady
          ? t('shell.install.settings.offlineReady')
          : t('shell.install.settings.offlineLater')
      "
    />
  </BaseListGroup>
  <BaseButton class="settings-action" :disabled="installed" @click="onInstall">
    <ArrowDownToLine :size="17" aria-hidden="true" />{{
      installed
        ? t("shell.install.settings.installed")
        : t("shell.install.settings.install")
    }}
  </BaseButton>
  <p class="settings-help">{{ t("shell.install.settings.privacy") }}</p>
</template>
