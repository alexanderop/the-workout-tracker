<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from "vue";
import type { Component } from "vue";
import { BaseListGroup, BaseListRow } from "@form/ui";
import type { ListRowTone } from "@form/ui";
import {
  ArrowDownToLine,
  Clock3,
  Dumbbell,
  Languages,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
} from "@lucide/vue";
import { useTranslation } from "../../i18n";
import { useAppearance } from "../appearance";
import { useLanguageSetting } from "../useLanguage";
import type { SettingsSection } from "./sections";
import { appearanceSummary, languageLabel } from "./summaries";
import { useSectionLink } from "./useSectionLink";

type Row = {
  id: SettingsSection;
  icon: Component;
  tone: ListRowTone;
  value?: string | undefined;
};

const { restSeconds, autoRest, installed, offlineReady, returnedFrom } =
  defineProps<{
    autoRest: boolean;
    restSeconds: number;
    installed: boolean;
    offlineReady: boolean;
    returnedFrom?: string | undefined;
  }>();
const { t } = useTranslation();
const sectionLink = useSectionLink();
const { theme, accent } = useAppearance();
const { language } = useLanguageSetting();
const hub = useTemplateRef<HTMLElement>("hub");
const groups = computed<{ id: string; label?: string; rows: Row[] }[]>(() => [
  {
    id: "preferences",
    rows: [
      {
        id: "training",
        icon: Clock3,
        tone: "primary",
        value: autoRest
          ? t("settings.hub.restOn", { seconds: restSeconds })
          : t("settings.hub.restOff"),
      },
      {
        id: "appearance",
        icon: Sun,
        tone: "primary",
        value: appearanceSummary(
          { theme: theme.value, accent: accent.value },
          t,
        ),
      },
      {
        id: "language",
        icon: Languages,
        tone: "primary",
        value: languageLabel(language.value, t),
      },
    ],
  },
  {
    id: "device",
    label: t("settings.groups.device"),
    rows: [
      {
        id: "install",
        icon: ArrowDownToLine,
        tone: "primary",
        value: installed ? t("shell.install.settings.installed") : undefined,
      },
    ],
  },
  {
    id: "data",
    label: t("settings.groups.data"),
    rows: [
      { id: "export", icon: ArrowDownToLine, tone: "muted" },
      { id: "import", icon: Upload, tone: "muted" },
      { id: "delete", icon: Trash2, tone: "destructive" },
    ],
  },
]);

// Back from a detail page lands on the row that opened it. Only when focus was
// lost with the page: a tab link that is still focused keeps it.
onMounted(() => {
  const active = document.activeElement;
  if ((active && active !== document.body) || !returnedFrom) return;
  hub.value
    ?.querySelector<HTMLElement>(`[data-section="${returnedFrom}"]`)
    ?.focus({ preventScroll: true });
});
</script>

<template>
  <section ref="hub" class="settings-hub">
    <h1>{{ t("settings.title") }}</h1>
    <div class="settings-app">
      <span class="settings-mark"
        ><Dumbbell :size="28" aria-hidden="true"
      /></span>
      <div class="settings-identity">
        <strong>{{ t("settings.signoff.brand") }}</strong>
        <span>{{ t("settings.signoff.tagline") }}</span>
      </div>
      <span class="settings-badge" :data-ready="offlineReady || undefined">{{
        offlineReady
          ? t("settings.hub.offlineReady")
          : t("settings.hub.offlinePending")
      }}</span>
    </div>
    <BaseListGroup v-for="group in groups" :key="group.id" :label="group.label">
      <BaseListRow
        v-for="row in group.rows"
        :key="row.id"
        as="a"
        v-bind="sectionLink(row.id)"
        :data-section="row.id"
        chevron
        :icon="row.icon"
        :tone="row.tone"
        :label="t(`settings.sections.${row.id}`)"
        :value="row.value"
      />
    </BaseListGroup>
    <p class="settings-privacy">
      <ShieldCheck :size="16" aria-hidden="true" />
      <span>{{ t("settings.hub.privacy") }}</span>
    </p>
  </section>
</template>
