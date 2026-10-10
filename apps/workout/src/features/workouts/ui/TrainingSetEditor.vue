<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { BaseSheet, BaseButton } from "@form/ui";
import SetRow from "./SetRow.vue";
import type { useTrainingSession } from "./useTrainingSession";
import { useTranslation } from "../../../i18n";
const { setId, training, busy } = defineProps<{
  setId: string | null;
  training: ReturnType<typeof useTrainingSession>;
  busy: boolean;
}>();
const emit = defineEmits<{
  close: [];
  cleared: [id: string];
  options: [id: string];
  select: [id: string];
}>();
const { t } = useTranslation();
const row = computed(() => (setId ? training.rows.get(setId) : undefined));
const confirmation = ref<"clear" | "discard" | null>(null);
watch(
  () => setId,
  () => {
    confirmation.value = null;
  },
);
function forRow(action: (id: string) => unknown) {
  if (row.value) action(row.value.set.id);
}
async function confirm() {
  if (confirmation.value === "discard" && row.value)
    training.useSaved(row.value.set.id);
  if (confirmation.value === "clear") await clear();
  confirmation.value = null;
}
async function clear() {
  if (!row.value) return;
  const id = row.value.set.id;
  if (await training.clearSet(id)) emit("cleared", id);
}
</script>
<template>
  <BaseSheet
    :open="!!row"
    :title="
      row
        ? t('training.setEditor.title', {
            exercise: row.exercise.name,
            n: row.index + 1,
          })
        : t('training.setEditor.fallbackTitle')
    "
    :description="t('training.setEditor.description')"
    @close="emit('close')"
  >
    <div v-if="row" class="workout-editor">
      <nav class="workout-set-nav" :aria-label="t('training.setEditor.chooseSet')">
        <BaseButton
          v-for="(set, index) in row.exercise.sets"
          :key="set.id"
          variant="secondary"
          :aria-current="set.id === row.set.id ? 'true' : undefined"
          @click="emit('select', set.id)"
          >{{ t("training.setEditor.setButton", { n: index + 1 }) }}</BaseButton
        >
      </nav>
      <SetRow
        :row="row"
        :busy="busy"
        current
        :dirty="training.dirty(row)"
        :conflict="training.conflict(row)"
        @edit="(values) => forRow((id) => training.edit(id, values))"
        @commit="forRow(training.commit)"
        @select="forRow(training.selectSet)"
        @options="forRow((id) => emit('options', id))"
        @discard="forRow(training.useSaved)"
        @keep="forRow(training.keepInput)"
        @recover="(draft) => forRow((id) => training.chooseDraft(id, draft))"
      />
      <BaseButton
        :disabled="busy || !row.touched"
        @click="training.commit(row.set.id, true)"
        >{{ t("training.setEditor.saveValues") }}</BaseButton
      >
      <BaseButton
        v-if="row.set.completed"
        variant="secondary"
        :disabled="busy || row.touched"
        @click="training.undoSet(row.set.id)"
        >{{ t("training.setEditor.undoLog") }}</BaseButton
      >
      <BaseButton
        v-if="row.set.completed"
        variant="secondary"
        :disabled="busy"
        @click="confirmation = 'clear'"
        >{{ t("training.setEditor.clearLogged") }}</BaseButton
      >
      <BaseButton
        v-if="row.touched"
        variant="ghost"
        :disabled="busy"
        @click="confirmation = 'discard'"
        >{{ t("training.setEditor.discardChanges") }}</BaseButton
      >
      <BaseButton variant="ghost" @click="emit('close')">{{ t("training.setEditor.done") }}</BaseButton
      >
    </div>
  </BaseSheet>
  <BaseSheet
    :open="confirmation !== null"
    :title="
      confirmation === 'clear'
        ? t('training.setEditor.clearTitle')
        : t('training.discardInput.title')
    "
    :description="
      confirmation === 'clear'
        ? t('training.setEditor.clearDescription')
        : t('training.discardInput.description')
    "
    @close="confirmation = null"
  >
    <div class="form-actions">
      <BaseButton
        variant="secondary"
        :disabled="busy"
        @click="confirmation = null"
      >
        {{ t("training.setEditor.cancel") }}
      </BaseButton>
      <BaseButton :disabled="busy" @click="confirm">
        {{
          confirmation === "clear"
            ? t("training.setEditor.clearAction")
            : t("training.discardInput.action")
        }}
      </BaseButton>
    </div>
  </BaseSheet>
</template>
