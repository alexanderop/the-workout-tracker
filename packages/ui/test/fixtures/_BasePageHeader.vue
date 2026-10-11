<script setup lang="ts">
import { ref } from "vue";
import BaseBackLink from "../../src/back-link/BaseBackLink.vue";
import BaseButton from "../../src/button/BaseButton.vue";
import BasePageHeader from "../../src/page/BasePageHeader.vue";

// The screen opens on request, like a page after a navigation.
const {
  open = true,
  variant = "detail",
  withAction = true,
  longTitle = false,
} = defineProps<{
  open?: boolean;
  variant?: "root" | "detail";
  withAction?: boolean;
  longTitle?: boolean;
}>();
const longName = "A very long workout name ".repeat(12);
const shown = ref(open);
</script>

<template>
  <main>
    <button type="button" @click="shown = true">Open screen</button>
    <template v-if="shown">
      <BasePageHeader
        :variant="variant"
        :title="
          longTitle ? longName : variant === 'root' ? 'Exercises' : 'Appearance'
        "
      >
        <template #back
          ><BaseBackLink href="#settings">Settings</BaseBackLink></template
        >
        <template v-if="withAction" #action
          ><BaseButton type="button" variant="link" size="sm"
            >Create</BaseButton
          ></template
        >
      </BasePageHeader>
      <p v-for="n in 40" :key="n">Row {{ n }}</p>
    </template>
  </main>
</template>

<style scoped>
main {
  background: var(--ui-background);
  color: var(--ui-foreground);
}
</style>
