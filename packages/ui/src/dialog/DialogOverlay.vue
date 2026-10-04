<script setup lang="ts">
import {
  DialogOverlay,
  type DialogOverlayProps,
  useForwardProps,
} from "reka-ui";
const props = defineProps<DialogOverlayProps>();
const forwarded = useForwardProps(props);
</script>
<template>
  <DialogOverlay
    v-bind="forwarded"
    class="ui-dialog-overlay"
    data-slot="dialog-overlay"
    ><slot
  /></DialogOverlay>
</template>
