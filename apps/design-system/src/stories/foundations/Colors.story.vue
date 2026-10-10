<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from "vue";
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
  {
    name: "Border",
    token: "border",
    use: "Outlines of cards, fields and dividers.",
  },
  { name: "Primary text", token: "text", use: "High-priority content." },
  {
    name: "Secondary text",
    token: "muted",
    use: "Help text, metadata and descriptions.",
  },
  {
    name: "Accent",
    token: "accent",
    use: "The most important action, logged sets, progress and selection.",
  },
  {
    name: "Soft accent",
    token: "accent-soft",
    use: "Quiet backgrounds that mark a selection or a notice.",
  },
  {
    name: "Error",
    token: "danger",
    use: "Invalid inputs and destructive actions.",
  },
  {
    name: "Keyboard focus",
    token: "focus-ring",
    use: "Visible guidance for keyboard navigation.",
  },
];
const accents = [
  { id: "blue", name: "Blue" },
  { id: "teal", name: "Teal" },
  { id: "violet", name: "Violet" },
  { id: "pink", name: "Pink" },
  { id: "sand", name: "Sand" },
];
const values = ref<Record<string, string>>({});
const accentValues = ref<Record<string, string>>({});
const swatches = useTemplateRef<HTMLElement[]>("swatches");
onMounted(() => {
  const style = getComputedStyle(document.documentElement);
  values.value = Object.fromEntries(
    colors.map((color) => [
      color.token,
      style.getPropertyValue(`--${color.token}`).trim(),
    ]),
  );
  accentValues.value = Object.fromEntries(
    (swatches.value ?? []).map((swatch) => [
      swatch.dataset.accent ?? "",
      getComputedStyle(swatch).getPropertyValue("--accent").trim(),
    ]),
  );
});
</script>
<template>
  <Story id="foundations-colors" title="01 Foundations/Colors and meaning">
    <Variant id="palette" title="Semantic palette"
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
    <Variant id="accents" title="Accent colors"
      ><div class="stack">
        <h1>One accent, five choices.</h1>
        <p class="note">
          People pick the accent in Settings. Each one has a light and a dark
          value with enough contrast for text and for the label on a filled
          button.
        </p>
        <div class="token-grid">
          <figure v-for="accent in accents" :key="accent.id" class="token">
            <div
              ref="swatches"
              class="token-swatch"
              :data-accent="accent.id"
              :style="{ background: 'var(--accent)' }"
            />
            <figcaption>
              <strong>{{ accent.name }}</strong
              ><code>{{ accentValues[accent.id] }}</code>
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

Background, surface, border, text, accent, error and focus in the active theme, and the five accent colors.

## States

Never communicate errors through color alone; include a clear message.

## Behavior

All examples read the shared CSS variables. Each value is a light-dark() pair, so the light and dark colors appear together. This story does not store a separate copy of the palette.

`pnpm verify` enforces raw-color restrictions and checks static CSS variable references against the shared stylesheets. Tailwind classes must use named utilities or existing variables, such as `bg-(--ui-primary)`. Arbitrary values such as `rounded-[13px]` are rejected. Dynamic token names still require review.

## Examples and limitations

The palette follows the light or dark theme, which this explorer sets through its color scheme control. Use the accent for focus or the primary action, not arbitrary decoration. Sources: @form/ui/tokens.css and workout-theme.css.
</docs>
