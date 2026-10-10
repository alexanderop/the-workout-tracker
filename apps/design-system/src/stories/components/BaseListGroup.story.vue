<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import {
  BaseListGroup,
  BaseListRow,
  BaseSelectNative,
  BaseSwitch,
} from "@form/ui";
import { Archive, Languages, Palette, Trash2 } from "@lucide/vue";

const label = ref("Appearance");
const value = ref("System · Blue");
const autoRest = ref(true);
const rest = ref<string | number>(90);
</script>

<template>
  <Story title="02 Components/BaseListGroup">
    <Variant title="Usage">
      <div class="stack">
        <BaseListGroup label="Preferences">
          <BaseListRow
            as="a"
            href="#appearance"
            chevron
            :icon="Palette"
            tone="primary"
            :label="label"
            :value="value"
            @click.prevent="logEvent('BaseListRow: click', { row: label })"
          />
          <BaseListRow
            as="a"
            href="#language"
            chevron
            :icon="Languages"
            tone="primary"
            label="Language"
            value="System"
            @click.prevent="logEvent('BaseListRow: click', { row: 'Language' })"
          />
        </BaseListGroup>
        <BaseListGroup label="Your data">
          <BaseListRow
            as="a"
            href="#export"
            chevron
            :icon="Archive"
            label="Export backup"
            @click.prevent="
              logEvent('BaseListRow: click', { row: 'Export backup' })
            "
          />
          <BaseListRow
            as="a"
            href="#delete"
            chevron
            :icon="Trash2"
            tone="destructive"
            label="Delete all data"
            @click.prevent="
              logEvent('BaseListRow: click', { row: 'Delete all data' })
            "
          />
        </BaseListGroup>
      </div>
      <template #controls
        ><HstText v-model="label" title="Row label (try a long sentence)" />
        <HstText v-model="value" title="Row value"
      /></template>
    </Variant>
    <Variant title="Rows with controls">
      <BaseListGroup>
        <BaseListRow
          as="label"
          label="Automatic rest timer"
          description="Start counting down after a logged set."
        >
          <BaseSwitch v-model="autoRest" aria-label="Automatic rest timer" />
        </BaseListRow>
        <BaseListRow
          as="label"
          label="Rest between sets"
          description="Choose the pace that suits your session."
        >
          <BaseSelectNative
            v-model="rest"
            aria-label="Rest duration"
            style="width: 104px"
          >
            <option :value="60">60 sec</option>
            <option :value="90">90 sec</option>
            <option :value="120">120 sec</option>
          </BaseSelectNative>
        </BaseListRow>
        <BaseListRow label="Weight unit" value="Kilograms · kg" />
      </BaseListGroup>
    </Variant>
  </Story>
</template>

<docs lang="md">
# BaseListGroup and BaseListRow

## Usage

A group is a bordered card that holds rows and may carry a small uppercase label. A row has an optional icon tile, a title, an optional description and either a trailing value, a control, or a chevron. Use groups for a settings hub: each linked row names a section and shows its current choice.

## Variants

`BaseListRow` renders any element or component through `as`. Pass `as="a"` (or a router link component) with `chevron` for a link row. Pass `as="label"` and a control in the default slot for a row that toggles or selects. Without `as` the row is a plain `div` that shows information. Native attributes such as `href`, `to` and listeners fall through to the rendered element. The icon tile takes the `primary` (accent), `muted` or `destructive` tone.

## States

Link rows show a hover tint with a fine pointer (touch screens keep none after a tap) and a focus ring inside the row. Long titles and values wrap.

## Behavior

The row is the click and focus target, so the whole row is at least 56px high. The icon and chevron are decorative. A link row's accessible name is its title followed by its value.

## Examples and limitations

The story links only log events; they do not navigate. The library does not depend on a router: the application passes its link component.
</docs>
