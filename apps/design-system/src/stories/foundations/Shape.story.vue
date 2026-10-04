<script setup lang="ts"></script>
<template>
  <Story title="01 Foundations/Corners and borders">
    <Variant title="Surfaces"
      ><div class="preview stack">
        <h1>Subtle outlines.</h1>
        <div class="token-grid">
          <div class="pattern-card">
            <strong>Container</strong>
            <p>Shared radius: <code>--ui-radius</code></p>
          </div>
          <div
            class="pattern-card"
            style="border-radius: calc(var(--ui-radius) - 2px)"
          >
            <strong>Control</strong>
            <p>Slightly smaller corners inside the surface.</p>
          </div>
        </div>
        <p class="note">
          Border: --ui-border. Keep separation subtle and focus clear.
        </p>
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# Corners and borders

## Usage

Separate surfaces without overwhelming the view with lines.

## Variants

Shared radius and a smaller control radius derived from it. Dialogs may use their own radius to suit their context.

## States

A normal border and a clearly visible focus ring serve different purposes.

## Behavior

Radii and borders follow the components; stories do not create a second implementation.

## Examples and limitations

Not every piece of text needs a card. Spacing can also define groups.
</docs>
