# Dialog

## Usage

Short, focused tasks above the current view.

## Variants

Title, description, content and optional actions.

## States

Closed, open and long scrollable content (enable in Controls). Focus stays inside the dialog while it is open.

## Behavior

Tab and Shift+Tab stay inside the dialog. Escape closes it. Focus then returns to the trigger. At Phone · short, focus the guidance region and use arrow keys to scroll; check that Close remains reachable. Events records open changes and edits.

## Examples and limitations

Use for editing a name. Choose Sheet for longer mobile tasks. Closing alone does not imply saving or discarding changes.

## Copyable example

Import `@form/ui/tokens.css`, `@form/ui/workout-theme.css` and `@form/ui/styles.css` once in the application entry point.

```vue
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
  <Dialog>
    <DialogTrigger as-child><Button>Edit workout name</Button></DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Workout name</DialogTitle>
        <DialogDescription
          >Change the name for your next session.</DialogDescription
        >
      </DialogHeader>
      <Field
        ><FieldLabel for="workout-name">Name</FieldLabel
        ><Input id="workout-name" v-model="name"
      /></Field>
      <DialogFooter
        ><DialogClose as-child
          ><Button type="button">Close</Button></DialogClose
        ></DialogFooter
      >
    </DialogContent>
  </Dialog>
</template>
```

Closing this example does not save or revert the local value. Connect those actions explicitly in the consuming application.
