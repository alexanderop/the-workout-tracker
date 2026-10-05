<script setup lang="ts">
import { DialogRoot } from "reka-ui";
import BaseDialogContent from "./dialog/BaseDialogContent.vue";
import BaseDialogTitle from "./dialog/BaseDialogTitle.vue";
import BaseDialogDescription from "./dialog/BaseDialogDescription.vue";
import BaseDialogClose from "./dialog/BaseDialogClose.vue";
import BaseButton from "./button/BaseButton.vue";
import { watch } from "vue";
import { X } from "@lucide/vue";
const {
  open,
  title,
  description = "",
  wide = false,
} = defineProps<{
  open: boolean;
  title: string;
  description?: string;
  wide?: boolean;
}>();
const emit = defineEmits<{
  close: [];
  "close-auto-focus": [event: Event];
}>();
let opener: HTMLElement | null = null;
watch(
  () => open,
  (open) => {
    if (open && document.activeElement instanceof HTMLElement)
      opener = document.activeElement;
  },
  { flush: "sync" },
);
function restoreFocus(event: Event) {
  emit("close-auto-focus", event);
  if (event.defaultPrevented) return;
  event.preventDefault();
  if (opener?.isConnected) opener.focus();
}
defineSlots<{ default?: () => unknown }>();
</script>
<template>
  <DialogRoot
    :open="open"
    @update:open="
      (value) => {
        if (!value) emit('close');
      }
    "
  >
    <BaseDialogContent
      class="sheet"
      :show-close-button="false"
      :class="{ wide }"
      @close-auto-focus="restoreFocus"
    >
      <header class="sheet-header">
        <div>
          <BaseDialogTitle class="sheet-title">{{ title }}</BaseDialogTitle
          ><BaseDialogDescription
            v-if="description"
            class="muted sheet-description"
            >{{ description }}</BaseDialogDescription
          ><BaseDialogDescription v-else class="sr-only"
            >{{ title }} options</BaseDialogDescription
          >
        </div>
        <BaseDialogClose as-child
          ><BaseButton
            type="button"
            variant="ghost"
            size="icon"
            class="icon-button"
            aria-label="Close dialog"
            ><X :size="20" /></BaseButton
        ></BaseDialogClose>
      </header>
      <slot />
    </BaseDialogContent>
  </DialogRoot>
</template>

<style scoped>
:global(.sheet) {
  display: block;
  animation: none;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 51;
  width: min(520px, calc(100% - 40px));
  max-width: none;
  max-height: calc(100dvh - 64px);
  overflow-y: auto;
  overscroll-behavior: contain;
  background: var(--background);
  border: 1px solid var(--surface);
  border-radius: 12px;
  padding: 28px;
}
:global(.sheet.wide) {
  width: min(620px, calc(100% - 40px));
}
.sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 28px;
}
.sheet-title {
  font-size: 22px;
  letter-spacing: -0.7px;
  font-weight: 550;
}
.sheet-description {
  font-size: 12px;
  margin-top: 9px;
}
.sheet-header .icon-button {
  margin: -7px -10px 0 0;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  flex-shrink: 0;
  color: var(--muted);
}
.icon-button:hover {
  background: var(--surface);
  color: var(--text);
}

:global(.sheet) {
  color: var(--text);
  font-family: inherit;
  box-sizing: border-box;
}
.sheet-title {
  margin: 0;
}
.sheet-description {
  color: var(--muted);
  line-height: 1.65;
}
.icon-button {
  border: 0;
  background: none;
  cursor: pointer;
}
.icon-button:focus-visible {
  outline: 2px solid var(--purple);
  outline-offset: 4px;
}
@media (max-width: 650px) {
  :global(.sheet),
  :global(.sheet.wide) {
    width: 100%;
    top: auto;
    bottom: 0;
    left: 0;
    transform: none;
    max-height: calc(100dvh - 30px);
    padding: 24px 20px calc(24px + env(safe-area-inset-bottom));
    border-radius: 14px 14px 0 0;
  }
  .sheet-title {
    font-size: 21px;
  }
  .sheet-header {
    margin-bottom: 24px;
  }
  .icon-button {
    width: 44px;
    height: 44px;
  }
}
</style>
