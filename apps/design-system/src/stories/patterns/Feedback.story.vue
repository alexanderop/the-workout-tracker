<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@form/ui";
const message = ref("");
</script>
<template>
  <Story title="03 Patterns/Empty states and errors">
    <Variant title="Empty workout history"
      ><div class="preview stack">
        <div class="pattern-card stack">
          <h1>Your first workout starts here.</h1>
          <p class="note">
            Choose exercises and log your first set. Your workout will then appear here.
          </p>
          <Button
            @click="message = 'The app would open the exercise picker here.'"
            >Start workout</Button
          >
          <p role="status">{{ message }}</p>
        </div>
      </div></Variant
    >
    <Variant title="Save error"
      ><div class="preview stack">
        <div class="pattern-card stack">
          <h1>Your input could not be saved.</h1>
          <p>
            Your input stays visible. Try again before closing this view.
          </p>
          <p role="alert">Saving is currently unavailable.</p>
          <Button @click="message = 'Tried again — simulated feedback.'"
            >Try again</Button
          >
          <p role="status">{{ message }}</p>
        </div>
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# Empty states and errors

## Usage

Provide guidance and a concrete next action.

## Variants

First use without data, no search results and unsaved input.

## States

An empty state is not an error. An error explains the cause or consequence and offers a next step.

## Behavior

Feedback uses status or alert roles for assistive technology.

## Examples and limitations

Do not invent workout history for decoration. The error story simulates the state without accessing real storage.
</docs>
