<script setup lang="ts">
import { defineComponent, h, ref } from "vue";
import BaseBackLink from "../../src/back-link/BaseBackLink.vue";

const visited = ref("");
// Stands in for a router link: it renders an anchor from its own `to` prop.
const FakeRouterLink = defineComponent({
  props: { to: { type: String, required: true } },
  setup(props, { slots }) {
    return () =>
      h(
        "a",
        {
          href: `#${props.to}`,
          onClick: (event: Event) => {
            event.preventDefault();
            visited.value = props.to;
          },
        },
        slots.default?.(),
      );
  },
});
</script>

<template>
  <main>
    <BaseBackLink href="#plain">Settings</BaseBackLink>
    <BaseBackLink :as="FakeRouterLink" to="/workouts">Workouts</BaseBackLink>
    <BaseBackLink as="button" @click="visited = 'button'"
      >Exercises</BaseBackLink
    >
    <output data-testid="visited">{{ visited }}</output>
  </main>
</template>

<style scoped>
main {
  display: grid;
  justify-items: start;
  background: var(--ui-background);
  color: var(--ui-foreground);
}
</style>
