<script setup lang="ts">
import source from "../../examples/BaseDialog.vue.txt?raw";
import { ref } from "vue";
import { logEvent } from "histoire/client";
import {
  BaseButton,
  BaseInput,
  BaseField,
  BaseFieldLabel,
  BaseDialog,
  BaseDialogTrigger,
  BaseDialogContent,
  BaseDialogHeader,
  BaseDialogTitle,
  BaseDialogDescription,
  BaseDialogFooter,
  BaseDialogClose,
} from "@form/ui";
const name = ref("Morning strength");
const longContent = ref(false);
</script>
<template>
  <Story title="02 Components/BaseDialog">
    <Variant title="Usage" :source="source"
      ><div class="stack">
        <BaseDialog
          @update:open="logEvent('BaseDialog: open changed', { value: $event })"
          ><BaseDialogTrigger as-child
            ><BaseButton>Edit workout name</BaseButton></BaseDialogTrigger
          ><BaseDialogContent
            ><BaseDialogHeader
              ><BaseDialogTitle>Workout name</BaseDialogTitle
              ><BaseDialogDescription
                >Change the name for your next session.</BaseDialogDescription
              ></BaseDialogHeader
            ><BaseField
              ><BaseFieldLabel for="dialog-name">Name</BaseFieldLabel
              ><BaseInput
                id="dialog-name"
                v-model="name"
                @update:model-value="
                  logEvent('Dialog name: changed', { value: $event })
                "
            /></BaseField>
            <div
              v-if="longContent"
              class="story-scroll-content"
              role="region"
              aria-label="Workout guidance"
              tabindex="0"
            >
              <p v-for="index in 12" :key="index">
                Step {{ index }}: choose a name that helps you recognize this
                session in your history. This scrollable guidance is
                illustrative.
              </p>
            </div>
            <BaseDialogFooter
              ><BaseDialogClose as-child
                ><BaseButton variant="outline"
                  >Close</BaseButton
                ></BaseDialogClose
              ></BaseDialogFooter
            ></BaseDialogContent
          ></BaseDialog
        >
      </div>
      <template #controls
        ><HstCheckbox
          v-model="longContent"
          title="Long scrollable content" /></template
    ></Variant>
  </Story>
</template>
