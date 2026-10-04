<script setup lang="ts">
import {
  DialogTrigger,
  type DialogTriggerProps,
  useForwardProps,
} from "reka-ui";
const { ...props } = defineProps<DialogTriggerProps>();
const forwarded = useForwardProps(props);
defineSlots<{ default?: () => unknown }>();
</script>
<template>
  <DialogTrigger v-bind="forwarded" data-slot="dialog-trigger"
    ><slot
  /></DialogTrigger>
</template>
