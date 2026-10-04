<script setup lang="ts">
import { computed } from "vue";
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
import DialogOverlay from "./DialogOverlay.vue";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<
    DialogContentProps & {
      showCloseButton?: boolean;
      portalTo?: DialogPortalProps["to"];
      portalDisabled?: boolean;
    }
  >(),
  { showCloseButton: true },
);
const emits = defineEmits<DialogContentEmits>();
const contentProps = computed(() => {
  const { showCloseButton, portalTo, portalDisabled, ...content } = props;
  void showCloseButton;
  void portalTo;
  void portalDisabled;
  return content;
});
const forwarded = useForwardPropsEmits(contentProps, emits);
</script>
<template>
  <DialogPortal :to="portalTo" :disabled="portalDisabled"
    ><DialogOverlay /><DialogContent
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
