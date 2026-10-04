<script setup lang="ts">
// Adapted from shadcn-vue; see THIRD_PARTY_NOTICES.md.
import { SwitchRoot, SwitchThumb } from "reka-ui";
const model = defineModel<boolean>({ default: false });
defineProps<{ disabled?: boolean; required?: boolean; name?: string }>();
</script>

<template>
  <SwitchRoot
    v-model="model"
    :disabled="disabled"
    :required="required"
    :name="name"
    class="ui-switch"
    data-slot="switch"
  >
    <SwitchThumb class="ui-switch-thumb" data-slot="switch-thumb" />
  </SwitchRoot>
</template>
