<script setup lang="ts"></script>
<template>
  <Story title="01 Foundations/Typography">
    <Variant title="Hierarchy"
      ><div class="stack">
        <p class="eyebrow">WORKOUT JOURNAL</p>
        <h1 class="type-page">One set at a time.</h1>
        <h2 class="type-section">Your next workout</h2>
        <p class="type-body">Clear, short sentences support the action.</p>
        <p class="note">Supporting information takes a quieter visual role.</p>
        <div class="number-sample">70.25 <small>kg</small></div>
        <p class="note">
          Tabular digits keep measurements and timers visually stable.
        </p>
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# Typography

## Usage

Geist Variable connects navigation, forms and workout values.

## Variants

Page title, section heading, body text, help text and measurement.

## States

Size, weight and spacing establish hierarchy.

## Behavior

Long content must wrap. Measurements use tabular-nums.

## Examples and limitations

This page shows typographic roles. App-specific sizes stay in the workout app; shared components inherit the font family.
</docs>
