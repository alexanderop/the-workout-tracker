<script setup lang="ts">
import { ref } from "vue";
import {
  Button,
  Input,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@form/ui";
import "@form/ui/tokens.css";
import "@form/ui/styles.css";
defineProps<{ customPortal?: boolean; preventEscape?: boolean }>();
const open = ref(false);
</script>
<template>
  <main>
    <div id="dialog-target" />
    <Dialog v-model:open="open">
      <DialogTrigger as-child><Button>Edit workout</Button></DialogTrigger>
      <DialogContent
        :portal-to="customPortal ? '#dialog-target' : undefined"
        @escape-key-down="preventEscape && $event.preventDefault()"
      >
        <DialogHeader
          ><DialogTitle>Edit workout</DialogTitle
          ><DialogDescription
            >Change your next session.</DialogDescription
          ></DialogHeader
        >
        <Input aria-label="Workout title" default-value="Morning" />
        <DialogFooter
          ><DialogClose as-child
            ><Button>Done</Button></DialogClose
          ></DialogFooter
        >
      </DialogContent>
    </Dialog>
    <output aria-label="Dialog state">{{ open ? "open" : "closed" }}</output>
  </main>
</template>
