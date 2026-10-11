<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import BaseFileInput from "../../src/file-input/BaseFileInput.vue";
import BaseButton from "../../src/button/BaseButton.vue";

const input = useTemplateRef<InstanceType<typeof BaseFileInput>>("input");
const names = ref<string[]>([]);
</script>

<template>
  <main>
    <BaseButton @click="input?.open()">Choose file</BaseButton>
    <BaseFileInput
      ref="input"
      accept="application/json,.json"
      label="Backup file"
      @select="names.push($event.name)"
    />
    <output data-testid="names">{{ names.join(",") }}</output>
  </main>
</template>

<style scoped>
main {
  background: var(--ui-background);
  color: var(--ui-foreground);
}
</style>
