<script setup lang="ts">
import { computed, ref, useAttrs, useId, useTemplateRef, watch } from "vue";
import { DialogRoot } from "reka-ui";
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
defineSlots<{
  /** Beside the draft, such as a plate breakdown; `value` is the valid draft or null. */
  aside?: (props: { value: number | null }) => unknown;
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
const anchor = ref<number | null>(null);
// Enough values to scroll through, as in a picker wheel.
const presetCount = 41;
const value = computed(() => validNumber(draft.value.text, limits.value));
const invalid = computed(() => value.value === null || pasteIssue.value !== "");
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
    presets.value = numericPresets(modelValue, limits.value, presetCount);
    anchor.value = validNumber(draft.value.text, limits.value);
    emit("open");
  },
  { flush: "sync" },
);
// A typed value outside the listed range moves the list to it.
watch(value, (typed) => {
  const listed = presets.value;
  const first = listed[0];
  const last = listed.at(-1);
  if (typed === null || first === undefined || last === undefined) return;
  if (typed < first || typed > last)
    presets.value = numericPresets(typed, limits.value, presetCount);
});
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
    <span v-if="announcement" role="status" class="ui-visually-hidden">{{
      announcement
    }}</span>
    <BaseDialogContent
      class="ui-numeric-dialog"
      overlay-class="ui-numeric-overlay"
      :show-close-button="false"
      @open-auto-focus="focusDisplay"
      @keydown="keyboard"
      @paste="paste"
    >
      <header class="ui-numeric-header">
        <BaseDialogClose as-child>
          <BaseButton type="button" variant="ghost" class="ui-numeric-cancel">{{
            text.cancel
          }}</BaseButton>
        </BaseDialogClose>
        <BaseDialogTitle class="ui-numeric-title">{{ title }}</BaseDialogTitle>
        <BaseDialogDescription class="ui-numeric-description">{{
          label
        }}</BaseDialogDescription>
      </header>
      <NumericPresets
        class="ui-numeric-body"
        :presets="presets"
        :unit="unit"
        :selected="value"
        :anchor="anchor"
        @pick="confirm"
      />
      <div class="ui-numeric-pad">
        <div class="ui-numeric-entry">
          <div class="ui-numeric-aside">
            <slot name="aside" :value="value" />
          </div>
          <div
            ref="display"
            tabindex="-1"
            role="group"
            :aria-label="text.editor"
            :aria-describedby="hintId"
            class="ui-numeric-display"
            :class="{ 'is-long': draft.text.length > 4 }"
          >
            <span>{{ show(draft.text) || "—" }}</span
            ><small v-if="unit">{{ unit }}</small>
          </div>
          <BaseButton
            type="button"
            class="ui-numeric-confirm"
            :aria-label="text.confirm(title)"
            :disabled="value === null || disabled"
            @click="confirm()"
          >
            {{ text.done }}
          </BaseButton>
        </div>
        <p
          :id="hintId"
          :class="invalid ? 'ui-numeric-error' : 'ui-visually-hidden'"
        >
          {{ pasteIssue || hint(draft, limits, unit) }}
        </p>
        <NumericKeypad :decimals="decimals" @press="press" />
      </div>
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
  height: min(760px, calc(100dvh - 32px));
  overflow: clip;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--ui-background);
  color: var(--ui-foreground);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-lg);
  font-family: inherit;
}
:global(.ui-numeric-overlay) {
  z-index: 53;
}
.ui-numeric-header,
.ui-numeric-pad {
  flex-shrink: 0;
}
.ui-numeric-body {
  flex: 1;
}
/* Cancel and the title share the first row; the field label spans the second. */
.ui-numeric-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  column-gap: var(--space-2);
}
.ui-numeric-title {
  font-size: var(--text-base);
  font-weight: 600;
  letter-spacing: -0.3px;
  text-align: center;
}
.ui-numeric-description {
  grid-column: 1 / -1;
  color: var(--ui-muted-foreground);
  font-size: var(--text-sm);
  line-height: 1.4;
  text-align: center;
}
.ui-numeric-cancel {
  justify-self: start;
  padding: 0 var(--space-1);
  min-height: 44px;
  color: var(--ui-primary);
  font-size: var(--text-base);
  font-weight: 500;
}
.ui-numeric-pad {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-block-start: var(--space-3);
  border-block-start: 1px solid var(--ui-border);
}
.ui-numeric-entry {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  gap: var(--space-2);
  min-height: 56px;
}
.ui-numeric-aside {
  min-width: 0;
  align-self: stretch;
  display: flex;
  align-items: center;
}
.ui-numeric-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--space-1);
  min-width: 0;
  white-space: nowrap;
  border-radius: var(--radius-md);
}
.ui-numeric-display span {
  min-width: 0;
  font-size: var(--text-3xl);
  line-height: 1.2;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -1px;
}
.ui-numeric-display small {
  color: var(--ui-muted-foreground);
  font-size: var(--text-sm);
}
/* Values such as 142.5 stay on one line beside the plates. */
.ui-numeric-display.is-long span {
  font-size: var(--text-xl);
  letter-spacing: -0.5px;
}
.ui-numeric-error {
  margin: 0;
  color: var(--ui-destructive);
  font-size: var(--text-sm);
  text-align: center;
}
/* A labelled "Done", not the check that logs a set: the glyph stays exclusive
   to the set row. The editor's primary action, so it is filled accent. */
.ui-numeric-confirm {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 54px;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: var(--on-accent);
  font-size: var(--text-base);
  font-weight: 600;
}
.ui-numeric-confirm:disabled {
  opacity: 0.5;
}
@media (hover: hover) and (pointer: fine) {
  .ui-numeric-confirm:not(:disabled):hover {
    background: var(--accent-hover);
  }
}
@media (max-width: 650px) {
  :global(.ui-numeric-dialog) {
    inset: 0;
    transform: none;
    width: 100%;
    height: 100dvh;
    max-height: none;
    border: 0;
    border-radius: 0;
    padding: calc(var(--space-2) + env(safe-area-inset-top, 0px))
      var(--page-gutter-phone)
      calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
  }
}
@media (max-height: 600px) {
  .ui-numeric-description {
    display: none;
  }
  .ui-numeric-entry {
    min-height: 46px;
  }
  .ui-numeric-confirm {
    min-height: 46px;
  }
}
</style>
