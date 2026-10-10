<script setup lang="ts">
import { DialogClose, type DialogCloseProps, useForwardProps } from "reka-ui";
const { ...props } = defineProps<DialogCloseProps>();
defineSlots<{ default?: () => unknown }>();
const forwarded = useForwardProps(props);
</script>
<template>
  <DialogClose v-bind="forwarded" data-slot="dialog-close"
    ><slot
  /></DialogClose>
</template>
