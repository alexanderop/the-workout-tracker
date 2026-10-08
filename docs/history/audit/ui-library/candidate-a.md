# Candidate A: explicit composition with native field associations

## Problem

Expand the source-exported Vue library with reference-faithful Button, Input/Field and Dialog without importing shadcn. Preserve the existing Sheet API, tokens and six consumers. New components must render correctly without the workout application's CSS and must survive portal rendering outside the gallery root.

## Usage (caller's view)

Consumers import named components from `@form/ui` and load its exported theme stylesheet once at document level.

```vue
<Button variant="outline" size="sm" @click="addSet">Add set</Button>
<Button type="submit" :disabled="saving">Save workout</Button>
```

```vue
<Field :data-invalid="Boolean(error)">
  <FieldLabel for="workout-name">Workout name</FieldLabel>
  <Input id="workout-name" v-model="name" name="name" required
    :aria-invalid="Boolean(error)" aria-describedby="name-description name-error" />
  <FieldDescription id="name-description">Use a recognizable name.</FieldDescription>
  <FieldError v-if="error" id="name-error">{{ error }}</FieldError>
</Field>
```

```vue
<Dialog v-model:open="open">
  <DialogTrigger as-child><Button>Edit workout</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit workout</DialogTitle>
      <DialogDescription>Changes apply to this workout.</DialogDescription>
    </DialogHeader>
    <!-- Consumer owns the form and submits real browser form values. -->
    <DialogFooter>
      <DialogClose as-child><Button variant="outline">Cancel</Button></DialogClose>
      <Button type="submit" form="workout-form">Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Shape

```ts
// Sketch; component bodies intentionally omitted.
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'
interface ButtonProps { variant?: ButtonVariant; size?: ButtonSize; asChild?: boolean }
interface FieldProps { orientation?: 'vertical' | 'horizontal' | 'responsive' }
// Input: native input attributes + defineModel<string | number>(); disabled/required/name pass through.
// Dialog: Reka DialogRoot props/emits; controlled/uncontrolled state belongs to Reka or consumer.
// DialogContent: Reka content props/emits with portal + overlay + close-button presentation.
```

Module map: `src/button/{Button.vue,index.ts}`, `src/input/{Input.vue,index.ts}`, `src/field/{Field.vue,FieldLabel.vue,FieldDescription.vue,FieldError.vue,index.ts}`, `src/dialog/{DialogContent.vue,DialogHeader.vue,DialogFooter.vue,index.ts}`, `src/styles/theme.css`, and root exports. Export Reka roots/triggers/close directly where no presentation is needed; wrap title/description only to supply reference styles. Include FieldGroup/FieldSet/FieldLegend when the pinned reference contract requires them, rather than silently claiming whole-family parity.

Semantic tokens use a new coherent namespaced surface and document-level defaults; retain existing Sheet tokens untouched. Component scoped CSS references tokens and styles state attributes. No global reset: each control owns necessary box sizing, font inheritance and border reset. Portal content receives component scope attributes and document-level variables. Theme overrides must therefore target the document or an explicitly chosen portal container.

Native input owns DOM value; consumer owns model and validation. Field supplies layout and semantic elements, not a hidden validation store or cloned child props. Consumer explicitly connects label, description and error IDs, matching upstream composition. Reka owns dialog focus trap, Escape handling, outside interaction, ARIA linking and return focus. Pass native and Reka props/events faithfully; preserve attrs and slots, with no application-specific event layer. Closed dialogs have no duplicated synchronized state.

Interface depth: a small composed dialog surface hides portal/focus machinery; a field surface exposes ordinary HTML associations because hiding them would invent a competing form framework. Literal variants encode supported presentation states (`encode-lessons-in-structure`); native browser/DOM semantics remain the boundary (`boundary-discipline`). There is no asynchronous service or persistence need.

## Verification

- Behavior: native Button default/submit behavior, disabled action suppression; Input typing/model/form data/disabled semantics; Dialog controlled and trigger opening, close, Escape, outside interaction and focus restoration.
- Accessibility: role/name queries, label association, description/error relationships, required/invalid semantics, keyboard traversal and Tab focus containment, axe scans of gallery and open portal.
- Regression: deterministic element screenshots of all Button variants/sizes, valid/invalid/disabled fields and an open Dialog at narrow/wide sizes. Fixed fonts, viewport, animation policy and CI browser. Keep Linux screenshot generation separate from macOS baseline assumptions.
- Gallery: independent Vite consumer importing only public exports + theme CSS, documenting reference commit/theme and showing every delivered state. Add a build check because existing root build covers workout only.
- Existing Sheet tests plus full repository checks establish compatibility; pinned upstream contract records intentional gaps, supported family members and remaining catalog waves.

## Synthesis decision

Pending parent comparison. Candidate A advocates faithful compound APIs with native explicit associations.

## Tradeoffs accepted

- We accept repeated consumer IDs in exchange for transparent native semantics and reference-compatible composition.
- We accept several meaningful component exports in exchange for flexible slots without boolean-heavy monolithic components.
- We accept document-level theme installation in exchange for reliable styling across portals and application roots.

## Alternatives considered

A smart `TextField` accepting label/description/error and injecting generated IDs hides association complexity, but loses the upstream compound API and constrains arbitrary control composition. A monolithic Dialog accepting title/actions props hides more markup, but pushes slot escape hatches and action conventions into its interface. Neither offers sufficient depth to justify reference drift here.

## Open questions and risks

Can the pinned reference contract constrain native Input coercion and Button sizes before tests freeze accidental differences? Can CI generate and verify canonical Linux image baselines in the same browser version? Both are implementation evidence checks, not a required user checkpoint.

## Next implementation step

Pin upstream variants and DOM contracts, then implement Button plus an isolated gallery consumer and its first browser behavior test before expanding the same pattern.
