<script setup lang="ts">
import { computed } from "vue";
import BaseButton from "./button/BaseButton.vue";
import { useUiText } from "./ui-text";
const {
  platform = "browser",
  canInstall = false,
  busy = false,
  installed = false,
  message = "",
} = defineProps<{
  platform?: "ios" | "android" | "browser";
  canInstall?: boolean;
  busy?: boolean;
  installed?: boolean;
  message?: string;
}>();
const emit = defineEmits<{ install: [] }>();
const uiText = useUiText();
const text = computed(() => uiText.value.install);
const steps = computed(() => text.value[platform]);
</script>
<template>
  <div class="ui-install">
    <p v-if="installed" role="status">{{ text.installed }}</p>
    <template v-else>
      <p>{{ text.intro }}</p>
      <BaseButton v-if="canInstall" :disabled="busy" @click="emit('install')">{{
        busy ? text.opening : text.install
      }}</BaseButton>
      <ol v-else>
        <li v-for="step in steps" :key="step">{{ step }}</li>
      </ol>
    </template>
    <p v-if="message" role="status">{{ message }}</p>
    <p class="ui-install-note">{{ text.note }}</p>
  </div>
</template>
<style scoped>
.ui-install {
  display: grid;
  gap: 20px;
  line-height: 1.6;
}
.ui-install p {
  margin: 0;
}
.ui-install ol {
  list-style: decimal;
  display: grid;
  gap: 12px;
  margin: 0;
  padding-inline-start: 24px;
}
.ui-install-note {
  color: var(--muted);
  font-size: 12px;
}
</style>
