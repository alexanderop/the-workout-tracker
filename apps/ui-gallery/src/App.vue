<script setup lang="ts">
import { ref, watchEffect } from "vue";
import {
  Button,
  Input,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldSet,
  FieldLegend,
  FieldGroup,
  FieldContent,
  FieldTitle,
  FieldSeparator,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@form/ui";
const dark = ref(false);
watchEffect(() =>
  document.documentElement.classList.toggle("dark", dark.value),
);
const variants = [
  "default",
  "destructive",
  "outline",
  "secondary",
  "ghost",
  "link",
] as const;
const sizes = [
  "default",
  "xs",
  "sm",
  "lg",
  "icon",
  "icon-xs",
  "icon-sm",
  "icon-lg",
] as const;
const name = ref("Morning strength");
const invalid = ref(false);
const saved = ref("");
function submit(event: Event) {
  if (event.currentTarget instanceof HTMLFormElement)
    saved.value = `Saved ${new FormData(event.currentTarget).get("name")}`;
}
</script>
<template>
  <main>
    <header>
      <div>
        <p class="eyebrow">FORM / UI</p>
        <h1>Component gallery</h1>
        <p>
          Independent Vue components. Native forms. Accessible interactions.
        </p>
      </div>
      <Button variant="outline" :aria-pressed="dark" @click="dark = !dark">{{
        dark ? "Light theme" : "Dark theme"
      }}</Button>
    </header>
    <nav aria-label="Components">
      <a href="#buttons">Buttons</a><a href="#fields">Fields</a
      ><a href="#dialogs">Dialogs</a>
    </nav>
    <section id="buttons" aria-labelledby="buttons-heading">
      <h2 id="buttons-heading">Buttons</h2>
      <p>
        Six variants, eight sizes, native disabled states and link composition.
      </p>
      <div class="row">
        <Button v-for="variant in variants" :key="variant" :variant="variant">{{
          variant
        }}</Button>
      </div>
      <div class="row">
        <Button
          v-for="variant in variants"
          :key="variant"
          :variant="variant"
          disabled
          >{{ variant }}</Button
        >
      </div>
      <div class="row">
        <Button
          v-for="size in sizes"
          :key="size"
          :size="size"
          :aria-label="size.startsWith('icon') ? size : undefined"
          >{{ size.startsWith("icon") ? "+" : size }}</Button
        >
      </div>
      <Button as-child variant="link"
        ><a href="#fields">Explore form fields</a></Button
      >
    </section>
    <section id="fields" aria-labelledby="fields-heading">
      <h2 id="fields-heading">Fields</h2>
      <form @submit.prevent="submit">
        <FieldSet
          ><FieldLegend>Workout preferences</FieldLegend
          ><FieldDescription
            >Explicit labels and descriptions remain yours to
            compose.</FieldDescription
          ><FieldGroup>
            <Field :data-invalid="invalid || undefined"
              ><FieldLabel for="name">Workout name</FieldLabel
              ><Input
                id="name"
                v-model="name"
                name="name"
                required
                :aria-invalid="invalid"
                :aria-describedby="
                  invalid ? 'name-help name-error' : 'name-help'
                "
              /><FieldDescription id="name-help"
                >A short name that is easy to recognize.</FieldDescription
              ><FieldError v-if="invalid" id="name-error"
                >This name is already in use.</FieldError
              ></Field
            >
            <Field
              ><FieldLabel for="sets">Sets</FieldLabel
              ><Input
                id="sets"
                name="sets"
                type="number"
                :default-value="3"
                min="1"
                required
              /><FieldDescription
                >Uncontrolled numeric input with native reset.</FieldDescription
              ></Field
            >
            <Field
              ><FieldLabel for="disabled">Unavailable</FieldLabel
              ><Input
                id="disabled"
                disabled
                default-value="Managed by your coach"
            /></Field>
            <Field
              ><FieldLabel for="readonly">Read only</FieldLabel
              ><Input id="readonly" readonly default-value="Personal plan"
            /></Field>
            <FieldSeparator>Additional details</FieldSeparator
            ><Field orientation="horizontal"
              ><FieldContent
                ><FieldTitle>Daily reminder</FieldTitle
                ><FieldDescription
                  >You control labels, state and validation.</FieldDescription
                ></FieldContent
              ><Button
                type="button"
                variant="outline"
                :aria-pressed="invalid"
                @click="invalid = !invalid"
                >Toggle error</Button
              ></Field
            >
          </FieldGroup></FieldSet
        >
        <div class="row actions">
          <Button type="submit">Save preferences</Button
          ><Button type="reset" variant="outline">Reset form</Button>
        </div>
        <p role="status">{{ saved }}</p>
      </form>
    </section>
    <section id="dialogs" aria-labelledby="dialogs-heading">
      <h2 id="dialogs-heading">Dialogs</h2>
      <p>Try Tab, Shift+Tab and Escape. Focus returns to the opener.</p>
      <Dialog
        ><DialogTrigger as-child
          ><Button variant="outline">Edit workout</Button></DialogTrigger
        ><DialogContent
          ><DialogHeader
            ><DialogTitle>Edit workout</DialogTitle
            ><DialogDescription
              >Update the name of your next session.</DialogDescription
            ></DialogHeader
          ><Field
            ><FieldLabel for="dialog-name">Workout name</FieldLabel
            ><Input id="dialog-name" v-model="name" /></Field
          ><DialogFooter
            ><DialogClose as-child
              ><Button variant="outline">Cancel</Button></DialogClose
            ><DialogClose as-child
              ><Button>Save changes</Button></DialogClose
            ></DialogFooter
          ></DialogContent
        ></Dialog
      >
    </section>
    <footer>
      Built with Vue and Reka UI. Styles are supplied by @form/ui.
    </footer>
  </main>
</template>
