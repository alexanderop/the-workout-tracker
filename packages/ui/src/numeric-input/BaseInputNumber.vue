<script setup lang="ts">
import { computed, ref, useId, useTemplateRef, watch } from "vue";
import { DialogRoot } from "reka-ui";
import { Check, Delete } from "@lucide/vue";
import BaseButton from "../button/BaseButton.vue";
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
  min?: number;
  max?: number;
  decimals?: number;
  presetStep?: number;
  disabled?: boolean;
}>();
const emit = defineEmits<{
  "update:modelValue": [value: string];
  open: [];
}>();
const open = ref(false);
const draft = ref(beginEditing(modelValue));
const pasteIssue = ref("");
const display = useTemplateRef<HTMLElement>("display");
const hintId = useId();
const limits = computed(() => ({
  min: min,
  max: max,
  decimals: decimals,
  presetStep: presetStep,
}));
const presets = ref<number[]>([]);
const value = computed(() => validNumber(draft.value.text, limits.value));
const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
watch(
  open,
  (isOpen) => {
    if (!isOpen) return;
    draft.value = beginEditing(modelValue);
    pasteIssue.value = "";
    presets.value = numericPresets(modelValue, limits.value);
    emit("open");
  },
  { flush: "sync" },
);
watch(
  () => disabled,
  (disabled) => {
    if (disabled) open.value = false;
  },
);
function press(key: string) {
  pasteIssue.value = "";
  draft.value = editNumber(draft.value, key, limits.value);
}
function paste(event: ClipboardEvent) {
  event.preventDefault();
  const next = replaceNumber(
    event.clipboardData?.getData("text/plain") ?? "",
    limits.value,
  );
  if (!next) {
    pasteIssue.value = `Paste ${decimals ? `a number with up to ${decimals} decimal places` : "a whole number"} from ${min} to ${max}.`;
    return;
  }
  draft.value = next;
  pasteIssue.value = "";
}
function confirm(next = value.value) {
  if (disabled || next === null) return;
  emit("update:modelValue", String(next));
  open.value = false;
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
        :aria-label="label"
        :aria-description="`Current value: ${modelValue === '' ? 'empty' : modelValue}${unit ? ` ${unit}` : ''}`"
        >{{ modelValue === "" ? "—" : modelValue }}</BaseButton
      >
    </BaseDialogTrigger>
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
            >Cancel</BaseButton
          >
        </BaseDialogClose>
      </header>
      <section class="ui-numeric-suggestions" aria-label="Suggested values">
        <p>Quick pick <span>Tap to use</span></p>
        <div class="ui-numeric-presets">
          <BaseButton
            v-for="preset in presets"
            :key="preset"
            type="button"
            variant="secondary"
            class="ui-numeric-preset"
            :aria-label="`Use ${preset}${unit ? ` ${unit}` : ''}`"
            @click="confirm(preset)"
            >{{ preset }}<small v-if="unit">{{ unit }}</small></BaseButton
          >
        </div>
      </section>
      <div
        ref="display"
        tabindex="-1"
        role="group"
        aria-label="Number editor"
        :aria-describedby="hintId"
        class="ui-numeric-display"
      >
        <div role="status" aria-live="polite" aria-atomic="true">
          <span>{{ draft.text || "—" }}</span
          ><small v-if="unit">{{ unit }}</small>
        </div>
        <p
          :id="hintId"
          :class="{ 'ui-numeric-error': value === null || pasteIssue !== '' }"
        >
          {{
            pasteIssue ||
            (value === null
              ? `Enter ${decimals ? "a value" : "a whole number"} from ${min} to ${max}${unit ? ` ${unit}` : ""}.`
              : draft.fresh
                ? "Type a new value to replace this one."
                : "Ready when you are.")
          }}
        </p>
      </div>
      <div class="ui-numeric-keypad" role="group" aria-label="Numeric keypad">
        <BaseButton
          v-for="digit in digits"
          :key="digit"
          type="button"
          variant="secondary"
          class="ui-numeric-key"
          @click="press(digit)"
          >{{ digit }}</BaseButton
        >
        <BaseButton
          v-if="decimals"
          type="button"
          variant="secondary"
          class="ui-numeric-key"
          aria-label="Decimal point"
          @click="press('.')"
          >.</BaseButton
        >
        <span v-else />
        <BaseButton
          type="button"
          variant="secondary"
          class="ui-numeric-key"
          @click="press('0')"
          >0</BaseButton
        >
        <BaseButton
          type="button"
          variant="secondary"
          class="ui-numeric-key"
          aria-label="Backspace"
          @click="press('Backspace')"
          ><Delete :size="22"
        /></BaseButton>
      </div>
      <BaseButton
        type="button"
        class="ui-numeric-confirm"
        :disabled="value === null || disabled"
        @click="confirm()"
      >
        <Check :size="18" />Use {{ title.toLowerCase() }}
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
  overflow: auto;
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
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.5;
}
.ui-numeric-cancel {
  padding: 0 10px;
  min-height: 44px;
  color: var(--ui-muted-foreground);
  font-size: 12px;
}
.ui-numeric-suggestions > p {
  margin: 0 0 10px;
  font-size: 12px;
}
.ui-numeric-suggestions > p > span {
  float: right;
  color: var(--ui-muted-foreground);
  font-size: 11px;
}
.ui-numeric-presets {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
.ui-numeric-preset {
  min-height: 44px;
  padding: 8px 4px;
  border-radius: 7px;
  background: var(--ui-secondary);
  color: var(--ui-foreground);
  font-size: 14px;
}
.ui-numeric-preset small {
  margin-left: 4px;
  font-size: 10px;
  color: var(--ui-muted-foreground);
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
.ui-numeric-keypad {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.ui-numeric-key {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 54px;
  padding: 8px;
  border-radius: 8px;
  background: var(--ui-secondary);
  color: var(--ui-foreground);
  font-size: 22px;
  font-weight: 500;
  touch-action: manipulation;
}
.ui-numeric-key:hover,
.ui-numeric-preset:hover {
  background: color-mix(
    in oklab,
    var(--ui-secondary) 85%,
    var(--ui-foreground)
  );
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
    top: auto;
    bottom: 0;
    left: 0;
    transform: none;
    width: 100%;
    max-height: 100dvh;
    border-radius: 18px 18px 0 0;
    padding: 22px 20px calc(20px + env(safe-area-inset-bottom));
  }
}
@media (max-height: 700px) {
  :global(.ui-numeric-dialog) {
    gap: 12px;
  }
  .ui-numeric-display {
    padding-block: 10px;
  }
  .ui-numeric-key {
    min-height: 46px;
  }
}
</style>
