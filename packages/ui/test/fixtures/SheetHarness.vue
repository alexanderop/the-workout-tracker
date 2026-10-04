<script setup lang="ts">
import { ref } from "vue";
import { Sheet } from "@form/ui";
import "@form/ui/tokens.css";
const open = ref(false);
</script>
<template>
  <button @click="open = true">Open preferences</button>
  <Sheet
    :open="open"
    title="Preferences"
    description="Choose your settings"
    @close="open = false"
    ><input aria-label="Example preference"
  /></Sheet>
</template>
