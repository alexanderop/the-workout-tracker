<script setup lang="ts">
import { ref } from "vue";
import { BaseButton, BaseSheet, BaseInstallInstructions } from "@form/ui";
const open = ref(false);
const platform = ref<"ios" | "android" | "browser">("ios");
const canInstall = ref(false);
const busy = ref(false);
const installed = ref(false);
const message = ref("");
</script>
<template>
  <Story title="02 Components/BaseInstallInstructions">
    <Variant title="Installation sheet">
      <BaseButton @click="open = true">Install app</BaseButton>
      <BaseSheet
        :open="open"
        title="Install The Workout Tracker"
        @close="open = false"
      >
        <BaseInstallInstructions
          :platform="platform"
          :can-install="canInstall"
          :busy="busy"
          :installed="installed"
          :message="message"
          @install="
            message = 'Example only: the app opens the browser installer here.'
          "
        />
      </BaseSheet>
      <template #controls>
        <HstSelect
          v-model="platform"
          title="Platform"
          :options="['ios', 'android', 'browser']"
        />
        <HstCheckbox
          v-model="canInstall"
          title="Native installation available"
        />
        <HstCheckbox v-model="busy" title="Opening installer" />
        <HstCheckbox v-model="installed" title="Installed" />
        <HstText v-model="message" title="Result or error" />
      </template>
    </Variant>
  </Story>
</template>
<docs lang="md">
# BaseInstallInstructions

## Usage

User-invoked instructions inside BaseSheet. Consumers detect the platform and own installation.

## Variants

iPhone/iPad, Android, generic browser, and native install button.

## States

Available, opening installer, installed, and result/error message.

## Behavior

The install event requests an action; the component makes no browser calls. Escape and Close return to the opener.

## Examples and limitations

The story never installs anything. Browser menus vary. Installation does not back up local data.
</docs>
