<script setup lang="ts">
import { BaseButton, BaseButtonIcon } from "@form/ui";
import { Plus } from "@lucide/vue";
</script>

<template>
  <Story title="00 Start here/Component naming">
    <Variant title="Rules and examples">
      <div class="stack">
        <h1>Component names</h1>
        <p>Names show a component’s role, family and ownership.</p>
        <section class="pattern-card stack" aria-labelledby="naming-rules">
          <h2 id="naming-rules">Our Vue naming rules</h2>
          <ul>
            <li>
              One component per PascalCase file; use the same name in imports
              and templates.
            </li>
            <li>Shared styled components begin with Base.</li>
            <li>Put the general family first and the modifier last.</li>
            <li>
              Tightly coupled children begin with their parent’s full name.
            </li>
            <li>Use full words; preserve third-party component names.</li>
            <li>
              Component story filenames and catalog titles match the public
              export.
            </li>
          </ul>
        </section>
        <section class="pattern-card stack" aria-labelledby="naming-migration">
          <h2 id="naming-migration">Current component names</h2>
          <ul>
            <li><code>Button → BaseButton</code></li>
            <li><code>IconButton → BaseButtonIcon</code></li>
            <li><code>NumericInput → BaseInputNumber</code></li>
            <li><code>NativeSelect → BaseSelectNative</code></li>
            <li><code>DialogContent → BaseDialogContent</code></li>
          </ul>
          <div class="row">
            <BaseButton type="button">BaseButton</BaseButton>
            <BaseButtonIcon label="Add exercise"
              ><Plus aria-hidden="true"
            /></BaseButtonIcon>
          </div>
        </section>
        <p class="note">
          The Docs panel includes parent–child examples and rename guidance.
        </p>
      </div>
    </Variant>
  </Story>
</template>

<docs lang="md">
# Component naming

## Usage

Apply the [Vue Style Guide Priority B](https://vuejs.org/style-guide/rules-strongly-recommended.html) naming rules when adding or renaming
components. The authoritative repository contract is `docs/workflows.md`, under
“Component names”. Use one component per PascalCase file and the same name in
imports, exports and templates.

## Variants

Shared styled components use `Base`: `BaseButton`, `BaseInput`, `BaseField`,
`BaseDialogContent`. Order names from general family to modifier:
`BaseButtonIcon`, `BaseInputNumber`, `BaseSelectNative`.

A tightly coupled child includes its parent's full name:
`StrongLiftsPrototype` → `StrongLiftsPrototypeExerciseList` →
`StrongLiftsPrototypeExerciseListCircles` → `StrongLiftsPrototypeExerciseListCirclesSet`.
Independently reusable components retain their own names.

## States

Naming changes do not change component states, props, events, styles or behavior.
Existing disabled, invalid, focus and interactive examples remain in each component story.

## Behavior

Rename the file, export, imports, template tags, story filename and title, copyable
examples and current documentation together. Component stories use the public name,
for example `BaseButton.story.vue` and `02 Components/BaseButton`.

## Examples and limitations

Use full words. `BaseTextarea` follows the native HTML element spelling. Reka,
Lucide and Histoire components keep their upstream names. Pattern and foundation
stories describe their subject rather than using the Base prefix.

PascalCase template references, matching declared names and multi-word component
names are linted. Prefixes, parent relationships, word order and abbreviation choices
require review. `App` and `.story.vue` filenames are exempt from the multi-word rule.
The private UI package has no legacy export aliases.
</docs>
