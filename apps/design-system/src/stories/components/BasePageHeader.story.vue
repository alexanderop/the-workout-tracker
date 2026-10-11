<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import {
  BaseBackLink,
  BaseButton,
  BaseListGroup,
  BaseListRow,
  BasePageHeader,
  type PageHeaderVariant,
} from "@form/ui";

const title = ref("Appearance");
const variant = ref<PageHeaderVariant>("detail");
const withAction = ref(false);
const revision = ref(0);
</script>

<template>
  <Story title="02 Components/BasePageHeader">
    <Variant title="Usage">
      <div :key="`${revision}-${variant}`">
        <BasePageHeader :variant="variant" :title="title">
          <template #back>
            <BaseBackLink
              href="#settings"
              @click.prevent="logEvent('BasePageHeader: back', null)"
              >Settings</BaseBackLink
            >
          </template>
          <template v-if="withAction" #action
            ><BaseButton
              variant="link"
              size="sm"
              @click="logEvent('BasePageHeader: action', null)"
              >Create</BaseButton
            ></template
          >
        </BasePageHeader>
        <div class="stack">
          <BaseListGroup>
            <BaseListRow
              v-for="n in 20"
              :key="n"
              :label="`Row ${n}`"
              value="Scroll to see the bar stay"
            />
          </BaseListGroup>
        </div>
      </div>
      <template #controls
        ><HstSelect
          v-model="variant"
          title="Variant"
          :options="['detail', 'root']"
        /><HstText v-model="title" title="Title (try a long one)" /><HstCheckbox
          v-model="withAction"
          title="Action"
        /><HstButton @click="revision += 1"
          >Show screen again (detail moves focus to the heading)</HstButton
        ></template
      >
    </Variant>
  </Story>
</template>

<docs lang="md">
# BasePageHeader

## Usage

The heading of a screen. `root` is the large title of a tab root (Workouts, Exercises, Progress, Settings) with no back link. `detail` is the pinned bar of a screen reached from a root: a back link on the left and the title in the center. The title is the page's `h1`, uses the text color and never the accent.

## Variants

Both variants take `back` (detail only), `title` (replaces the title text inside the `h1`) and `action` slots. `title` can also be passed as a prop. Put a `BaseBackLink` in `back` and a `BaseButton variant="link" size="sm"` in `action`.

## States

The detail bar is pinned to the top while the content scrolls and covers the device safe area. A hairline separates it from the content. The root title scrolls away with the page.

## Behavior

When a detail header appears, its heading takes focus without scrolling, so people who navigate by keyboard or screen reader hear where they are; pressing back returns to the hub and the application restores focus to the row that opened the page. A root header leaves focus to the application shell. The component exposes `focus()` for a root that needs it.

## Examples and limitations

The back link in this story only logs an event. Pinning needs a container taller than the viewport; scroll the sample list. Long titles wrap instead of overlapping the back link.
</docs>
