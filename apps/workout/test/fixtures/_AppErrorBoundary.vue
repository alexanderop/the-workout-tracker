<script setup lang="ts">
import { ref } from "vue";
import AppErrorBoundary from "../../src/app/AppErrorBoundary.vue";
import BrokenScreen from "./_BrokenScreen.vue";

const broken = ref(false);
</script>

<template>
  <AppErrorBoundary>
    <button type="button" @click="broken = true">Open broken screen</button>
    <BrokenScreen v-if="broken" />
    <p v-else>Everything works</p>
  </AppErrorBoundary>
</template>
