<script setup lang="ts">
import { ref } from "vue";
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
</script>
<template>
  <Story title="02 Components/Dialog">
    <Variant title="Usage"
      ><div class="preview stack">
        <Dialog
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
              ><Input id="dialog-name" v-model="name" /></Field
            ><DialogFooter
              ><DialogClose as-child
                ><Button variant="outline">Close</Button></DialogClose
              ></DialogFooter
            ></DialogContent
          ></Dialog
        >
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# Dialog

## Usage

Short, focused tasks above the current view.

## Variants

Title, description, content and optional actions.

## States

Closed and open; focus stays inside the dialog while it is open.

## Behavior

Tab and Shift+Tab stay inside the dialog. Escape closes it. Focus then returns to the trigger.

## Examples and limitations

Use for editing a name. Choose Sheet for longer mobile tasks. Closing alone does not imply saving or discarding changes.
</docs>
