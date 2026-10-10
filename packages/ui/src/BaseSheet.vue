<script setup lang="ts">
import { DialogRoot } from "reka-ui";
import BaseDialogContent from "./dialog/BaseDialogContent.vue";
import BaseDialogTitle from "./dialog/BaseDialogTitle.vue";
import BaseDialogDescription from "./dialog/BaseDialogDescription.vue";
import BaseDialogClose from "./dialog/BaseDialogClose.vue";
import BaseButton from "./button/BaseButton.vue";
import { onBeforeUnmount, watch } from "vue";
import { X } from "@lucide/vue";
import {
  releaseVelocity,
  sheetDragOffset,
  sheetDragSlop,
  shouldDismissSheet,
} from "./sheet-swipe";
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
defineSlots<{ default?: () => unknown }>();
let opener: HTMLElement | null = null;
watch(
  () => open,
  (isOpen) => {
    if (isOpen && document.activeElement instanceof HTMLElement)
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
interface Drag {
  area: HTMLElement;
  sheet: HTMLElement;
  pointerId: number;
  startY: number;
  lastY: number;
  lastTime: number;
  velocity: number;
  active: boolean;
}
let drag: Drag | null = null;
const mobileSheet = () => window.matchMedia("(max-width: 650px)").matches;
function startDrag(event: PointerEvent) {
  if (!event.isPrimary || event.button !== 0 || !mobileSheet()) return;
  const area = event.currentTarget;
  if (!(area instanceof HTMLElement)) return;
  const sheet = area.closest<HTMLElement>(".sheet");
  if (!sheet) return;
  drag = {
    area,
    sheet,
    pointerId: event.pointerId,
    startY: event.clientY,
    lastY: event.clientY,
    lastTime: event.timeStamp,
    velocity: 0,
    active: false,
  };
}
function moveDrag(event: PointerEvent) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const distance = event.clientY - drag.startY;
  if (!drag.active) {
    if (Math.abs(distance) < sheetDragSlop) return;
    drag.active = true;
    drag.area.setPointerCapture(event.pointerId);
    drag.sheet.classList.add("is-dragging");
  }
  const elapsed = Math.max(1, event.timeStamp - drag.lastTime);
  drag.velocity = (event.clientY - drag.lastY) / elapsed;
  drag.lastY = event.clientY;
  drag.lastTime = event.timeStamp;
  drag.sheet.style.setProperty("--ui-sheet-drag", `${sheetDragOffset(distance)}px`);
}
function endDrag(event: PointerEvent) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const { area, sheet, active, startY, lastTime } = drag;
  const velocity = releaseVelocity(drag.velocity, lastTime, event.timeStamp);
  drag = null;
  if (!active) return;
  sheet.classList.remove("is-dragging");
  if (area.hasPointerCapture(event.pointerId))
    area.releasePointerCapture(event.pointerId);
  const distance = event.clientY - startY;
  swallowNextClick(sheet);
  if (
    event.type === "pointerup" &&
    shouldDismissSheet(distance, velocity, sheet.offsetHeight)
  ) {
    // Dismissal follows the same path as Escape and the backdrop, so a
    // caller may keep the sheet open to confirm discarding input.
    emit("close");
    cancelAnimationFrame(settleFrame);
    settleFrame = requestAnimationFrame(() => {
      if (sheet.dataset.state !== "closed")
        sheet.style.removeProperty("--ui-sheet-drag");
    });
    return;
  }
  sheet.style.removeProperty("--ui-sheet-drag");
}
let settleFrame = 0;
let stopSwallowing: (() => void) | null = null;
const swallow = (click: Event) => click.stopPropagation();
// Swallow the click a drag may end with, so it cannot press the close button.
function swallowNextClick(sheet: HTMLElement) {
  stopSwallowing?.();
  sheet.addEventListener("click", swallow, { capture: true, once: true });
  const timer = setTimeout(() => stopSwallowing?.(), 60);
  stopSwallowing = () => {
    clearTimeout(timer);
    sheet.removeEventListener("click", swallow, true);
    stopSwallowing = null;
  };
}
onBeforeUnmount(() => {
  drag = null;
  stopSwallowing?.();
  cancelAnimationFrame(settleFrame);
});
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
      <div
        class="sheet-drag-area"
        @pointerdown="startDrag"
        @pointermove="moveDrag"
        @pointerup="endDrag"
        @pointercancel="endDrag"
      >
      <span class="sheet-grabber" aria-hidden="true"></span>
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
      </div>
      <slot />
    </BaseDialogContent>
  </DialogRoot>
