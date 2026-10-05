<script setup lang="ts">
import { ref } from "vue";
import {
  Button,
  Sheet,
  Field,
  FieldLabel,
  FieldDescription,
  FieldSet,
  FieldLegend,
  FieldGroup,
  Switch,
  NativeSelect,
} from "@form/ui";
const deletionOpen = ref(false);
const deleted = ref(false);
const autoRest = ref(true);
const rest = ref<string | number>(90);
function confirmDeletion() {
  deleted.value = true;
  deletionOpen.value = false;
  autoRest.value = true;
  rest.value = 90;
}
</script>
<template>
  <Story title="03 Patterns/Settings">
    <Variant title="Related settings"
      ><div class="stack">
        <h1>Your workout space</h1>
        <FieldSet
          ><FieldLegend>Workout</FieldLegend
          ><FieldGroup
            ><Field orientation="horizontal"
              ><FieldLabel for="settings-auto">Automatic timer</FieldLabel
              ><Switch id="settings-auto" v-model="autoRest" /></Field
            ><FieldDescription
              >Starts the rest timer after you log a set.</FieldDescription
            ><Field
              ><FieldLabel for="settings-rest">Rest duration</FieldLabel
              ><NativeSelect id="settings-rest" v-model="rest"
                ><option
                  v-for="seconds in [30, 60, 90, 120, 180]"
                  :key="seconds"
                  :value="seconds"
                >
                  {{ seconds }} seconds
                </option></NativeSelect
              ></Field
            ></FieldGroup
          ></FieldSet
        >
        <section class="stack">
          <h2>Delete your data</h2>
          <p>
            Remove your workouts, templates, custom exercises and preferences
            from this browser. Export a backup first if you want to keep a copy.
          </p>
          <Button variant="secondary" @click="deletionOpen = true">
            Delete all data
          </Button>
          <p v-if="deleted" role="status">
            Example data deleted. No workout storage was changed.
          </p>
        </section>
        <Sheet
          :open="deletionOpen"
          title="Delete all your data?"
          description="This permanently deletes your workout history, active workout, input drafts, templates and custom exercises from this browser, and resets your preferences. This cannot be undone. Downloaded backups stay on your device."
          @close="deletionOpen = false"
        >
          <div class="row">
            <Button variant="secondary" @click="deletionOpen = false">
              Cancel
            </Button>
            <Button @click="confirmDeletion">Delete all data</Button>
          </div>
        </Sheet>
        <p class="note">These settings apply only within this example.</p>
      </div></Variant
    >
  </Story>
</template>
<docs lang="md">
# Settings

## Usage

Group occasional decisions by purpose.

## Variants

An immediate toggle, fixed selection values and a destructive action with confirmation.

## States

On, off, selected rest duration, deletion confirmation and deletion feedback.

## Behavior

Labels describe the function; help text explains the effect.
Every delete, removal or discard action opens an additional modal before changing data.
Name what will be lost and whether it can be undone. Keep Cancel available, trap
keyboard focus, and return focus to the opener on dismissal. Escape and backdrop
dismissal cancel. Use existing neutral surfaces and the shared accent rather than
introducing a warning color. Ordinary reversible log toggles are corrections,
not deletions.

## Examples and limitations

Weight units, import and export require additional product logic; this story is a design composition.
</docs>
