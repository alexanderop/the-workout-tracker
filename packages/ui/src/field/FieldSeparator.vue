<script setup lang="ts">
import { Separator } from "reka-ui";
</script>
<template>
  <div
    class="ui-field-separator"
    data-slot="field-separator"
    :data-content="!!$slots.default"
  >
    <Separator class="ui-field-separator-line" /><span
      v-if="$slots.default"
      class="ui-field-separator-content"
      data-slot="field-separator-content"
      ><slot
    /></span>
  </div>
</template>
