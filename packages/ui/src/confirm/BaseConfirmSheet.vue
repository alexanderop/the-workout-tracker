<script setup lang="ts">
import { useTemplateRef, type ComponentPublicInstance } from "vue";
import BaseSheet from "../BaseSheet.vue";
import BaseActions from "../actions/BaseActions.vue";
import BaseButton from "../button/BaseButton.vue";
import BaseNotice from "../notice/BaseNotice.vue";

export type ConfirmIntent = "destructive" | "neutral";

// Every confirmation is this sheet. Only `destructive` uses the destructive
// button. Cancel is on the left (the top on phones) and takes focus when the
// sheet opens, so Enter never confirms by accident. Closing the sheet by Escape,
// the close button, the backdrop or a swipe cancels; none of them works while
// `busy`. Confirming never closes the sheet: the consumer closes it when the
// work succeeds and passes `error` when it fails. Focus returns to the opener.
const { intent, busy = false } = defineProps<{
  /** Required: `destructive` removes or discards data, `neutral` does not. */
  intent: ConfirmIntent;
  title: string;
  /** The consequence, in one or two sentences. */
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Work is running: disables both buttons and blocks dismissal. */
  busy?: boolean;
  /** Disables Confirm without implying work, such as a conflict to review. */
  confirmDisabled?: boolean;
  /** A failure to report. Announced at once; the sheet stays open. */
  error?: string;
}>();
const emit = defineEmits<{
  confirm: [];
  cancel: [];
  /** Preventing it keeps focus where the consumer puts it, not on the opener. */
  "close-auto-focus": [event: Event];
}>();
defineSlots<{ default?: () => unknown }>();
const open = defineModel<boolean>("open", { required: true });
const cancelButton = useTemplateRef<ComponentPublicInstance>("cancel");
function focusCancel(event: Event) {
  const element = cancelButton.value?.$el;
  if (!(element instanceof HTMLElement)) return;
  event.preventDefault();
  element.focus();
}
function cancel() {
  if (busy) return;
  open.value = false;
  emit("cancel");
}
</script>

<template>
  <BaseSheet
    :open="open"
    :title="title"
    :description="description"
    @open-auto-focus="focusCancel"
    @close-auto-focus="emit('close-auto-focus', $event)"
    @close="cancel"
  >
    <slot />
    <BaseNotice v-if="error" tone="danger" class="ui-confirm-error">{{
      error
    }}</BaseNotice>
    <BaseActions sticky>
      <BaseButton
        ref="cancel"
        type="button"
        variant="secondary"
        :disabled="busy"
        @click="cancel"
        >{{ cancelLabel }}</BaseButton
      >
      <BaseButton
        type="button"
        :variant="intent === 'destructive' ? 'destructive' : 'default'"
        :disabled="busy || confirmDisabled"
        @click="emit('confirm')"
        >{{ confirmLabel }}</BaseButton
      >
    </BaseActions>
  </BaseSheet>
</template>

<style scoped>
.ui-confirm-error {
  margin-block-start: var(--space-4);
}
</style>
