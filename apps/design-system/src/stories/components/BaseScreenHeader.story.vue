<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import { BaseListGroup, BaseListRow, BaseScreenHeader } from "@form/ui";
import { ChevronLeft } from "@lucide/vue";

const title = ref("Appearance");
const revision = ref(0);
</script>

<template>
  <Story title="02 Components/BaseScreenHeader">
    <Variant title="Usage">
      <div :key="revision">
        <BaseScreenHeader :title="title">
          <template #back>
            <a
              href="#settings"
              @click.prevent="logEvent('BaseScreenHeader: back')"
              ><ChevronLeft :size="22" aria-hidden="true" />Settings</a
            >
          </template>
        </BaseScreenHeader>
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
        ><HstText v-model="title" title="Title (try a long one)" /><HstButton
          @click="revision += 1"
          >Show screen again (moves focus to the heading)</HstButton
        ></template
      >
    </Variant>
  </Story>
</template>

<docs lang="md">
# BaseScreenHeader

## Usage

The bar at the top of a detail screen reached from a hub: a back control on the left and the screen title, which is the page heading, in the centre. A hairline separates it from the content.

## Variants

The `back` slot takes the application's link, usually with a chevron icon. Its colour and 44px target come from the header.

## States

The bar is pinned to the top of the viewport while the content scrolls beneath it. It reserves the device safe area at the top of the screen.

## Behavior

When the header appears, its heading takes focus (without scrolling), so a person who opens a page by keyboard or with a screen reader hears where they are. Pressing the back control returns to the hub; the application restores focus to the row that opened the screen. Long titles wrap instead of overlapping the back control.

## Examples and limitations

The back link in this story only logs an event. Pinning needs the header's container to be taller than the viewport; scroll the sample list.
</docs>
