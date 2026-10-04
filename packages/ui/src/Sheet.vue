<script setup lang="ts">
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "reka-ui";
import { watch } from "vue";
import { X } from "@lucide/vue";
const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    description?: string;
    wide?: boolean;
  }>(),
  { description: "", wide: false },
);
const emit = defineEmits<{ close: [] }>();
let opener: HTMLElement | null = null;
watch(
  () => props.open,
  (open) => {
    if (open && document.activeElement instanceof HTMLElement)
      opener = document.activeElement;
  },
  { flush: "sync" },
);
function restoreFocus(event: Event) {
  event.preventDefault();
  if (opener?.isConnected) opener.focus();
}
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
    <DialogPortal>
      <DialogOverlay class="dialog-overlay" />
      <DialogContent
        class="sheet"
        :class="{ wide }"
        @close-auto-focus="restoreFocus"
      >
        <header class="sheet-header">
          <div>
            <DialogTitle class="sheet-title">{{ title }}</DialogTitle
            ><DialogDescription
              v-if="description"
              class="muted sheet-description"
              >{{ description }}</DialogDescription
            ><DialogDescription v-else class="sr-only"
              >{{ title }} options</DialogDescription
            >
          </div>
          <DialogClose class="icon-button" aria-label="Close dialog"
            ><X :size="20"
          /></DialogClose>
        </header>
        <slot />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: var(--background);
  opacity: 0.8;
  z-index: 50;
}
.sheet {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 51;
  width: min(520px, calc(100% - 40px));
  max-height: calc(100dvh - 64px);
  overflow-y: auto;
  overscroll-behavior: contain;
  background: var(--background);
  border: 1px solid var(--surface);
  border-radius: 12px;
  padding: 28px;
}
.sheet.wide {
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

.sheet {
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
  .sheet,
  .sheet.wide {
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
