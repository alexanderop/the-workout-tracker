<script setup lang="ts">
import { ref } from "vue";
import {
  Button,
  Input,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@form/ui";
import "@form/ui/tokens.css";
import "@form/ui/styles.css";
const name = ref("Morning");
const error = ref(false);
const submitted = ref("");
function submit(event: Event) {
  const form = event.currentTarget;
  if (form instanceof HTMLFormElement)
    submitted.value = JSON.stringify(Object.fromEntries(new FormData(form)));
}
</script>
<template>
  <main>
    <form aria-label="Workout" @submit.prevent="submit">
      <Field :data-invalid="error || undefined">
        <FieldLabel for="workout-name">Workout name</FieldLabel>
        <Input
          id="workout-name"
          v-model="name"
          name="name"
          required
          :aria-invalid="error"
          :aria-describedby="error ? 'name-help name-error' : 'name-help'"
        />
        <FieldDescription id="name-help">Shown in your list.</FieldDescription>
        <FieldError v-if="error" id="name-error"
          >Choose a different name.</FieldError
        >
      </Field>
      <Field>
        <FieldLabel for="repetitions">Repetitions</FieldLabel>
        <Input
          id="repetitions"
          :aria-invalid="error"
          name="repetitions"
          type="number"
          :default-value="8"
          min="1"
          required
        />
      </Field>
      <Field
        ><FieldLabel for="locked">Locked value</FieldLabel
        ><Input id="locked" name="locked" default-value="hidden" disabled
      /></Field>
      <Button type="submit">Save</Button
      ><Button type="reset" variant="outline">Reset</Button>
      <Button type="button" disabled @click="submitted = 'disabled clicked'"
        >Unavailable</Button
      >
    </form>
    <Button type="button" @click="name = 'Evening'">Set name</Button>
    <Button type="button" @click="error = !error">Toggle error</Button>
    <Button as-child variant="link"
      ><a href="#destination">Documentation</a></Button
    >
    <output aria-label="Current name">{{ name }}</output
    ><output aria-label="Submitted values">{{ submitted }}</output>
  </main>
</template>
