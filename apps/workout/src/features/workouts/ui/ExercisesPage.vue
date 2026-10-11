<script setup lang="ts">
import { BaseButton, BasePageHeader } from "@form/ui";
import { useTranslation } from "../../../i18n";
import type { Exercise } from "../domain";
import ExerciseCatalog from "./ExerciseCatalog.vue";
defineProps<{ exercises: readonly Exercise[]; initialSearch?: string }>();
const emit = defineEmits<{ create: [] }>();
const { t } = useTranslation();
</script>
<template>
  <BasePageHeader variant="root" :title="t('exercises.page.title')">
    <template #action>
      <BaseButton variant="link" @click="emit('create')">
        {{ t("exercises.page.create") }}
      </BaseButton>
    </template>
  </BasePageHeader>
  <section class="catalog-panel">
    <ExerciseCatalog :exercises="exercises" :initial-search="initialSearch" />
  </section>
</template>
