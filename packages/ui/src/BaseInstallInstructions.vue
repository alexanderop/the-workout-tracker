<script setup lang="ts">
import BaseButton from "./button/BaseButton.vue";
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
</script>
<template>
  <div class="ui-install">
    <p v-if="installed" role="status">The app is installed on this device.</p>
    <template v-else>
      <p>
        Keep your journal close. Open it from your home screen and train offline
        after the first complete load.
      </p>
      <BaseButton v-if="canInstall" :disabled="busy" @click="emit('install')">{{
        busy ? "Opening installer…" : "Install app"
      }}</BaseButton>
      <ol v-else-if="platform === 'ios'">
        <li>Open this page in Safari.</li>
        <li>Open Share, then choose Add to Home Screen.</li>
        <li>Confirm with Add.</li>
      </ol>
      <ol v-else-if="platform === 'android'">
        <li>Open your browser menu.</li>
        <li>Choose Install app or Add to Home screen, if available.</li>
        <li>Follow the browser instructions.</li>
      </ol>
      <ol v-else>
        <li>Look for Install in the address bar or browser menu.</li>
        <li>
          If it is unavailable, try a browser that supports app installation.
        </li>
      </ol>
    </template>
    <p v-if="message" role="status">{{ message }}</p>
    <p class="ui-install-note">
      Your data stays in this browser. Installation is not a backup.
    </p>
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
