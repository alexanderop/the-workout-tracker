<script setup lang="ts">
import { ref } from "vue";
import ProductPreview from "../../ProductPreview.vue";
import ProductPreviewControls from "../../ProductPreviewControls.vue";
import { previewsIn } from "../../previewCatalog";
const examples = previewsIn("progress");
const revision = ref(0);
function resetExample() { revision.value += 1; }
</script>

<template>
  <Story id="pages-progress" title="04 Pages/Progress" :layout="{ type: 'single', iframe: true }" :meta="{ wrapper: false }">
    <Variant v-for="example in examples" :id="example.id" :key="example.id" :title="example.title">
      <ProductPreview :scenario="example.id" :revision="revision" />
      <template #controls>
        <ProductPreviewControls :scenario="example.id" :revision="revision" @reset="resetExample" />
      </template>
    </Variant>
  </Story>
</template>

<docs lang="md">
# Progress

## Usage

Review the real application with isolated sample data. Select a named state in the sidebar,
then use the Controls panel for the example guide, reset, and a link to open it separately.

## Variants and states

Each variant starts directly in its named state. The application owns these examples,
including their data, navigation and interactions. Pages show starting states; flows include steps to try.

## Behavior

Interact with the screen normally. Use the viewport menu to review phone and desktop layouts.
The application receives the full canvas width and height. Controls sit outside that viewport.
Reset example restores its original data and route. Confirming a number and logging a set are separate actions.

## Examples and limitations

Sample workouts are fictional. Edits never change your personal journal and disappear on reset or reload.
Installation and offline behavior are outside these previews. Settings exports can download sample data;
imports and deletion affect only the current example. These examples do not simulate storage failures or other tabs.
</docs>
