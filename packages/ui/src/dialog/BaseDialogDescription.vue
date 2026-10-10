<script setup lang="ts">
import {
  DialogDescription,
  type DialogDescriptionProps,
  useForwardProps,
} from "reka-ui";
const { ...props } = defineProps<DialogDescriptionProps>();
defineSlots<{ default?: () => unknown }>();
const forwarded = useForwardProps(props);
</script>
<template>
  <DialogDescription
    v-bind="forwarded"
    class="ui-dialog-description"
    data-slot="dialog-description"
    ><slot
  /></DialogDescription>
</template>
