<script setup lang="ts">
import { DialogClose } from "reka-ui";
import Button from "../button/Button.vue";
defineProps<{ showCloseButton?: boolean }>();
defineSlots<{ default?: () => unknown }>();
</script>
<template>
  <div class="ui-dialog-footer" data-slot="dialog-footer">
    <slot /><DialogClose v-if="showCloseButton" as-child
      ><Button variant="outline">Close</Button></DialogClose
    >
  </div>
</template>
