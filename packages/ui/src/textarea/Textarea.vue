<script setup lang="ts">
// Adapted from shadcn-vue; see THIRD_PARTY_NOTICES.md.
const model = defineModel<string>({ default: "" });
</script>

<template>
  <textarea v-model="model" class="ui-textarea" data-slot="textarea" />
</template>
