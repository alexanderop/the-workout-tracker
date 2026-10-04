<script setup lang="ts">
const spaces = [4, 8, 12, 16, 24, 32];
</script>
<template>
  <Story title="01 Foundations/Spacing and sizes">
    <Variant title="Rhythm"
      ><div class="preview stack">
        <h1>Proximity shows relationships.</h1>
        <p class="note">
          Reference values for new compositions; no additional global CSS tokens.
        </p>
        <div v-for="space in spaces" :key="space" class="row">
          <code>{{ space }} px</code>
          <div
            :style="{
              width: `${space}px`,
              height: '24px',
              background: 'var(--ui-primary)',
            }"
          />
        </div>
        <div class="pattern-card">
          <strong>Touch interaction</strong>
          <p>
            Give primary mobile actions targets of at least 44 × 44 px. Review compact desktop sizes before using them on mobile.
          </p>
        </div>
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# Spacing

## Usage

Group content and guide attention to the next action.

## Variants

Small gaps within a field, larger gaps between groups.

## States

Wrap content on narrow screens instead of squeezing controls.

## Behavior

The 4–32 px reference scale is design guidance, not a claim that the app already has a tokenized spacing scale.

## Examples and limitations

Leave enough space between Apply and Delete. Touch targets are larger than the icons inside them.
</docs>
