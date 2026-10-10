<script setup lang="ts">
import { X } from "@lucide/vue";
import {
  DialogContent,
  DialogClose,
  DialogPortal,
  useForwardPropsEmits,
  type DialogContentProps,
  type DialogContentEmits,
  type DialogPortalProps,
} from "reka-ui";
import BaseDialogOverlay from "./BaseDialogOverlay.vue";
defineOptions({ inheritAttrs: false });
const {
  showCloseButton = true,
  portalTo,
  portalDisabled,
  overlayClass,
  ...contentProps
} = defineProps<
  DialogContentProps & {
    showCloseButton?: boolean;
    portalTo?: DialogPortalProps["to"];
    portalDisabled?: boolean;
    overlayClass?: string;
  }
>();
const emits = defineEmits<DialogContentEmits>();
defineSlots<{ default?: () => unknown }>();
const forwarded = useForwardPropsEmits(contentProps, emits);
</script>
<template>
  <DialogPortal :to="portalTo" :disabled="portalDisabled"
    ><BaseDialogOverlay :class="overlayClass" /><DialogContent
      v-bind="{ ...$attrs, ...forwarded }"
      class="ui-dialog-content"
      data-slot="dialog-content"
      ><slot /><DialogClose
        v-if="showCloseButton"
        class="ui-dialog-dismiss"
        data-slot="dialog-close"
        aria-label="Close"
        ><X aria-hidden="true" /></DialogClose></DialogContent
  ></DialogPortal>
</template>
