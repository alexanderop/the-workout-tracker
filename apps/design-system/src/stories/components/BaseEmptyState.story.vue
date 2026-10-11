<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import { BaseButton, BaseEmptyState, type EmptyStateSize } from "@form/ui";
import { Dumbbell, SearchX } from "@lucide/vue";

const size = ref<EmptyStateSize>("panel");
const title = ref("No workouts yet");
const body = ref("Start your first session and it appears here.");
const withIcon = ref(true);
const withAction = ref(true);
</script>

<template>
  <Story title="02 Components/BaseEmptyState">
    <Variant title="Usage">
      <div class="stack">
        <BaseEmptyState :size="size" :title="title" :body="body">
          <template v-if="withIcon" #icon><Dumbbell :size="28" /></template>
          <template v-if="withAction" #action
            ><BaseButton @click="logEvent('BaseEmptyState: action', null)"
              >Start workout</BaseButton
            ></template
          >
        </BaseEmptyState>
      </div>
      <template #controls>
        <HstSelect
          v-model="size"
          title="Size"
          :options="['panel', 'compact']"
        />
        <HstText v-model="title" title="Title" />
        <HstText v-model="body" title="Body" />
        <HstCheckbox v-model="withIcon" title="Icon" />
        <HstCheckbox v-model="withAction" title="Action" />
      </template>
    </Variant>
    <Variant title="Compact in a list">
      <div class="stack">
        <BaseEmptyState size="compact" :heading-level="3" title="No results">
          <template #icon><SearchX :size="24" /></template>
          <template #action
            ><BaseButton variant="link" size="sm"
              >Clear filters</BaseButton
            ></template
          >
        </BaseEmptyState>
      </div>
    </Variant>
  </Story>
</template>

<docs lang="md">
# BaseEmptyState

## Usage

Names what is missing and offers the next action: no workouts yet, no search results, no exercises in a template. Show real data and never fabricated statistics.

## Variants

`panel` fills a page or card region with a surface and border. `compact` has no surface and sits inside a list or section. `heading-level` (2 to 6) sets the title's heading level; choose the one that fits the page outline.

## States

Icon, body and action are optional; the title is required. The icon is decorative and hidden from assistive technology.

## Behavior

The component is static. The action slot takes a regular control, usually a `BaseButton`, and it keeps its own focus and keyboard behavior.

## Examples and limitations

Long titles and bodies wrap and center. Use the Controls to try them.
</docs>
