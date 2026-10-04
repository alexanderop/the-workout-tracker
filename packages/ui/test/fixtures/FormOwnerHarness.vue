<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@form/ui";
const owner = ref("form-a");
const value = ref<string | number>("Edited");
const cancel = ref(false);
</script>
<template>
  <main>
    <form id="form-a" aria-label="First form">
      <button type="reset">Reset first</button>
    </form>
    <form
      id="form-b"
      aria-label="Second form"
      @reset="cancel && $event.preventDefault()"
    >
      <button type="reset">Reset second</button>
    </form>
    <label for="external-input">External value</label>
    <Input
      id="external-input"
      v-model="value"
      default-value="Default"
      :form="owner"
    />
    <button @click="owner = 'form-b'">Move to second</button>
    <button @click="cancel = true">Cancel resets</button>
    <output aria-label="Model value">{{ value }}</output>
  </main>
</template>
