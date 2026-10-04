<script setup lang="ts">
import { DialogTitle, type DialogTitleProps, useForwardProps } from "reka-ui";
const props = defineProps<DialogTitleProps>();
const forwarded = useForwardProps(props);
</script>
<template>
  <DialogTitle
    v-bind="forwarded"
    class="ui-dialog-title"
    data-slot="dialog-title"
    ><slot
  /></DialogTitle>
</template>
