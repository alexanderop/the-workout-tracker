<script setup lang="ts">
import { computed } from "vue";
const { errors } = defineProps<{
  errors?: Array<string | { message: string | undefined } | undefined>;
}>();
const messages = computed(() => [
  ...new Set(
    (errors ?? [])
      .map((error) => (typeof error === "string" ? error : error?.message))
      .filter((message): message is string => Boolean(message)),
  ),
]);
defineSlots<{ default?: () => unknown }>();
</script>
<template>
  <div
    v-if="$slots.default || messages.length"
    role="alert"
    class="ui-field-error"
    data-slot="field-error"
  >
    <slot v-if="$slots.default" /><template v-else-if="messages.length === 1">{{
      messages[0]
    }}</template>
    <ul v-else>
      <li v-for="message in messages" :key="message">{{ message }}</li>
    </ul>
  </div>
</template>
