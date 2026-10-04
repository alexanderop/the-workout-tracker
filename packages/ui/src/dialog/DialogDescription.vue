<script setup lang="ts">
import {
  DialogDescription,
  type DialogDescriptionProps,
  useForwardProps,
} from "reka-ui";
const { ...props } = defineProps<DialogDescriptionProps>();
const forwarded = useForwardProps(props);
defineSlots<{ default?: () => unknown }>();
</script>
<template>
  <DialogDescription
    v-bind="forwarded"
    class="ui-dialog-description"
    data-slot="dialog-description"
    ><slot
  /></DialogDescription>
</template>
