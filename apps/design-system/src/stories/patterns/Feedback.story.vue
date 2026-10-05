<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import { BaseButton, BaseInput, BaseField, BaseFieldLabel } from "@form/ui";
const message = ref("");
const search = ref("Unmatched exercise");
</script>
<template>
  <Story title="03 Patterns/Empty states and errors">
    <Variant title="Empty workout history"
      ><div class="stack">
        <div class="pattern-card stack">
          <h1>Your first workout starts here.</h1>
          <p class="note">
            Choose exercises and log your first set. Your workout will then
            appear here.
          </p>
          <BaseButton
            @click="message = 'The app would open the exercise picker here.'"
            >Start workout</BaseButton
          >
          <p role="status">{{ message }}</p>
        </div>
      </div></Variant
    >
    <Variant title="No search results"
      ><div class="stack">
        <BaseField
          ><BaseFieldLabel for="empty-search">Search exercises</BaseFieldLabel
          ><BaseInput id="empty-search" v-model="search"
        /></BaseField>
        <p role="status">
          {{
            search
              ? `No exercises match “${search}”.`
              : "Search cleared. The app would show available exercises here."
          }}
        </p>
        <BaseButton
          :disabled="!search"
          @click="
            search = '';
            logEvent('Illustrative search: cleared', null);
          "
          >Clear search</BaseButton
        >
        <p class="note">
          Illustrative empty-result state; no catalog is queried.
        </p>
      </div></Variant
    >
    <Variant title="Save error"
      ><div class="stack">
        <div class="pattern-card stack">
          <h1>Your input could not be saved.</h1>
          <p>Your input stays visible. Try again before closing this view.</p>
          <p role="alert">Saving is currently unavailable.</p>
          <BaseButton @click="message = 'Tried again — simulated feedback.'"
            >Try again</BaseButton
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
