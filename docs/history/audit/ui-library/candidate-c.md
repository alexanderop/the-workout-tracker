# Candidate C: explicit CSS entry, native controls, explicit field composition

## Problem
Ship a shadcn-vue-compatible first increment without shadcn tooling or runtime. Preserve the existing Sheet contract, its tokens, and all six consumers. Source exports and Reka are already established; the new library must render correctly in an independent consumer without workout CSS or Tailwind. Prioritize composable DOM contracts over a hidden form state abstraction.

## Usage (caller's view)
```ts
// Both consumer entrypoints import these exactly once.
import '@form/ui/tokens.css'
import '@form/ui/styles.css'
```
```vue
<!-- Call site 1: explicit field relationships, native form submission. -->
<form @submit.prevent="save">
  <Field :data-invalid="Boolean(error)">
    <FieldLabel for="workout-name">Workout name</FieldLabel>
    <Input id="workout-name" v-model="name" name="name" required
      :aria-invalid="Boolean(error)" :aria-describedby="error ? 'name-error' : 'name-help'" />
    <FieldDescription id="name-help">Shown in your workout list.</FieldDescription>
    <FieldError v-if="error" id="name-error">{{ error }}</FieldError>
  </Field>
  <Button type="submit">Save</Button>
</form>
```
```vue
<!-- Call site 2: browser-owned, uncontrolled input remains a successful control. -->
<form><Input name="repetitions" type="number" default-value="8" min="1" />
<Button type="reset" variant="outline">Reset</Button></form>
```
```vue
<!-- Call site 3: Reka owns focus; the caller optionally owns open state. -->
<Dialog v-model:open="open">
  <DialogTrigger as-child><Button variant="outline">Edit workout</Button></DialogTrigger>
  <DialogContent><DialogHeader><DialogTitle>Edit workout</DialogTitle>
    <DialogDescription>Change the name for your next session.</DialogDescription>
  </DialogHeader><Input aria-label="Workout name" v-model="name" />
  <DialogFooter><DialogClose as-child><Button>Done</Button></DialogClose></DialogFooter>
  </DialogContent>
</Dialog>
```

## Shape
```ts
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' // Extend only from pinned reference.
type ButtonProps = PrimitiveProps & { variant?: ButtonVariant; size?: ButtonSize }
type InputProps = { modelValue?: string | number; defaultValue?: string | number }
// Input emits update:modelValue; native input attributes/listeners fall through.
// Dialog wrappers derive props/emits directly from installed Reka types.
// Field wrappers have native HTML attributes plus reference orientation where present.
```
- `src/styles.css`: published scoped class rules for the complete increment; no global reset, no utility compilation. Components carry public namespaced classes. Native form controls explicitly inherit font and box sizing inside their own classes.
- `src/tokens.css`: retain all old declarations; add semantic document-level defaults without renaming existing tokens. Document-level tokens reach body portals. Theme overrides live on document root; custom portal targets remain available through Reka forwarding.
- `src/button/Button.vue`: renders Reka Primitive, forwards attrs, supports `as-child`, adds variant classes. Document native `type` explicitly at form call sites; pin unspecified default behavior to upstream rather than silently changing it.
- `src/input/Input.vue`: native input root; controlled value from `modelValue`, otherwise browser-owned value initialized through `defaultValue`. Do not create a mirrored uncontrolled ref that breaks native form reset. Native `name`, `required`, disabled, readonly, invalid, and description attributes pass through unchanged.
- `src/field/*.vue`: structural Field, FieldLabel, FieldDescription, FieldError exports. Label association and error ownership remain explicit, matching composition-first reference API; no form library, schema, registration, or ambient context needed.
- `src/dialog/*.vue`: thin styled Reka components plus structural header/footer; Content owns Portal and Overlay and forwards content props/events. Reka owns focus trap, Escape handling, outside interaction and restoration.
- `src/index.ts`: explicit public exports; existing Sheet untouched. `package.json` adds stylesheet export and preserves CSS as side effects.
- `apps/ui-gallery`: standalone Vite consumer with only the documented CSS imports, fixed examples for variants and states, semantic navigation. Build explicitly in root verification.
- `reference-contract.md`: pin upstream SHA, theme, typography, each API/state/example and intentional deviations; full catalog checklist distinguishes completed increment from future waves.
Per boundary-discipline, the DOM is the input boundary; native semantics and Reka validate interaction constraints. Per single-source-of-truth, input state has exactly one owner. Interface depth comes from hiding styling and overlay mechanics while leaving native form attributes and accessible relationships directly visible; no second form engine or bespoke primitive layer.

## Verification
- Browser behavior: controlled Input emits and tracks parent changes; uncontrolled FormData, reset, required validity, disabled omission; Button disabled and explicit submit/reset; Dialog controlled/uncontrolled, outside click, Escape, focus trap and restoration.
- Accessibility: assert roles, names, description/error associations and actual keyboard focus. Run axe on document body with dialog open so portals are covered. Assert no duplicate IDs across two forms. Avoid treating axe as keyboard coverage.
- Visual: fixed gallery fixtures including focus, disabled/invalid and open portal states; deterministic viewport, reduced motion, local fonts and animation suppression.
- Linux CI is the authoritative screenshot environment. Generate committed baselines in the same pinned Playwright Linux image and browser revision used in CI, including matching package version; macOS runs behavior/a11y without updating Linux baselines. If Docker unavailable locally, use an explicitly triggered CI baseline job and review its artifacts before committing images. Never compare macOS-produced baselines to Ubuntu output.
- Exercise the standalone gallery build as proof CSS is delivered independently; retain existing Sheet browser tests and application verification.

## Synthesis decision
Pending parent comparison.

## Tradeoffs accepted
- Accept one explicit CSS import in exchange for predictable styling across source consumers and independent apps.
- Accept explicit label/error IDs in exchange for reference fidelity and transparent native form behavior.
- Accept Linux-only authoritative screenshots in exchange for meaningful, reproducible differences.

## Alternatives considered
- Schema-driven `<Field name label error>`: hides IDs and validation but exposes a new form-state contract, constrains composition, and diverges from reference API; rejected despite smaller call sites.
- Component-scoped styles only: hides import setup but spreads tokens/overlay styling and makes delivered package CSS less inspectable; central stylesheet is simpler to verify in this source-export workspace.

## Open questions and risks
- Does the pinned upstream Input support numeric model values and every requested Button size exactly as sketched? Resolve against source before implementation.
- Can the available Linux CI runner generate and return baseline artifacts? Resolve in workflow design before claiming visual verification complete.

## Next implementation step
Pin upstream source contracts, then implement the independent gallery importing public CSS and a native Input reset/FormData fixture before expanding to Dialog.
