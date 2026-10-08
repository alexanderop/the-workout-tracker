# Candidate B: coordinated Field and document-scoped theme

## Problem
Ship the first independent library increment with native form semantics and Reka-managed dialogs while preserving the existing Sheet API and five legacy tokens. The difficult boundary is accessibility coordination: explicit label, description and error IDs are easy to omit, while arbitrary compound children make automatic association depend on lifecycle order. This candidate chooses a deeper single-control Field wrapper; it is intentionally less faithful to shadcn's compound Field API.

## Usage (caller's view)
```vue
<script setup lang="ts">
import { Button, Field, Input } from '@form/ui'
import '@form/ui/theme.css'
const title = defineModel<string>({ default: '' })
</script>
<form @submit.prevent="save">
  <Field label="Workout name" description="Visible in your history." :error="nameError">
    <Input v-model="title" name="title" required autocomplete="off" />
  </Field>
  <Button type="submit">Save workout</Button>
</form>
```
```vue
<!-- Standalone input keeps native, explicit associations. -->
<label for="search">Search workouts</label>
<Input id="search" v-model="query" type="search" />
<Button variant="outline" size="icon" aria-label="Clear search" @click="query = ''">
  <X aria-hidden="true" />
</Button>
```
```vue
<Dialog v-model:open="open">
  <DialogTrigger as-child><Button>Edit workout</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader><DialogTitle>Edit workout</DialogTitle>
      <DialogDescription>Update the workout name.</DialogDescription></DialogHeader>
    <Field label="Workout name" :error="nameError"><Input v-model="title" name="title" /></Field>
    <DialogFooter><DialogClose as-child><Button variant="outline">Cancel</Button></DialogClose>
      <Button @click="save">Save</Button></DialogFooter>
  </DialogContent>
</Dialog>
```

## Shape
```ts
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' // Extend from pinned reference, never guess.
interface ButtonProps { variant?: ButtonVariant; size?: ButtonSize; asChild?: boolean }
interface FieldProps { id?: string; label: string; description?: string; error?: string; disabled?: boolean }
interface InputProps { modelValue?: string | number; defaultValue?: string | number }
// Native attributes remain accepted and forwarded once to the real input/button.
// Input emits update:modelValue from native input events; no validation or persistence.
interface FieldContext {
  readonly controlId: ComputedRef<string>
  readonly describedBy: ComputedRef<string | undefined>
  readonly invalid: ComputedRef<boolean>
  readonly disabled: ComputedRef<boolean>
}
function provideField(props: Readonly<FieldProps>): FieldContext { throw new Error('not implemented') }
function useOptionalField(): FieldContext | undefined { throw new Error('not implemented') }
// Dialog root/trigger/content/title/description/close adapt Reka with library styling.
```
- `src/button/Button.vue`: native button or Reka Primitive `asChild`; defaults to type=button; variants own appearance, native semantics own activation.
- `src/input/Input.vue`: native input and optional private Field injection; explicit native attributes supported standalone. Inside Field, root `id` is authoritative and conflicting Input `id` is rejected in development rather than silently breaking label linkage.
- `src/field/Field.vue` + `context.ts`: root creates a stable Vue `useId`; label, description and error render from root props, so association is known before children render, including SSR. No child registration or document lookup.
- Field derives `aria-describedby` from present description/error and merges caller-provided description IDs. Error presence derives `aria-invalid`; disabled derives from the wrapper with native input enforcement. Exactly one Input is supported per Field; control collections use separate Fields.
- `src/dialog/*.vue`: Reka owns open state, modal focus, Escape, dismiss and return focus; thin styled public parts own theme policy. Header/footer are layout parts that deliberately match the reference composition API.
- `src/theme.css`: opt-in standalone reset limited to library classes, semantic `--ui-*` tokens on `:root`, and a documented document-level dark theme selector. Existing `tokens.css` remains compatible. Portal content inherits document theme; locally nested themes require an explicit DialogContent portal target.
- `src/index.ts`: public components only; private context and generated IDs stay internal, per boundary-discipline.
- `apps/ui-gallery`: real consumer importing public exports and theme.css, with all variants, error/disabled states, dark mode and dialog examples. Explicit build script catches package/style-export errors.
- `test/fixtures/*` plus focused test files: real consumer forms/dialogs, no component stubs; screenshot fixtures carry fixed typography and dimensions.
- State ownership: consumers own values, errors and dialog model; Field owns only derived accessibility IDs; Reka owns modal mechanics. Each Field instance is independent, per separate-before-serializing-shared-state.
- Interface depth: Field hides four correlated accessibility attributes and their conditional updates behind label/description/error. This trades reference composition fidelity for stronger defaults. Input remains useful alone; no form framework or validators enter the library.

## Verification contract
- Behavior: native submission includes Input name/value; typing emits current value; disabled Input/Button cannot mutate/submit; default Button does not submit; Dialog save/cancel and controlled open updates work.
- Accessibility: assert label lookup, conditional description/error attachment and removal, distinct IDs across two Fields, focus entry/trap/return, Escape, accessible title/description, and axe scans of document body including open portal content.
- Visual regression: deterministic gallery screenshots of variants, focus/error/disabled, long text, narrow dialog and light/dark document theme; screenshot baseline generation and comparison use one pinned Linux Playwright environment, separate from portable behavior tests.
- Reference: record upstream commit, source paths, theme/style mapping and known deviations; component catalog tracks remaining waves. A local snapshot proves regression stability, not upstream visual parity.

## Synthesis decision
Pending orchestrator comparison. Prefer this shape only if safer default Field associations outweigh exact Field API parity.

## Tradeoffs accepted
- We accept a high-level Field wrapper in exchange for deterministic SSR associations and fewer consumer mistakes.
- We accept document-level themes by default in exchange for consistent portal appearance; explicit portal targets support embedded themes.
- We accept a single control per Field in exchange for simple label/error ownership; grouped controls are a later separate primitive.

## Alternatives considered
- Explicit compound FieldLabel/FieldDescription/FieldError with caller-owned IDs: best upstream API fidelity and arbitrary layouts; exposes the entire association invariant to each caller. Strong fallback when exact API parity wins.
- Child registration via injection: hides association wiring and preserves compound composition, but mount/unmount ordering complicates SSR, conditional children and duplicate descriptions; rejected for this increment.

## Open questions and risks
- Does “exactly like shadcn” include Field's full compound API? If yes, choose the explicit-association candidate instead of disguising this divergence.
- Does the pinned reference contain additional Button sizes? Resolve from its actual source before implementing the type union.

## Next implementation step
Build Field/Input with a two-field native form fixture first, then Button and Dialog against the same independent theme and gallery consumer.
