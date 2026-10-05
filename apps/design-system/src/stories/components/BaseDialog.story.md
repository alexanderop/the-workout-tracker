# BaseDialog

## Usage

Short, focused tasks above the current view.

## Variants

Title, description, content and optional actions.

## States

Closed, open and long scrollable content (enable in Controls). Focus stays inside the dialog while it is open.

## Behavior

Tab and Shift+Tab stay inside the dialog. Escape closes it. Focus then returns to the trigger. At Phone · short, focus the guidance region and use arrow keys to scroll; check that Close remains reachable. Events records open changes and edits.

## Examples and limitations

Use for editing a name. Choose BaseSheet for longer mobile tasks. Closing alone does not imply saving or discarding changes.

## Copyable example

Import `@form/ui/tokens.css`, `@form/ui/workout-theme.css` and `@form/ui/styles.css` once in the application entry point.

```vue
<script setup lang="ts">
import { ref } from "vue";
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
</script>
<template>
  <BaseDialog>
    <BaseDialogTrigger as-child><BaseButton>Edit workout name</BaseButton></BaseDialogTrigger>
    <BaseDialogContent>
      <BaseDialogHeader>
        <BaseDialogTitle>Workout name</BaseDialogTitle>
        <BaseDialogDescription
          >Change the name for your next session.</BaseDialogDescription
        >
      </BaseDialogHeader>
      <BaseField
        ><BaseFieldLabel for="workout-name">Name</BaseFieldLabel
        ><BaseInput id="workout-name" v-model="name"
      /></BaseField>
      <BaseDialogFooter
        ><BaseDialogClose as-child
          ><BaseButton type="button">Close</BaseButton></BaseDialogClose
        ></BaseDialogFooter
      >
    </BaseDialogContent>
  </BaseDialog>
</template>
```

Closing this example does not save or revert the local value. Connect those actions explicitly in the consuming application.
