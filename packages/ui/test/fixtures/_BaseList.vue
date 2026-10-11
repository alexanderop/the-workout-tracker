<script setup lang="ts">
import { ref } from "vue";
import { Palette } from "@lucide/vue";
import BaseListGroup from "../../src/list/BaseListGroup.vue";
import BaseListRow from "../../src/list/BaseListRow.vue";

// A hub-style group: link rows with a value, and a plain row without a link.
// The scrolling group is opt-in: axe cannot judge rows clipped by a scroll box.
defineProps<{ scrolling?: boolean }>();
const opened = ref("");
const picked = ref<string[]>([]);
const toggle = (id: string) => {
  picked.value = picked.value.includes(id)
    ? picked.value.filter((entry) => entry !== id)
    : [...picked.value, id];
};
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
      <BaseListRow
        label="Secondary muscles"
        value="Back, Shoulders, Arms, Core and Legs"
        data-testid="long-value"
      />
    </BaseListGroup>
    <BaseListGroup label="Workouts" data-testid="workouts">
      <template #action
        ><button type="button" @click="opened = 'history'">
          View all
        </button></template
      >
      <BaseListRow
        v-for="id in ['squat', 'bench']"
        :key="id"
        as="button"
        density="compact"
        :label="id === 'squat' ? 'Back squat' : 'Bench press'"
        :selected="picked.includes(id)"
        :aria-pressed="picked.includes(id)"
        :data-testid="`pick-${id}`"
        @click="toggle(id)"
      >
        <template #leading
          ><span class="art" data-testid="art" aria-hidden="true"
        /></template>
        <template #subtitle
          ><span
            >{{ id === "squat" ? "Legs" : "Chest" }} · Barbell</span
          ></template
        >
        <template #trailing
          ><span class="mark">{{
            picked.includes(id) ? "On" : "Off"
          }}</span></template
        >
      </BaseListRow>
      <BaseListRow
        as="button"
        chevron
        label="Latest workout"
        data-testid="comfortable"
        @click="opened = 'latest'"
      >
        <template #subtitle
          ><span>Oct 11 · 24 min</span
          ><span>Back squat · Bench press</span></template
        >
      </BaseListRow>
    </BaseListGroup>
    <BaseListGroup
      v-if="scrolling"
      scroll
      class="scrolling"
      label="Long"
      data-testid="scrolling"
    >
      <BaseListRow v-for="n in 30" :key="n" as="button" :label="`Row ${n}`" />
    </BaseListGroup>
    <output data-testid="opened">{{ opened }}</output>
  </main>
</template>

<style scoped>
main {
  background: var(--ui-background);
  color: var(--ui-foreground);
}
.art {
  display: block;
  flex: 0 0 52px;
  width: 52px;
  height: 52px;
  background: var(--muted);
}
.scrolling {
  height: 200px;
}
</style>
