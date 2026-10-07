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
  const { area, sheet, active, startY, velocity } = drag;
  drag = null;
  if (!active) return;
  sheet.classList.remove("is-dragging");
  if (area.hasPointerCapture(event.pointerId))
    area.releasePointerCapture(event.pointerId);
  const distance = event.clientY - startY;
  // Swallow the click a drag may end with, so it cannot press the close button.
  const swallow = (click: Event) => click.stopPropagation();
  sheet.addEventListener("click", swallow, { capture: true, once: true });
  setTimeout(() => sheet.removeEventListener("click", swallow, true), 60);
  if (
    event.type === "pointerup" &&
    shouldDismissSheet(distance, velocity, sheet.offsetHeight)
  ) {
    // Dismissal follows the same path as Escape and the backdrop, so a
    // caller may keep the sheet open to confirm discarding input.
    emit("close");
    requestAnimationFrame(() => {
      if (sheet.dataset.state !== "closed")
        sheet.style.removeProperty("--ui-sheet-drag");
    });
    return;
  }
  sheet.style.removeProperty("--ui-sheet-drag");
}
onBeforeUnmount(() => {
  drag = null;
});
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
.sheet-grabber {
  display: none;
}
@media (max-width: 650px) {
  .sheet-drag-area {
    touch-action: none;
    margin: -24px -20px 0;
    padding: 8px 20px 0;
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
    transition: transform var(--ui-motion-exit) var(--ui-motion-ease);
  }
  :global(.sheet.is-dragging) {
    transition: none;
  }
}
@media (max-width: 650px) and (prefers-reduced-motion: reduce) {
  :global(.sheet:not([data-state="closed"])) {
    transition: none;
  }
}
@media (max-width: 650px) {
  :global(.sheet),
  :global(.sheet.wide) {
    width: 100%;
    top: auto;
    bottom: 0;
    left: 0;
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
