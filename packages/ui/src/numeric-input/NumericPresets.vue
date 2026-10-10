<script setup lang="ts">
import BaseButton from "../button/BaseButton.vue";
import { useNumericText } from "./useNumericText";

defineProps<{ presets: number[]; unit: string }>();
const emit = defineEmits<{ pick: [preset: number] }>();
const { text } = useNumericText();
</script>

<template>
  <section class="ui-numeric-suggestions" :aria-label="text.suggestions">
    <p>{{ text.quickPick }} <span>{{ text.tapToUse }}</span></p>
    <div class="ui-numeric-presets">
      <BaseButton
        v-for="preset in presets"
        :key="preset"
        type="button"
        variant="secondary"
        class="ui-numeric-preset"
        :aria-label="text.usePreset({ value: preset, unit })"
        @click="emit('pick', preset)"
        >{{ preset }}<small v-if="unit">{{ unit }}</small></BaseButton
      >
    </div>
  </section>
</template>

<style scoped>
.ui-numeric-suggestions > p {
  margin: 0 0 10px;
  font-size: 12px;
}

.ui-numeric-suggestions > p > span {
  float: right;
  color: var(--ui-muted-foreground);
  font-size: 11px;
}

.ui-numeric-presets {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.ui-numeric-preset {
  min-height: 44px;
  padding: 8px 4px;
  border-radius: 7px;
  background: var(--ui-secondary);
  color: var(--ui-foreground);
  font-size: 14px;
}

.ui-numeric-preset small {
  margin-inline-start: 4px;
  font-size: 10px;
  color: var(--ui-muted-foreground);
}
@media (hover: hover) and (pointer: fine) {
  .ui-numeric-preset:hover {
    background: color-mix(
      in oklch,
      var(--ui-secondary) 85%,
      var(--ui-foreground)
    );
  }
}
@media (max-height: 600px) and (max-width: 650px) {
  .ui-numeric-suggestions > p {
    margin-block-end: 6px;
  }
}
</style>
