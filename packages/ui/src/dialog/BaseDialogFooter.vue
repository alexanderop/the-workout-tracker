<script setup lang="ts">
import { DialogClose } from "reka-ui";
import BaseButton from "../button/BaseButton.vue";
defineProps<{ showCloseButton?: boolean }>();
defineSlots<{ default?: () => unknown }>();
</script>
<template>
  <div class="ui-dialog-footer" data-slot="dialog-footer">
    <slot /><DialogClose v-if="showCloseButton" as-child
      ><BaseButton variant="outline">Close</BaseButton></DialogClose
    >
  </div>
</template>
