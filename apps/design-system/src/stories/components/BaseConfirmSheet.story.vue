<script setup lang="ts">
import { ref } from "vue";
import { logEvent } from "histoire/client";
import {
  BaseButton,
  BaseConfirmSheet,
  BaseStat,
  BaseStatGroup,
  type ConfirmIntent,
} from "@form/ui";

const open = ref(false);
const intent = ref<ConfirmIntent>("destructive");
const busy = ref(false);
const failing = ref(false);
const withStats = ref(false);
const error = ref("");
let timer: ReturnType<typeof setTimeout> | undefined;

function confirm() {
  logEvent("BaseConfirmSheet: confirm", null);
  error.value = "";
  busy.value = true;
  clearTimeout(timer);
  // The consumer owns the work. Success closes the sheet; failure reports.
  timer = setTimeout(() => {
    busy.value = false;
    if (!failing.value) {
      open.value = false;
      return;
    }
    error.value = "Could not delete your data. Try again.";
  }, 900);
}
function cancel() {
  logEvent("BaseConfirmSheet: cancel", null);
  error.value = "";
}
</script>

<template>
  <Story title="02 Components/BaseConfirmSheet">
    <Variant title="Usage">
      <div class="stack">
        <BaseButton variant="secondary" @click="open = true">{{
          intent === "destructive" ? "Delete all data" : "Finish workout"
        }}</BaseButton>
        <BaseConfirmSheet
          v-model:open="open"
          :intent="intent"
          :busy="busy"
          :error="error"
          :title="
            intent === 'destructive' ? 'Delete all data?' : 'Finish workout?'
          "
          :description="
            intent === 'destructive'
              ? 'History, the active workout, drafts and templates are removed from this device. Backups you downloaded stay.'
              : 'Your sets are saved to your history.'
          "
          :confirm-label="
            intent === 'destructive' ? 'Delete everything' : 'Save workout'
          "
          cancel-label="Keep training"
          @confirm="confirm"
          @cancel="cancel"
        >
          <BaseStatGroup v-if="withStats" aria-label="Workout totals">
            <BaseStat :value="12" label="sets logged" />
            <BaseStat value="3,450" unit="kg" label="volume" />
            <BaseStat value="48" unit="min" label="duration" />
          </BaseStatGroup>
        </BaseConfirmSheet>
      </div>
      <template #controls>
        <HstSelect
          v-model="intent"
          title="Intent"
          :options="['destructive', 'neutral']"
        />
        <HstCheckbox v-model="failing" title="Confirming fails" />
        <HstCheckbox v-model="withStats" title="Rich body (stats)" />
      </template>
    </Variant>
  </Story>
</template>

<docs lang="md">
# BaseConfirmSheet

## Usage

Every confirmation sheet: deleting data, discarding input, removing an exercise or set, finishing a workout. State what is affected in `title` and `description`, label the confirming action explicitly and name the safe choice in `cancel-label`. `intent` is required. `destructive` removes or discards data and gives Confirm the destructive button; `neutral` keeps the primary button.

## Variants

Destructive and neutral intents. The default slot holds richer content above the buttons, such as the stats of the Finish workout sheet.

## States

`busy` disables both buttons and blocks every way of dismissing the sheet while work runs. `error` shows an alert and keeps the sheet open. `confirm-disabled` disables Confirm alone, for a conflict that needs review.

## Behavior

Focus starts on Cancel, the safe control, so Enter never confirms by accident, and returns to the opener on close. Escape, the close button, the backdrop and a swipe all cancel. Confirm never closes the sheet: the consumer closes it with `v-model:open` when the work succeeds and passes `error` when it fails. Cancel is on the left; on phones the buttons stack full width with Confirm at the bottom.

## Examples and limitations

Turn on Confirming fails to see the error alert after the simulated 900ms of work. The story deletes nothing.
</docs>
