<script setup lang="ts">
import {
  Button,
  Input,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@form/ui";
import "@form/ui/tokens.css";
import "@form/ui/styles.css";
const variants = [
  "default",
  "destructive",
  "outline",
  "secondary",
  "ghost",
  "link",
] as const;
const sizes = [
  "default",
  "xs",
  "sm",
  "lg",
  "icon",
  "icon-xs",
  "icon-sm",
  "icon-lg",
] as const;
</script>
<template>
  <main class="visual-board" aria-label="Component states">
    <h1>Form UI</h1>
    <h2>Buttons</h2>
    <div class="visual-row">
      <Button v-for="variant in variants" :key="variant" :variant="variant">{{
        variant
      }}</Button>
    </div>
    <div class="visual-row">
      <Button
        v-for="variant in variants"
        :key="variant"
        :variant="variant"
        disabled
        >{{ variant }}</Button
      >
    </div>
    <div class="visual-row">
      <Button
        v-for="size in sizes"
        :key="size"
        :size="size"
        :aria-label="size"
        >{{ size.startsWith("icon") ? "+" : size }}</Button
      >
    </div>
    <Button variant="outline">Focused outline</Button>
    <h2>Fields</h2>
    <div class="visual-fields">
      <Field
        ><FieldLabel for="visual-name">Workout name</FieldLabel
        ><Input
          id="visual-name"
          default-value="Morning strength"
        /><FieldDescription
          >Shown in your workout list.</FieldDescription
        ></Field
      >
      <Field data-invalid="true"
        ><FieldLabel for="visual-error">Email address</FieldLabel
        ><Input
          id="visual-error"
          default-value="invalid address"
          aria-invalid="true"
          aria-describedby="visual-error-text"
        /><FieldError id="visual-error-text"
          >Enter a valid email address.</FieldError
        ></Field
      >
      <Field
        ><FieldLabel for="visual-disabled">Unavailable</FieldLabel
        ><Input
          id="visual-disabled"
          disabled
          default-value="Managed by your coach"
      /></Field>
      <Field
        ><FieldLabel for="visual-long"
          >A longer label that wraps naturally on smaller viewports</FieldLabel
        ><Input id="visual-long" placeholder="Enter a value"
      /></Field>
    </div>
  </main>
</template>
<style>
.visual-board {
  box-sizing: border-box;
  padding: 28px;
  background: var(--ui-background);
  color: var(--ui-foreground);
  font-family: Inter, sans-serif;
}
.visual-board h1 {
  font-size: 26px;
  margin: 0 0 24px;
}
.visual-board h2 {
  font-size: 18px;
  margin: 24px 0 16px;
}
.visual-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}
.visual-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}
@media (max-width: 500px) {
  .visual-fields {
    grid-template-columns: 1fr;
  }
}
</style>
