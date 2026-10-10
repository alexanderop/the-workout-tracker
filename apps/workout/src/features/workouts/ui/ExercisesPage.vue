<script setup lang="ts">
import { BaseButton } from "@form/ui";
import { useTranslation } from "../../../i18n";
import type { Exercise } from "../domain";
import ExerciseCatalog from "./ExerciseCatalog.vue";
defineProps<{ exercises: readonly Exercise[]; initialSearch?: string }>();
const emit = defineEmits<{ create: [] }>();
const { t } = useTranslation();
</script>
<template>
  <div class="page-heading exercise-library-heading">
    <div>
      <h1>{{ t("exercises.page.title") }}</h1>
    </div>
    <BaseButton
      type="button"
      unstyled
      class="text-button"
      @click="emit('create')"
    >
      {{ t("exercises.page.create") }}
    </BaseButton>
  </div>
  <section class="catalog-panel">
    <ExerciseCatalog :exercises="exercises" :initial-search="initialSearch" />
  </section>
</template>
