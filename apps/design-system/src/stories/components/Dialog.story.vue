<script setup lang="ts">
import source from "../../examples/Dialog.vue.txt?raw";
import { ref } from "vue";
import { logEvent } from "histoire/client";
import {
  Button,
  Input,
  Field,
  FieldLabel,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@form/ui";
const name = ref("Morning strength");
const longContent = ref(false);
</script>
<template>
  <Story title="02 Components/Dialog">
    <Variant title="Usage" :source="source"
      ><div class="stack">
        <Dialog
          @update:open="logEvent('Dialog: open changed', { value: $event })"
          ><DialogTrigger as-child
            ><Button>Edit workout name</Button></DialogTrigger
          ><DialogContent
            ><DialogHeader
              ><DialogTitle>Workout name</DialogTitle
              ><DialogDescription
                >Change the name for your next session.</DialogDescription
              ></DialogHeader
            ><Field
              ><FieldLabel for="dialog-name">Name</FieldLabel
              ><Input
                id="dialog-name"
                v-model="name"
                @update:model-value="
                  logEvent('Dialog name: changed', { value: $event })
                "
            /></Field>
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
            <DialogFooter
              ><DialogClose as-child
                ><Button variant="outline">Close</Button></DialogClose
              ></DialogFooter
            ></DialogContent
          ></Dialog
        >
      </div>
      <template #controls
        ><HstCheckbox
          v-model="longContent"
          title="Long scrollable content" /></template
    ></Variant>
  </Story>
</template>
