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
