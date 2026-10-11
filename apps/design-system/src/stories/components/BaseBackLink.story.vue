<script setup lang="ts">
import { defineComponent, h, ref } from "vue";
import { logEvent } from "histoire/client";
import { BaseBackLink } from "@form/ui";

const label = ref("Settings");
// Stands in for a router link, which the application passes with `as`.
const SampleRouterLink = defineComponent({
  props: { to: { type: String, required: true } },
  setup(props, { slots }) {
    return () =>
      h(
        "a",
        {
          href: `#${props.to}`,
          onClick: (event: Event) => {
            event.preventDefault();
            logEvent("Router link: navigate", { to: props.to });
          },
        },
        slots.default?.(),
      );
  },
});
</script>

<template>
  <Story title="02 Components/BaseBackLink">
    <Variant title="Usage">
      <div class="stack">
        <BaseBackLink
          href="#settings"
          @click.prevent="logEvent('BaseBackLink: click', { label })"
          >{{ label }}</BaseBackLink
        >
      </div>
      <template #controls
        ><HstText v-model="label" title="Destination (try a long one)"
      /></template>
    </Variant>
    <Variant title="As a router link or a button">
      <div class="stack">
        <BaseBackLink :as="SampleRouterLink" to="/workouts"
          >Workouts</BaseBackLink
        >
        <BaseBackLink
          as="button"
          @click="logEvent('BaseBackLink: button', null)"
          >Exercises</BaseBackLink
        >
      </div>
    </Variant>
  </Story>
</template>

<docs lang="md">
# BaseBackLink

## Usage

The one back affordance: a chevron and the name of the destination ("Settings", "Workouts"). Never an arrow, and never the word "Back" alone.

## Variants

It renders an anchor by default. `as` picks another element or component: pass the router's link component with its `to` prop, or `"button"` for an action that is not a navigation (it defaults to `type="button"`). The package does not depend on a router; attributes and listeners fall through to the rendered element.

## States

Accent text with a 44px target. The hover color follows the accent. A keyboard focus shows the shared 3px focus ring.

## Behavior

Place it in the `back` slot of `BasePageHeader`, or above a title. The chevron is decorative; the label is the accessible name.

## Examples and limitations

The links in this story only log events. Focus restoration after navigating back belongs to the application.
</docs>
