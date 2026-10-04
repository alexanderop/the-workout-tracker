# @form/ui

Independent Vue components built on native controls and Reka UI. Consumers own form state, validation, content, and layout. The library requires no Tailwind build, shadcn package, or CLI.

```ts
import { Button, Input, Field, FieldLabel, FieldDescription } from "@form/ui";
import "@form/ui/tokens.css";
import "@form/ui/styles.css";
```

```vue
<Field>
  <FieldLabel for="name">Workout name</FieldLabel>
  <Input id="name" v-model="name" name="name" aria-describedby="name-help" />
  <FieldDescription id="name-help">Shown in your workout list.</FieldDescription>
</Field>
<Button type="submit">Save</Button>
```

`IconButton` is the shared control for icon-only actions. Its required `label` supplies the accessible name, its decorative slot contains the icon, and `shape="circle"` selects a round surface. It defaults to a native `type="button"`, supports Button color variants, and owns a centered 20px icon and a minimum 44 × 44px target. Forward native attributes such as `disabled` and event listeners normally. Consumers own placement, not internal geometry.

`Button unstyled` explicitly opts into consumer-owned card, row or text-action layout while retaining native semantics and shared focus/disabled behavior. Use it only with a layout class. Do not globally reset `.ui-button`: that also changes nested library controls and makes app rendering diverge from Histoire. Standard Button variants and sizes remain styled by the library.

Native attributes and listeners fall through. `Button` keeps native button submission behavior. Specify `type="button"` for actions inside forms. `as` and `as-child` support alternate semantic elements; callers must use appropriate attributes for the rendered element. An anchor does not gain native button disabled behavior.

`Input` supports controlled `modelValue`/`update:modelValue` and browser-owned `defaultValue`. Native `name`, `required`, `disabled`, `readonly`, `min`, and `form` attributes work. Number inputs emit a number when their value parses, or an empty string when cleared. Form reset restores `defaultValue`; a controlled input also emits that value, or an empty string when no default is supplied. Cancelling the reset prevents that update.

Field relationships are explicit. Connect `FieldLabel` with `for` and list description and error IDs in `aria-describedby`. Adding an error should retain the help text ID. Set `aria-invalid` on the input and `data-invalid` on Field. `FieldError` accepts an `errors` array, deduplicates nonempty messages, or renders its default slot. No implicit validation context is created.

