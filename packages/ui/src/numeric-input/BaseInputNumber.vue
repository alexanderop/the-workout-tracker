<script setup lang="ts">
import { computed, ref, useAttrs, useId, useTemplateRef, watch } from "vue";
import { DialogRoot } from "reka-ui";
import { Check } from "@lucide/vue";
import BaseButton from "../button/BaseButton.vue";
import NumericKeypad from "./NumericKeypad.vue";
import NumericPresets from "./NumericPresets.vue";
import BaseDialogTrigger from "../dialog/BaseDialogTrigger.vue";
import BaseDialogContent from "../dialog/BaseDialogContent.vue";
import BaseDialogTitle from "../dialog/BaseDialogTitle.vue";
import BaseDialogDescription from "../dialog/BaseDialogDescription.vue";
import BaseDialogClose from "../dialog/BaseDialogClose.vue";
import {
  beginEditing,
  editNumber,
  numericPresets,
  replaceNumber,
  validNumber,
} from "./editing";
import { useNumericText } from "./useNumericText";

defineOptions({ inheritAttrs: false });
const {
  modelValue,
  label,
  title,
  unit = "",
  min = 0,
  max = 1000,
  decimals = 0,
  presetStep = 1,
  disabled,
} = defineProps<{
  modelValue: string | number;
  label: string;
  title: string;
  unit?: string;
  /** Smallest accepted value. Values are non-negative, so use 0 or more. */
  min?: number;
  max?: number;
  decimals?: number;
  presetStep?: number;
  disabled?: boolean;
}>();
const emit = defineEmits<{
  "update:modelValue": [value: string];
  open: [];
  close: [];
}>();
const open = ref(false);
const draft = ref(beginEditing(modelValue));
const pasteIssue = ref("");
// Announced once a value is confirmed, not on every keypress; cleared when
// focus leaves the trigger so idle inputs add no status regions to the page.
const announcement = ref("");
const attrs = useAttrs();
const { text, hint, pasteHint, show } = useNumericText();
const display = useTemplateRef<HTMLElement>("display");
const hintId = useId();
const limits = computed(() => ({ min, max, decimals, presetStep }));
const presets = ref<number[]>([]);
const value = computed(() => validNumber(draft.value.text, limits.value));
watch(
  open,
  (isOpen) => {
    if (!isOpen) {
      emit("close");
      return;
    }
    draft.value = beginEditing(modelValue);
    pasteIssue.value = "";
    announcement.value = "";
    presets.value = numericPresets(modelValue, limits.value);
    emit("open");
  },
  { flush: "sync" },
);
watch(
  () => disabled,
  (isDisabled) => {
    if (isDisabled) open.value = false;
  },
);
function press(key: string) {
  pasteIssue.value = "";
  draft.value = editNumber(draft.value, key, limits.value);
}
function paste(event: ClipboardEvent) {
  event.preventDefault();
  const pasted = event.clipboardData?.getData("text/plain") ?? "";
  const next = replaceNumber(pasted, limits.value);
  pasteIssue.value = next ? "" : pasteHint(limits.value);
  if (next) draft.value = next;
}
function confirm(next = value.value) {
  if (disabled || next === null) return;
  emit("update:modelValue", String(next));
  announcement.value = text.value.announce({ title, value: next, unit });
  open.value = false;
}
// A consumer's aria-label wins over the generated "label: value" name.
function triggerLabel() {
  const own = attrs["aria-label"];
  const name = text.value.trigger({ label, value: show(modelValue), unit });
  return typeof own === "string" && own ? own : name;
}
function keyboard(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing)
    return;
  if (event.key === "Enter") {
    // Preserve native activation of Cancel, presets and keypad buttons.
    if (event.target instanceof Element && event.target.closest("button"))
      return;
    event.preventDefault();
    confirm();
    return;
  }
  if (
    /^\d$/.test(event.key) ||
    [".", ",", "Backspace", "Delete"].includes(event.key)
  ) {
    event.preventDefault();
    press(event.key);
  }
}
function focusDisplay(event: Event) {
  event.preventDefault();
  display.value?.focus();
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <BaseDialogTrigger as-child>
      <BaseButton
        v-bind="$attrs"
        type="button"
        class="ui-numeric-trigger"
        variant="secondary"
        :disabled="disabled"
        :aria-label="triggerLabel()"
        @blur="announcement = ''"
        >{{ modelValue === "" ? "—" : show(modelValue) }}</BaseButton
      >
    </BaseDialogTrigger>
    <span v-if="announcement" role="status" class="ui-visually-hidden">{{ announcement }}</span>
    <BaseDialogContent
      class="ui-numeric-dialog"
      overlay-class="ui-numeric-overlay"
      :show-close-button="false"
      @open-auto-focus="focusDisplay"
      @keydown="keyboard"
      @paste="paste"
    >
      <header class="ui-numeric-header">
        <div>
          <BaseDialogTitle class="ui-numeric-title">{{
            title
          }}</BaseDialogTitle>
          <BaseDialogDescription class="ui-numeric-description">{{
            label
          }}</BaseDialogDescription>
        </div>
        <BaseDialogClose as-child>
          <BaseButton type="button" variant="ghost" class="ui-numeric-cancel"
            >{{ text.cancel }}</BaseButton
          >
        </BaseDialogClose>
      </header>
      <div class="ui-numeric-body">
        <NumericPresets
          :presets="presets"
          :unit="unit"
          @pick="confirm"
        />
        <div
          ref="display"
          tabindex="-1"
          role="group"
          :aria-label="text.editor"
          :aria-describedby="hintId"
          class="ui-numeric-display"
        >
          <div>
            <span>{{ show(draft.text) || "—" }}</span
            ><small v-if="unit">{{ unit }}</small>
          </div>
          <p
            :id="hintId"
            :class="{ 'ui-numeric-error': value === null || pasteIssue !== '' }"
          >
            {{ pasteIssue || hint(draft, limits, unit) }}
          </p>
        </div>
        <NumericKeypad :decimals="decimals" @press="press" />
      </div>
      <BaseButton
        type="button"
        class="ui-numeric-confirm"
        :disabled="value === null || disabled"
        @click="confirm()"
      >
        <Check :size="18" />{{ text.confirm(title) }}
      </BaseButton>
    </BaseDialogContent>
  </DialogRoot>
</template>

<style scoped>
.ui-numeric-trigger {
  cursor: pointer;
  touch-action: manipulation;
}
:global(.ui-numeric-dialog) {
  z-index: 54;
  width: min(420px, calc(100% - 32px));
  max-width: none;
  max-height: calc(100dvh - 32px);
  overflow: clip;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: var(--ui-background);
  color: var(--ui-foreground);
  border: 1px solid var(--ui-border);
  border-radius: 16px;
  font-family: inherit;
}
:global(.ui-numeric-overlay) {
  z-index: 53;
}
.ui-numeric-body {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.ui-numeric-header,
.ui-numeric-confirm {
  flex-shrink: 0;
}
.ui-numeric-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.ui-numeric-title {
  font-size: 22px;
  font-weight: 550;
  letter-spacing: -0.6px;
}
.ui-numeric-description {
  margin-block-start: 8px;
  font-size: 12px;
  line-height: 1.5;
}
.ui-numeric-cancel {
  padding: 0 10px;
  min-height: 44px;
  color: var(--ui-muted-foreground);
  font-size: 12px;
}
.ui-numeric-display {
  padding: 16px 0;
  text-align: center;
  border-block: 1px solid var(--ui-border);
}
.ui-numeric-display > div {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 10px;
  overflow-wrap: anywhere;
}
.ui-numeric-display span {
  min-width: 0;
  font-size: clamp(30px, 9vw, 46px);
  line-height: 1.2;
  font-weight: 550;
  font-variant-numeric: tabular-nums;
  letter-spacing: -1px;
}
.ui-numeric-display small {
  color: var(--ui-muted-foreground);
  font-size: 16px;
}
.ui-numeric-display p {
  margin: 10px 0 0;
  min-height: 18px;
  color: var(--ui-muted-foreground);
  font-size: 11px;
}
.ui-numeric-display .ui-numeric-error {
  color: var(--ui-destructive);
}
.ui-numeric-confirm {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 48px;
  border-radius: 8px;
  background: var(--ui-primary);
  color: var(--ui-primary-foreground);
  font-size: 13px;
  font-weight: 550;
}
.ui-numeric-confirm:disabled {
  opacity: 0.5;
}
@media (max-width: 650px) {
  :global(.ui-numeric-dialog) {
    inset-block-start: auto;
    inset-block-end: 0;
    inset-inline-start: 0;
    transform: none;
    width: 100%;
    max-height: 100dvh;
    border-radius: 18px 18px 0 0;
    padding: 22px 20px calc(20px + env(safe-area-inset-bottom, 0px));
  }
}
@media (max-height: 700px) {
  :global(.ui-numeric-dialog),
  .ui-numeric-body {
    gap: 12px;
  }
  .ui-numeric-display {
    padding-block: 4px;
  }
}
@media (max-height: 600px) and (max-width: 650px) {
  :global(.ui-numeric-dialog) {
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  }
  .ui-numeric-description {
    margin-block-start: 4px;
  }
  .ui-numeric-display span {
    font-size: 30px;
  }
}
</style>
