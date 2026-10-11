<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import {
  BaseButton,
  BaseListGroup,
  BaseListRow,
  BaseSelectNative,
  BaseSwitch,
} from "@form/ui";
import {
  Archive,
  Check,
  Dumbbell,
  Languages,
  Palette,
  Trash2,
} from "@lucide/vue";

const label = ref("Appearance");
const value = ref("System · Blue");
const autoRest = ref(true);
const rest = ref<string | number>(90);
const density = ref<"compact" | "comfortable">("comfortable");
const picked = ref<string[]>(["Arnold press"]);
const exercises = [
  ["Ab wheel rollout", "Other"],
  ["Arnold press", "Dumbbell"],
  ["Back squat", "Barbell"],
  ["Bench press", "Barbell"],
] as const;
function toggle(name: string) {
  picked.value = picked.value.includes(name)
    ? picked.value.filter((entry) => entry !== name)
    : [...picked.value, name];
}
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
          <template #trailing>
            <BaseSwitch v-model="autoRest" aria-label="Automatic rest timer" />
          </template>
        </BaseListRow>
        <BaseListRow
          as="label"
          label="Rest between sets"
          description="Choose the pace that suits your session."
        >
          <template #trailing>
            <BaseSelectNative
              v-model="rest"
              aria-label="Rest duration"
              style="width: 104px"
            >
              <option :value="60">60 sec</option>
              <option :value="90">90 sec</option>
              <option :value="120">120 sec</option>
            </BaseSelectNative>
          </template>
        </BaseListRow>
        <BaseListRow label="Weight unit" value="Kilograms · kg" />
      </BaseListGroup>
    </Variant>
    <Variant title="Subtitle lines, a group action and a chevron">
      <BaseListGroup label="Latest workout">
        <template #action>
          <BaseButton variant="link" size="sm">View history</BaseButton>
        </template>
        <BaseListRow
          as="button"
          chevron
          label="Evening strength"
          @click="logEvent('BaseListRow: click', { row: 'Evening strength' })"
        >
          <template #subtitle>
            <span>Oct 11 · 24 min · 3 sets · 800 kg</span>
            <span>Back squat · Bench press · Romanian deadlift</span>
          </template>
        </BaseListRow>
        <BaseListRow
          as="button"
          chevron
          label="Morning strength"
          @click="logEvent('BaseListRow: click', { row: 'Morning strength' })"
        >
          <template #subtitle>
            <span>Oct 10 · 1 hr · 2 sets · 640 kg</span>
          </template>
        </BaseListRow>
      </BaseListGroup>
    </Variant>
    <Variant title="Leading artwork, density and selection">
      <BaseListGroup>
        <BaseListRow
          v-for="[name, equipment] in exercises"
          :key="name"
          as="button"
          :density="density"
          :label="name"
          :selected="picked.includes(name)"
          :aria-pressed="picked.includes(name)"
          @click="toggle(name)"
        >
          <template #leading>
            <span class="art" aria-hidden="true"><Dumbbell :size="22" /></span>
          </template>
          <template #subtitle
            ><span>{{ equipment }}</span></template
          >
          <template #trailing>
            <span class="check" aria-hidden="true"
              ><Check v-if="picked.includes(name)" :size="17"
            /></span>
          </template>
        </BaseListRow>
      </BaseListGroup>
      <template #controls
        ><HstSelect
          v-model="density"
          title="Density"
          :options="['comfortable', 'compact']"
      /></template>
    </Variant>
  </Story>
</template>

<style scoped>
.art {
  display: grid;
  flex: 0 0 52px;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  background: var(--background);
  color: var(--muted);
}
.check {
  display: grid;
  flex: 0 0 24px;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 1px solid var(--muted);
  border-radius: 50%;
  color: var(--ui-selected-text);
}
</style>

<docs lang="md">
# BaseListGroup and BaseListRow

## Usage

A group is a bordered card that holds rows and may carry a small uppercase label and an action opposite it (a "View history" link). A row has a title and, optionally, a leading tile or artwork, subtitle lines, and trailing content: a value, a control, a check circle or a chevron. Use groups wherever the app lists things: the settings hub, workout history, the exercise catalog, filters and the calendar's day list. Do not hand-roll card rows.

## Variants

`BaseListRow` renders any element or component through `as`. Pass `as="a"` (or a router link component) with `chevron` for a link row, `as="button"` for a row that does something in place (open a sheet, toggle a selection), and `as="label"` with a control in the `trailing` slot for a row that toggles or selects. Without `as` the row is a plain `div` that shows information. Native attributes such as `href`, `to`, `aria-pressed` and listeners fall through to the rendered element.

The slots: `leading` (artwork; the `icon` prop is the shortcut for a 32px tile in the `primary`, `muted` or `destructive` tone), `subtitle` (each `span` is one muted line; `description` is the plain-text shortcut) and `trailing` (`value` is the shortcut). `density` is `comfortable` (56px minimum, the default) or `compact` (44px minimum, tighter padding) for a long list. `selected` draws the shared selected look; pair it with `aria-pressed`.

## States

Interactive rows show a hover tint with a fine pointer (touch screens keep none after a tap) and a focus ring inside the row. Rows are separated by one `--rule` hairline. A disabled button row dims. Long titles and values wrap.

## Behavior

The row is the click and focus target, so the whole row is at least 44px high. The chevron is one 18px glyph and decorative. A row's accessible name is its title followed by its subtitle and trailing text. Put what a screen reader needs (a muscle group, say) in the subtitle, visually hidden if it is not shown. `scroll` on the group makes its card the scroll container for a long list; give the group a bounded height, and keep at least one focusable row inside.

## Examples and limitations

The story rows only log events; they do not navigate. The library does not depend on a router: the application passes its link component. A row holds one primary action. A row with several actions (edit and start) puts them in its subtitle slot as buttons, and the row itself is not interactive.
</docs>
