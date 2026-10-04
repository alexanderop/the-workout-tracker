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

The five legacy tokens and `Sheet` remain unchanged. Existing Sheet consumers need no migration.

## Reference contract

The fixed reference is [shadcn-vue b251d9f](https://github.com/unovue/shadcn-vue/tree/b251d9fd92aa496495e127137a7734704fb34a29/apps/v4/registry/new-york-v4/ui), using new-york-v4 and the [neutral OKLCH theme](https://github.com/unovue/shadcn-vue/blob/b251d9fd92aa496495e127137a7734704fb34a29/apps/v4/public/r/styles/new-york-v4/theme-neutral.json). Source and CSS adaptation is covered by [MIT attribution](./THIRD_PARTY_NOTICES.md).

| Delivered family | Contract                                                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Button           | default, destructive, outline, secondary, ghost, link; default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg sizes; Reka Primitive composition                            |
| Input            | Native input, controlled/default values, number input conversion, invalid/disabled/focus styling                                                                         |
| Field            | Field, FieldGroup, FieldSet, FieldLegend, FieldContent, FieldTitle, FieldDescription, FieldLabel, FieldError, FieldSeparator; vertical/horizontal/responsive orientation |
| Dialog           | Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose, DialogOverlay; additional DialogPortal export             |

Button heights are 24/32/36/40px at a 16px root font size. Input is 36px tall. Dialog has 24px padding, 16px gaps, a 512px desktop maximum width and a 16px viewport inset. Responsive Field layout uses a container query. The neutral theme radius is 0.625rem; control radii subtract 2px. Slots, native semantics and Reka behavior follow the reference.

Intentional differences are explicit CSS imports and namespaced `--ui-*` tokens, local control resets instead of Tailwind Preflight, native form reset synchronization, filtering empty errors, an accessible close label directly on the icon button, reduced-motion support, and configurable dialog portal destination. Destructive-button hover uses adjusted light and dark background blends to preserve the required 4.5:1 text contrast across browser engines. `buttonVariants`, `fieldVariants` and their Tailwind class APIs are not exported. `DialogScrollContent` is deferred. Consumer class names are merged by Vue; there is no Tailwind class conflict resolver. The gallery supplies a bundled Inter font, while the library inherits its consumer's font.

Screenshots verify our implementation's visual regressions in a canonical Linux environment. They do not establish measured pixel equivalence with upstream. The reference contract records the properties derived from pinned source.

## Verification

- `pnpm --filter @form/ui test:browser` runs behavior, axe, and strict ARIA-tree checks in real Chromium, including native forms and body portals.
- `pnpm test:ui:cross-browser` runs the same tests in Firefox and WebKit. CI runs each engine separately on Linux. See [the Reka-inspired test contracts](test/README.md) for coverage, fixture conventions, and snapshot review rules.
- `pnpm --filter @form/ui typecheck` and `pnpm --filter @form/ui lint` check the public source and fixtures.
- Root `pnpm test:visual` compares canonical Linux screenshots. Root `pnpm test:visual:update` updates them in the same environment; review image differences before accepting changes.
- `pnpm dev:ui` opens the standalone consumer gallery. Its build imports only public library exports and styles.

The accessibility matrix runs automatically with the default browser suite, root `pnpm verify`, and CI. It scans light and dark button variants and sizes, disabled controls, valid/invalid fields, every button variant while hovered and keyboard-focused, open Dialog portals, and the existing Sheet. Behavior tests also scan validation errors and the dialog after keyboard navigation.

Use `expectAccessible("descriptive interaction state")` from `test/helpers/accessibility.ts` after rendering or reaching a meaningful state. The helper waits for fonts and finite animations, then scans the whole body so portals are included. Failures report the state, rule, severity, affected selectors, remediation details, and rule documentation. Only the `region` rule is disabled because isolated component fixtures do not own application landmarks; application-level checks should retain it. New interactive components should add their relevant states to the matrix instead of relying on a scan after test cleanup.

Automated accessibility scans complement keyboard and focus assertions. Axe cannot detect every accessibility problem and does not replace screenreader testing.

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
- [ ] native-select
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
- [ ] switch
- [ ] table
- [ ] tabs
- [ ] tags-input
- [ ] textarea
- [ ] toggle
- [ ] toggle-group
- [ ] tooltip
