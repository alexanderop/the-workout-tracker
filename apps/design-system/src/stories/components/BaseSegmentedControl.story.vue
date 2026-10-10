<script setup lang="ts">
import { computed, ref } from "vue";
import { logEvent } from "histoire/client";
import { BaseSegmentedControl } from "@form/ui";
import { Monitor, Moon, Sun } from "@lucide/vue";

const theme = ref<"system" | "light" | "dark">("system");
const language = ref<"system" | "en" | "de">("system");
const longLabel = ref("Deutsch");
const themes = [
  { id: "system", label: "System", icon: Monitor },
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
] as const;
const languages = computed(
  () =>
    [
      { id: "system", label: "System" },
      { id: "en", label: "English" },
      { id: "de", label: longLabel.value },
    ] as const,
);
</script>

<template>
  <Story title="02 Components/BaseSegmentedControl">
    <Variant title="Usage">
      <div class="stack">
        <h2>Theme</h2>
        <BaseSegmentedControl
          v-model="theme"
          legend="Theme"
          name="story-theme"
          :options="themes"
          @update:model-value="
            logEvent('BaseSegmentedControl: update:modelValue', {
              value: $event,
            })
          "
        />
        <p role="status">Selected: {{ theme }}</p>
      </div>
    </Variant>
    <Variant title="Without icons">
      <div class="stack">
        <h2>Language</h2>
        <BaseSegmentedControl
          v-model="language"
          legend="App language"
          name="story-language"
          :options="languages"
        />
      </div>
      <template #controls
        ><HstText v-model="longLabel" title="Last label (try a long word)"
      /></template>
    </Variant>
  </Story>
</template>

<docs lang="md">
# BaseSegmentedControl

## Usage

A short, always visible choice between a few options, such as theme or language. The choice applies as soon as it is made.

## Variants

Options may carry an icon. The control divides its width evenly, so use it for two to four short options.

## States

The selected segment is raised on the surface with a border and bold text. The focused segment shows the shared focus ring.

## Behavior

It is a native radio group inside a fieldset, so arrow keys move and select, Tab enters and leaves the group, and the platform announces position. The legend is the accessible name and is visually hidden: show a visible heading beside the control. Segments are at least 44px high and the whole segment is the target.

## Examples and limitations

Use a select for long lists and switches for yes/no settings. This example keeps its state locally.
</docs>