</template>

<style scoped>
:global(.sheet) {
  /* Swipe offset, written inline while a mobile sheet is dragged. */
  --ui-sheet-drag: 0px;
  display: block;
  position: fixed;
  inset-inline-start: 50%;
  inset-block-start: 50%;
  transform: translate(-50%, -50%);
  z-index: 51;
  width: min(520px, calc(100% - 40px));
  max-width: none;
  max-height: calc(100dvh - 64px);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 12px 60px var(--ui-shadow-dialog);
}
:global(.sheet.wide) {
  width: min(620px, calc(100% - 40px));
}
/* The header and a direct form footer stay in view while long content
   scrolls between them. Negative margins reach the sheet's padding edge. */
.sheet-drag-area {
  position: sticky;
  inset-block-start: -28px;
  z-index: 1;
  margin: -28px -28px 0;
  padding: 28px 28px 0;
  background: var(--background);
}
:global(.sheet > .form-actions),
:global(.sheet > form > .form-actions) {
  position: sticky;
  inset-block-end: -28px;
  z-index: 1;
  margin-inline: -28px;
  margin-block-end: -28px;
  padding: 12px 28px 28px;
  background: var(--background);
}
.sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-block-end: 28px;
}
.sheet-title {
  font-size: 22px;
  letter-spacing: -0.7px;
  font-weight: 550;
}
.sheet-description {
  font-size: 12px;
  margin-block-start: 9px;
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
  overflow: clip;
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
@media (hover: hover) and (pointer: fine) {
  .icon-button:hover {
    background: var(--surface);
    color: var(--text);
  }
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
  outline: 3px solid var(--focus-ring);
  outline-offset: 4px;
}
.sheet-grabber {
  display: none;
}
@media (max-width: 650px) {
  .sheet-drag-area {
    touch-action: none;
    inset-block-start: -24px;
    margin: -24px -20px 0;
    padding: 8px 20px 0;
  }
  :global(.sheet > .form-actions),
  :global(.sheet > form > .form-actions) {
    inset-block-end: calc(-24px - env(safe-area-inset-bottom, 0px));
    margin-inline: -20px;
    margin-block-end: calc(-24px - env(safe-area-inset-bottom, 0px));
    padding: 12px 20px calc(24px + env(safe-area-inset-bottom, 0px));
  }
  .sheet-grabber {
    display: block;
    width: 36px;
    height: 5px;
    margin: 0 auto 14px;
    border-radius: 3px;
    background: var(--muted);
    opacity: 0.45;
  }
  :global(.sheet:not([data-state="closed"])) {
    transform: translateY(var(--ui-sheet-drag, 0px));
  }
}
@media (max-width: 650px) and (prefers-reduced-motion: no-preference) {
  :global(.sheet:not([data-state="closed"])) {
    transition: transform var(--ui-motion-exit) var(--ui-motion-ease);
  }
  :global(.sheet.is-dragging) {
    transition: none;
  }
}
@media (max-width: 650px) {
  :global(.sheet),
  :global(.sheet.wide) {
    width: 100%;
    inset-block-start: auto;
    inset-block-end: 0;
    inset-inline-start: 0;
    max-height: calc(100dvh - 30px);
    padding: 24px 20px calc(24px + env(safe-area-inset-bottom, 0px));
    border-radius: 16px 16px 0 0;
  }
  .sheet-title {
    font-size: 21px;
  }
  .sheet-header {
    margin-block-end: 24px;
  }
  .icon-button {
    width: 44px;
    height: 44px;
  }
}
</style>
