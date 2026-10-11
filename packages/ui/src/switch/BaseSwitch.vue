<script setup lang="ts">
// A native checkbox with the ARIA switch role, drawn as a track and thumb. The
// browser supplies the state, Space, label clicks and form submission, so the
// component needs no extra runtime. `id` and `aria-*` reach the input.
defineProps<{ disabled?: boolean; required?: boolean; name?: string }>();
const model = defineModel<boolean>({ default: false });
</script>

<template>
  <input
    v-model="model"
    type="checkbox"
    role="switch"
    class="ui-switch"
    data-slot="switch"
    :disabled="disabled"
    :required="required"
    :name="name"
  />
</template>
