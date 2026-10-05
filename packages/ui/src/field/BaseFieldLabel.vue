<script setup lang="ts">
import { Label, type LabelProps, useForwardProps } from "reka-ui";
const { ...props } = defineProps<LabelProps>();
const forwarded = useForwardProps(props);
defineSlots<{ default?: () => unknown }>();
</script>
<template>
  <Label v-bind="forwarded" class="ui-field-label" data-slot="field-label"
    ><slot
  /></Label>
</template>
