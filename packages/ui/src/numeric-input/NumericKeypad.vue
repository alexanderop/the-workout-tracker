<script setup lang="ts">
import { Delete } from "@lucide/vue";
import BaseButton from "../button/BaseButton.vue";
import { useNumericText } from "./useNumericText";

defineProps<{ decimals: number }>();
const emit = defineEmits<{ press: [key: string] }>();
const { text } = useNumericText();
const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
</script>

<template>
  <div class="ui-numeric-keypad" role="group" :aria-label="text.keypad">
    <BaseButton
      v-for="digit in digits"
      :key="digit"
      type="button"
      variant="secondary"
      class="ui-numeric-key"
      @click="emit('press', digit)"
      >{{ digit }}</BaseButton
    >
    <BaseButton
      v-if="decimals"
      type="button"
      variant="secondary"
      class="ui-numeric-key"
      :aria-label="text.decimalPoint"
      @click="emit('press', '.')"
      >.</BaseButton
    >
    <span v-else />
    <BaseButton
      type="button"
      variant="secondary"
      class="ui-numeric-key"
      @click="emit('press', '0')"
      >0</BaseButton
    >
    <BaseButton
      type="button"
      variant="secondary"
      class="ui-numeric-key"
      :aria-label="text.backspace"
      @click="emit('press', 'Backspace')"
      ><Delete :size="22"
    /></BaseButton>
  </div>
</template>

<style scoped>
.ui-numeric-keypad {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.ui-numeric-key {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 54px;
  padding: 8px;
  border-radius: 8px;
  background: var(--ui-secondary);
  color: var(--ui-foreground);
  font-size: 22px;
  font-weight: 500;
  touch-action: manipulation;
}
@media (hover: hover) and (pointer: fine) {
  .ui-numeric-key:hover {
    background: color-mix(
      in oklch,
      var(--ui-secondary) 85%,
      var(--ui-foreground)
    );
  }
}
@media (max-height: 700px) {
  .ui-numeric-key {
    min-height: 46px;
  }
}
@media (max-height: 600px) and (max-width: 650px) {
  .ui-numeric-key {
    min-height: 44px;
  }
}
</style>
