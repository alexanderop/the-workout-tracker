<script setup lang="ts">
import { onMounted, ref } from "vue";
const colors = [
  {
    name: "Background",
    token: "background",
    use: "The quiet base layer of the app.",
  },
  {
    name: "Surface",
    token: "surface",
    use: "Distinct fields, cards and secondary actions.",
  },
  { name: "Primary text", token: "text", use: "High-priority content." },
  {
    name: "Secondary text",
    token: "muted",
    use: "Help text, metadata and descriptions.",
  },
  {
    name: "Primary action",
    token: "ui-primary",
    use: "The most important action in the current section.",
  },
  {
    name: "Error",
    token: "ui-destructive",
    use: "Invalid inputs and destructive actions.",
  },
  {
    name: "Keyboard focus",
    token: "ui-ring",
    use: "Visible guidance for keyboard navigation.",
  },
];
const values = ref<Record<string, string>>({});
onMounted(() => {
  const style = getComputedStyle(document.documentElement);
  values.value = Object.fromEntries(
    colors.map((color) => [
      color.token,
      style.getPropertyValue(`--${color.token}`).trim(),
    ]),
  );
});
</script>
<template>
  <Story title="01 Foundations/Colors and meaning">
    <Variant title="Semantic palette"
      ><div class="stack">
        <h1>Color has a purpose.</h1>
        <p class="note">
          Meaning comes first, followed by the technical token. Values come
          directly from our shared theme.
        </p>
        <div class="token-grid">
          <figure v-for="color in colors" :key="color.token" class="token">
            <div
              class="token-swatch"
              :style="{ background: `var(--${color.token})` }"
            />
            <figcaption>
              <strong>{{ color.name }}</strong
              ><span>{{ color.use }}</span
              ><code>--{{ color.token }} · {{ values[color.token] }}</code>
            </figcaption>
          </figure>
        </div>
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# Colors

## Usage

Communicate priorities, relationships and feedback.

## Variants

Background, surface, text, primary action, error and focus.

## States

Never communicate errors through color alone; include a clear message.

## Behavior

All examples read the shared CSS variables. This story does not store a separate copy of the palette.

## Examples and limitations

Use purple for focus or the primary action, not arbitrary decoration. Sources: @form/ui/tokens.css and workout-theme.css.
</docs>
