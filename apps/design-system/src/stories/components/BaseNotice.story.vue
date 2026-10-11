<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import { BaseButton, BaseNotice, type NoticeTone } from "@form/ui";

const tone = ref<NoticeTone>("info");
const message = ref("A new version is ready.");
const dismissible = ref(false);
const withAction = ref(true);
const tones: NoticeTone[] = ["info", "success", "danger"];
const visible = ref(true);
</script>

<template>
  <Story title="02 Components/BaseNotice">
    <Variant title="Usage">
      <div class="stack">
        <BaseNotice
          v-if="visible"
          :tone="tone"
          :dismiss-label="dismissible ? 'Dismiss notice' : undefined"
          @dismiss="
            visible = false;
            logEvent('BaseNotice: dismiss', null);
          "
        >
          {{ message }}
          <template v-if="withAction" #action
            ><BaseButton
              variant="link"
              size="sm"
              @click="logEvent('BaseNotice: action', null)"
              >Reload</BaseButton
            ></template
          >
        </BaseNotice>
        <BaseButton v-else variant="outline" @click="visible = true"
          >Show notice again</BaseButton
        >
      </div>
      <template #controls>
        <HstSelect v-model="tone" title="Tone" :options="tones" />
        <HstText v-model="message" title="Message (try a long one)" />
        <HstCheckbox v-model="dismissible" title="Dismissible" />
        <HstCheckbox v-model="withAction" title="Action" />
      </template>
    </Variant>
    <Variant title="Tones">
      <div class="stack">
        <BaseNotice tone="info">Your backup was imported.</BaseNotice>
        <BaseNotice tone="success">Workout saved.</BaseNotice>
        <BaseNotice tone="danger">Could not save the workout.</BaseNotice>
      </div>
    </Variant>
  </Story>
</template>

<docs lang="md">
# BaseNotice

## Usage

A message about one region of a page: an update, a result or a problem that needs attention. Show one notice per event and scope a route-level notice to its page or let it dismiss itself. Errors of a single field use `BaseFieldError`; transient confirmations of a control use `BaseFeedback`.

## Variants

`info` uses the accent-soft surface, `success` the plain surface, `danger` a tint of the danger color. The palette has no warning color, so tone is also carried by the icon (info, check, alert). The text always uses the text color.

## States

An optional action slot holds a `BaseButton variant="link" size="sm"`. Passing `dismiss-label` shows a 44px dismiss button with that accessible name; the notice emits `dismiss` and the consumer removes it.

## Behavior

`info` and `success` use role `status` (polite). `danger` uses role `alert` and is announced at once. A role only announces content added after the region exists, so render a notice when its message arrives rather than hiding and showing it.

## Examples and limitations

Long messages wrap and push the action below the text on narrow screens.
</docs>
