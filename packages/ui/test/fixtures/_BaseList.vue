<script setup lang="ts">
import { ref } from "vue";
import { Palette } from "@lucide/vue";
import BaseListGroup from "../../src/list/BaseListGroup.vue";
import BaseListRow from "../../src/list/BaseListRow.vue";

// A hub-style group: link rows with a value, and a plain row without a link.
const opened = ref("");
</script>

<template>
  <main>
    <BaseListGroup label="Preferences">
      <BaseListRow
        as="a"
        href="#appearance"
        chevron
        :icon="Palette"
        tone="primary"
        label="Appearance"
        value="System · Blue"
        @click.prevent="opened = 'appearance'"
      />
      <BaseListRow
        as="a"
        href="#language"
        chevron
        label="Language"
        @click.prevent="opened = 'language'"
      />
      <BaseListRow label="Version" description="Installed build" value="1.0" />
    </BaseListGroup>
    <output data-testid="opened">{{ opened }}</output>
  </main>
</template>

<style scoped>
main {
  background: var(--ui-background);
  color: var(--ui-foreground);
}
</style>