```vue
<Dialog v-model:open="open">
  <DialogTrigger as-child><Button type="button">Edit workout</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit workout</DialogTitle>
      <DialogDescription>Changes apply to your next session.</DialogDescription>
    </DialogHeader>
    <Input aria-label="Workout name" v-model="name" />
    <DialogFooter>
      <DialogClose as-child><Button type="button" variant="outline">Done</Button></DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

Dialog uses Reka's controlled/uncontrolled state, focus handling, Escape handling, and outside interaction. `DialogContent` forwards Reka content props and events, including cancellation events such as `escapeKeyDown` and `openAutoFocus`. It includes an overlay and close button. Set `show-close-button="false"` with a Vue binding to remove the close button. `DialogFooter` can add a close action with `show-close-button`.

Set `.dark` or `data-ui-theme="dark"` on the document root to theme body portals. For a locally themed subtree, provide `DialogContent :portal-to="elementOrSelector"`. `portal-disabled` renders in place. `DialogPortal` is also exported for callers composing the lower-level overlay parts.

`Sheet` composes the shared Dialog components, retaining its existing open/close API, responsive layout and explicit restoration of focus to its opener.

The workout app consumes these shadcn-vue adaptations through `@form/ui`. Its stylesheet imports the shared styles in the components layer and maps the shared theme tokens to the workout palette. App layout classes override shared defaults.

`NativeSelect` supports string/number models and forwards native attributes and change events. It intentionally keeps the browser arrow and a single select root to retain native mobile pickers and label/layout behavior. `Textarea` supports a string model and native attributes. These two controls use Vue's native model binding (including IME handling); they do not provide the Input component's controlled form-reset synchronization. `Switch` uses Reka's root and thumb with a boolean model, disabled/required/name props and native labeling. The hidden backup file input remains native because its DOM ref is used to open the file picker.

## Reference contract

The fixed reference is [shadcn-vue b251d9f](https://github.com/unovue/shadcn-vue/tree/b251d9fd92aa496495e127137a7734704fb34a29/apps/v4/registry/new-york-v4/ui), using new-york-v4 and the [neutral OKLCH theme](https://github.com/unovue/shadcn-vue/blob/b251d9fd92aa496495e127137a7734704fb34a29/apps/v4/public/r/styles/new-york-v4/theme-neutral.json). Source and CSS adaptation is covered by [MIT attribution](./THIRD_PARTY_NOTICES.md).

| Delivered family | Contract                                                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Button           | default, destructive, outline, secondary, ghost, link; default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg sizes; Reka Primitive composition                            |
| Input            | Native input, controlled/default values, number input conversion, invalid/disabled/focus styling                                                                         |
| Field            | Field, FieldGroup, FieldSet, FieldLegend, FieldContent, FieldTitle, FieldDescription, FieldLabel, FieldError, FieldSeparator; vertical/horizontal/responsive orientation |
| Dialog           | Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose, DialogOverlay; additional DialogPortal export             |

Button heights are 24/32/36/40px at a 16px root font size. Input is 36px tall. Dialog has 24px padding, 16px gaps, a 512px desktop maximum width and a 16px viewport inset. Responsive Field layout uses a container query. The neutral theme radius is 0.625rem; control radii subtract 2px. Slots, native semantics and Reka behavior follow the reference.

Intentional differences are explicit CSS imports and namespaced `--ui-*` tokens, local control resets instead of Tailwind Preflight, native form reset synchronization, filtering empty errors, an accessible close label directly on the icon button, reduced-motion support, and configurable dialog portal destination. Destructive-button hover uses adjusted light and dark background blends to preserve the required 4.5:1 text contrast across browser engines. `buttonVariants`, `fieldVariants` and their Tailwind class APIs are not exported. `DialogScrollContent` is deferred. Consumer class names are merged by Vue; there is no Tailwind class conflict resolver. The Histoire explorer supplies a bundled Inter font, while the library inherits its consumer's font.

## Code quality

Keep component APIs small, strictly typed, accessible and consistent with the reference contract. Preserve native form semantics, keyboard navigation, focus management and resource cleanup.

- `pnpm --filter @form/ui typecheck` and `pnpm --filter @form/ui lint` check the public source.
- `pnpm dev:ui` opens Histoire at http://127.0.0.1:4186. Stories are organized into foundations, individual components and application patterns. Every page covers usage, variants, states, behavior and examples. Patterns use isolated demo state; foundations show semantic roles before technical token names. Its build imports only public library exports and styles.
- Root `pnpm verify` runs type checking and linting only. This project does not maintain automated tests or a testing strategy.

## Catalog roadmap

The first increment delivers the families above. Remaining pinned registry families are recorded below; a checked family means the specific contract above, not every optional upstream helper.

- [ ] accordion
- [ ] alert
- [ ] alert-dialog
- [ ] aspect-ratio
- [ ] attachment
- [ ] avatar
- [ ] badge
- [ ] breadcrumb
- [ ] bubble
- [x] button
- [ ] button-group
- [ ] calendar
- [ ] card
- [ ] carousel
- [ ] chart
- [ ] checkbox
- [ ] collapsible
- [ ] combobox
- [ ] command
- [ ] context-menu
- [x] dialog
- [ ] drawer
- [ ] dropdown-menu
- [ ] empty
- [x] field
- [ ] form
- [ ] hover-card
- [x] input
- [ ] input-group
- [ ] input-otp
- [ ] item
- [ ] kbd
- [ ] label
- [ ] marker
- [ ] menubar
- [ ] message
- [ ] message-scroller
- [x] native-select
- [ ] navigation-menu
- [ ] number-field
- [ ] pagination
- [ ] pin-input
- [ ] popover
- [ ] progress
- [ ] questionnaire
- [ ] radio-group
- [ ] range-calendar
- [ ] resizable
- [ ] scroll-area
- [ ] select
- [ ] separator
- [ ] sheet (existing legacy component; reference migration deferred)
- [ ] sidebar
- [ ] skeleton
- [ ] slider
- [ ] sonner
- [ ] spinner
- [ ] stepper
- [x] switch
- [ ] table
- [ ] tabs
- [ ] tags-input
- [x] textarea
- [ ] toggle
- [ ] toggle-group
- [ ] tooltip

## Mobile numeric input

`NumericInput` adapts the calculator-style numeric editor from our workoutTracker app. It uses the shared Dialog and Button components with the consumer's `--ui-*` theme. On phones it opens at the bottom of the screen; on larger screens it is a centered dialog. It is used for weight and repetitions in both active sets and routine templates.

```vue
<NumericInput
  v-model="weight"
  title="Weight"
  label="Set 1 weight for Bench press"
  unit="kg"
  :min="0"
  :max="1000"
  :decimals="2"
  :preset-step="2.5"
/>
```

The model accepts a string or number and emits a canonical numeric string only on confirmation or a quick-pick selection. Opening preserves the original value; Cancel, Escape and outside dismissal discard the local edit. The first digit replaces the value, while Backspace edits it. Digit keys, period/comma and Backspace work with a physical keyboard too. Enter confirms from the value display and retains normal activation on buttons. Whole-number inputs omit the decimal key. New decimal entry is limited by `decimals`; existing more precise weights remain unchanged unless edited. Out-of-range or empty values cannot be confirmed. `open` lets consumers select the active row without marking the set logged. Attributes such as class, id and aria-describedby attach to the trigger button. Use domain validation when submitting the containing form; this is a button-based editor, not a native number input.

Numeric dialogs have a dedicated overlay layer so they can open inside a template Sheet without losing focus trapping or covering their own controls. `DialogContent` accepts `overlayClass` for this purpose. Portaled dialog root styles are global and namespaced because Vue's parent scope attribute does not propagate through the portal wrapper.
