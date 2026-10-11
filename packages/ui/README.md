# @form/ui

Independent Vue components built on native controls and Reka UI. Consumers own form state, validation, content, and layout. The library requires no Tailwind build, shadcn package, or CLI.

```ts
import {
  BaseButton,
  BaseInput,
  BaseField,
  BaseFieldLabel,
  BaseFieldDescription,
} from "@form/ui";
import "@form/ui/tokens.css";
import "@form/ui/styles.css";
```

```vue
<BaseField>
  <BaseFieldLabel for="name">Workout name</BaseFieldLabel>
  <BaseInput id="name" v-model="name" name="name" aria-describedby="name-help" />
  <BaseFieldDescription id="name-help">Shown in your workout list.</BaseFieldDescription>
</BaseField>
<BaseButton type="submit">Save</BaseButton>
```

`BaseButtonIcon` is the shared control for icon-only actions. Its required `label` supplies the accessible name, its decorative slot contains the icon, and `shape="circle"` selects a round surface. It defaults to a native `type="button"`, supports BaseButton color variants, and owns a centered 20px icon and a minimum 44 × 44px target. Forward native attributes such as `disabled` and event listeners normally. Consumers own placement, not internal geometry.

`BaseButton unstyled` strips the variant and size styles and leaves layout to the consumer. The workout app no longer uses it: lint rejects it in `apps/workout`, so add a variant, a size or a shared component instead (`size="row"` for a left-aligned button as tall as its content, `BaseListRow as="button"`, `BaseChoiceChip`, `BaseMediaTab`, `BaseDayCell`). Do not globally reset `.ui-button`: that also changes nested library controls and makes app rendering diverge from Histoire.

Native attributes and listeners fall through. `BaseButton` keeps native button submission behavior. Specify `type="button"` for actions inside forms. `as` and `as-child` support alternate semantic elements; callers must use appropriate attributes for the rendered element. An anchor does not gain native button disabled behavior.

`BaseInput` supports controlled `modelValue`/`update:modelValue` and browser-owned `defaultValue`. Native `name`, `required`, `disabled`, `readonly`, `min`, and `form` attributes work. Number inputs emit a number when their value parses, or an empty string when cleared. Form reset restores `defaultValue`; a controlled input also emits that value, or an empty string when no default is supplied. Cancelling the reset prevents that update.

BaseField relationships are explicit. Connect `BaseFieldLabel` with `for` and list description and error IDs in `aria-describedby`. Adding an error should retain the help text ID. Set `aria-invalid` on the input and `data-invalid` on BaseField. `BaseFieldError` accepts an `errors` array, deduplicates nonempty messages, or renders its default slot. No implicit validation context is created.

```vue
<BaseDialog v-model:open="open">
  <BaseDialogTrigger as-child><BaseButton type="button">Edit workout</BaseButton></BaseDialogTrigger>
  <BaseDialogContent>
    <BaseDialogHeader>
      <BaseDialogTitle>Edit workout</BaseDialogTitle>
      <BaseDialogDescription>Changes apply to your next session.</BaseDialogDescription>
    </BaseDialogHeader>
    <BaseInput aria-label="Workout name" v-model="name" />
    <BaseDialogFooter>
      <BaseDialogClose as-child><BaseButton type="button" variant="outline">Done</BaseButton></BaseDialogClose>
    </BaseDialogFooter>
  </BaseDialogContent>
</BaseDialog>
```

BaseDialog uses Reka's controlled/uncontrolled state, focus handling, Escape handling, and outside interaction. `BaseDialogContent` forwards Reka content props and events, including cancellation events such as `escapeKeyDown` and `openAutoFocus`. It includes an overlay and close button. Set `show-close-button="false"` with a Vue binding to remove the close button. `BaseDialogFooter` can add a close action with `show-close-button`.

Set `data-theme="light"` or `data-theme="dark"` on the document root to choose a color scheme for body portals; without it the document follows `prefers-color-scheme`. `data-accent` selects the accent color. For a locally themed subtree, provide `BaseDialogContent :portal-to="elementOrSelector"`. `portal-disabled` renders in place. `BaseDialogPortal` is also exported for callers composing the lower-level overlay parts.

`BaseSheet` composes the shared BaseDialog components, retaining its existing open/close API, responsive layout and explicit restoration of focus to its opener. On phones up to 650px it slides up in 240ms and exits in 180ms; larger screens retain centered scale/fade motion. Reduced motion removes movement with state-specific selectors. On phones, dragging the header area down dismisses the sheet after a pull of about 30% of its height (at most 140px) or a quick downward flick; a finger that pauses for more than 100ms before lifting counts as stationary, so only distance decides. Upward drags resist and never dismiss. Swipe dismissal emits the same `close` event as Escape and the backdrop, so a consumer can keep the sheet open. Its optional `close-auto-focus` event passes a cancellable `Event` before restoration; consumers can call `event.preventDefault()` and focus the destination required by their action.

The workout app consumes these shadcn-vue adaptations through `@form/ui`. Its stylesheet imports the shared styles in the components layer and maps the shared theme tokens to the workout palette. App layout classes override shared defaults.

`BaseListGroup` and `BaseListRow` draw every list: a bordered card with an optional uppercase label, an `action` slot opposite the label and a `scroll` prop that makes the card the scroll container (give the group a bounded height; `scrollToTop()` is exposed). A row has a title and the slots `leading` (artwork; the `icon` prop is the shortcut for a 32px tile, `tone` `primary`, `muted` or `destructive`), `subtitle` (each `span` is one muted line; `description` is the plain-text shortcut) and `trailing` (a value, a check circle or a control; `value` is the shortcut), and optionally a chevron. `as` chooses the rendered element or component (`"a"`, a router link, `"button"`, `"label"` around a control); attributes and listeners fall through to it, so the package needs no router, and a button row gets `type="button"`. `density` is `comfortable` (default, 56px minimum) or `compact` (44px minimum, tighter padding); `selected` draws the shared selected look and goes with `aria-pressed` on a toggling row. Rows are separated by one `--rule` hairline and the chevron is always 18px. `BaseSegmentedControl` is a native radio group drawn as segments (`legend`, `name`, `options`, `v-model`); the legend is visually hidden, so pair it with a visible heading. `BasePageHeader` is the screen heading; see [Shared patterns](#shared-patterns).

`BaseSelectNative` supports string/number models and forwards native attributes and change events. It intentionally keeps the browser arrow and a single select root to retain native mobile pickers and label/layout behavior. `BaseTextarea` supports a string model and native attributes. These two controls use Vue's native model binding (including IME handling); they do not provide the BaseInput component's controlled form-reset synchronization. `BaseSwitch` uses Reka's root and thumb with a boolean model, disabled/required/name props and native labeling. The hidden backup file input remains native because its DOM ref is used to open the file picker.

## Shared patterns

One job has one component; the [pattern catalog](../../docs/design.md#pattern-catalog) says which. Colors, type, radius and spacing come from the tokens only. Each component has a story under **02 Components** and a browser test.

| Component                   | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BaseConfirmSheet`          | `v-model:open`, required `intent` (`destructive` or `neutral`), `title`, `description?`, `confirmLabel`, `cancelLabel`, `busy?`, `confirmDisabled?`, `error?`. Emits `confirm`, `cancel` and `close-auto-focus` (prevent it to place focus yourself); the default slot holds rich content above the buttons. Wraps `BaseSheet` and `BaseActions`. Focus starts on Cancel and returns to the opener. Escape, close, backdrop and swipe cancel; none works while `busy`. Confirm never closes the sheet: the consumer closes it on success and sets `error` on failure (role alert). |
| `BaseActions`               | Button row. Put the primary last. Phones (up to 650px): full-width stack in source order, primary at the bottom. Wider: right-aligned row, primary on the right. Every `BaseButton` child gets the same 44px height. `sticky` pins it to the bottom of a `BaseSheet` (replaces the `.form-actions` footer).                                                                                                                                                                                                                                                                        |
| `BaseNotice`                | `tone` (`info`, `success`, `danger`), `dismissLabel?` (shows a dismiss button; emits `dismiss`), default and `action` slots. Role `status` for info and success, `alert` for danger. No warning tone: the palette has none.                                                                                                                                                                                                                                                                                                                                                        |
| `BaseEmptyState`            | `title`, `body?`, `size` (`panel`, `compact`), `headingLevel` (1 to 6; 1 only when the state replaces the whole page), `icon` and `action` slots. The title takes `tabindex="-1"` and `focus()` is exposed, so a page-level failure can move focus to it.                                                                                                                                                                                                                                                                                                                          |
| `BasePageHeader`            | `variant` (`root`, `detail`), `title?`, slots `back` (detail only), `title`, `action`. The title is the `h1`. Detail is a sticky bar covering the safe area; its heading takes focus on mount and shows at most two lines. Root is a large title with a 44px minimum row height, so it sits at the same place with or without an action, and leaves focus to the shell. Exposes `focus()`. It replaced `BaseScreenHeader`.                                                                                                                                                         |
| `BaseBackLink`              | Chevron plus label in the default slot. `as` picks the element or component (default `a`; `"button"` sets `type="button"`); `href`, `to` and listeners fall through, so no router dependency.                                                                                                                                                                                                                                                                                                                                                                                      |
| `BaseChoiceChip`            | `mode` (`toggle`: button with `aria-pressed`, boolean `v-model`; `radio`: native radio with `name`, `value` and a shared string `v-model`), `size` (`compact`, `card`), `disabled`, default and `media` slots. The one selected look, read from the `--ui-selected-bg`, `--ui-selected-border` and `--ui-selected-text` tokens (accent-soft surface, accent border and text); other selected surfaces use the same tokens.                                                                                                                                                         |
| `BaseStat`, `BaseStatGroup` | `BaseStat`: `value`, `label`, `unit?`. The group lays stats out in a wrapping row between two hairlines (three fit across a 300px sheet). Format values before passing them in, durations with the app's one duration formatter.                                                                                                                                                                                                                                                                                                                                                   |
| `BaseInputGroup`            | Wraps one `BaseInput` with `leading` (decorative icon) and `trailing` (interactive, such as a clear button) slots. The group draws the border and focus ring.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `BaseMediaTab`              | A picture tile over a one-line caption: `current` (selected tokens and `aria-current`), slots `media` (tile content), default (caption) and `badge` (accent badge on the tile's corner). The tile is decorative, so name a tab whose badge carries a state with `aria-label`. The active workout's exercise strip.                                                                                                                                                                                                                                                                 |
| `BaseDayCell`               | One calendar day: `day`, `weekday?` (makes it 64px instead of 44px), `today` (neutral outline and underlined number, apart from selected), `marked` (accent dot), `selected` (a toggle with `aria-pressed`; leave unset for a cell that only acts). `aria-label` must contain the visible weekday and number.                                                                                                                                                                                                                                                                      |
| `BaseColorSwatch`           | A round radio swatch: `name`, `value`, `accent` (the `data-accent` that paints the dot) and a shared string `v-model`; the default slot is the caption. Selected ring plus a check. Wrap a group in a labelled fieldset.                                                                                                                                                                                                                                                                                                                                                           |
| `BaseFileInput`             | A visually hidden native file input: required `label`, `accept?`, `disabled?`; emits `select` with the `File` and clears itself; `open()` is exposed for the caller's button. Out of the tab order.                                                                                                                                                                                                                                                                                                                                                                                |
| `BaseCheckbox`              | A labelled native checkbox, boolean `v-model`, default slot is the label, 44px row. For a setting that applies at once use `BaseSwitch` (a native checkbox with the `switch` role, drawn as a track and thumb).                                                                                                                                                                                                                                                                                                                                                                    |

`BaseButton variant="link" size="sm"` is the accent text action and `variant="ghost"` the neutral one; both replace the app's `.text-button`. Both are 44px high on phones and coarse pointers. `size="row"` makes a full-width button that is left-aligned, wraps and is as tall as its content (at least 44px): a two-line "Next" target in the dock, a sidebar entry, a stacked choice such as the draft-conflict actions. Pair it with `ghost` (neutral) or `link` (accent).

## Reference contract

The fixed reference is [shadcn-vue b251d9f](https://github.com/unovue/shadcn-vue/tree/b251d9fd92aa496495e127137a7734704fb34a29/apps/v4/registry/new-york-v4/ui), using new-york-v4 and the [neutral OKLCH theme](https://github.com/unovue/shadcn-vue/blob/b251d9fd92aa496495e127137a7734704fb34a29/apps/v4/public/r/styles/new-york-v4/theme-neutral.json). Source and CSS adaptation is covered by [MIT attribution](./THIRD_PARTY_NOTICES.md).

| Delivered family | Contract                                                                                                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BaseButton       | default, destructive, outline, secondary, ghost, link; default, xs, sm, lg, row, icon, icon-xs, icon-sm, icon-lg sizes; Reka Primitive composition                                                               |
| BaseInput        | Native input, controlled/default values, number input conversion, invalid/disabled/focus styling                                                                                                                 |
| BaseField        | BaseField, BaseFieldGroup, BaseFieldSet, BaseFieldLegend, BaseFieldContent, BaseFieldTitle, BaseFieldDescription, BaseFieldLabel, BaseFieldError, BaseFieldSeparator; vertical/horizontal/responsive orientation |
| BaseDialog       | BaseDialog, BaseDialogTrigger, BaseDialogContent, BaseDialogHeader, BaseDialogFooter, BaseDialogTitle, BaseDialogDescription, BaseDialogClose, BaseDialogOverlay; additional BaseDialogPortal export             |

BaseButton heights are 24/32/36/40px at a 16px root font size. BaseInput is 36px tall. BaseDialog has 24px padding, 16px gaps, a 512px desktop maximum width and a 16px viewport inset. Responsive BaseField layout uses a container query. The neutral theme radius is 0.625rem; control radii subtract 2px. Slots, native semantics and Reka behavior follow the reference.

Intentional differences are explicit CSS imports and namespaced `--ui-*` tokens, local control resets instead of Tailwind Preflight, native form reset synchronization, filtering empty errors, an accessible close label directly on the icon button, reduced-motion support, and configurable dialog portal destination. Destructive-button hover uses adjusted light and dark background blends to preserve the required 4.5:1 text contrast across browser engines. `buttonVariants`, `fieldVariants` and their Tailwind class APIs are not exported. `DialogScrollContent` is deferred. Consumer class names are merged by Vue; there is no Tailwind class conflict resolver. The Histoire explorer supplies a bundled Inter font, while the library inherits its consumer's font.

All shared component exports use the `Base` prefix and PascalCase filenames. See the [component naming contract](../../docs/workflows.md#component-names) and Histoire’s **00 Start here / Component naming** page.

## Code quality

Keep component APIs small, strictly typed, accessible and consistent with the reference contract. Preserve native form semantics, keyboard navigation, focus management and resource cleanup.

- `pnpm --filter @form/ui typecheck` and `pnpm --filter @form/ui lint` check the public source.
- `pnpm dev:ui` opens Histoire at http://127.0.0.1:4186. Stories are organized into foundations, individual components and application patterns. Every page covers usage, variants, states, behavior and examples. Patterns use isolated demo state; foundations show semantic roles before technical token names. Its build imports only public library exports and styles.
- Root `pnpm verify` runs type checking and linting only. Behavior tests run separately through `pnpm test`; see [Testing](../../docs/workflows.md#testing).

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

`BaseInputNumber` adapts the calculator-style numeric editor from our workoutTracker app. It uses the shared BaseDialog and BaseButton components with the consumer's `--ui-*` theme. On phones it fills the screen; on larger screens it is a centered dialog. Like a picker wheel, a scrolling list of quick picks sits above a row with the draft and a filled accent "Done" button (`numeric.done`; its accessible name `numeric.confirm(title)` starts with it, such as "Done: weight"), followed by the keypad. The check glyph is not used here: it means "log this set" in the workout app. The quick pick that matches the draft uses the shared selected tokens. The list opens centred on the current value, marks the value matching the draft with `aria-current` and scrolls to a typed value; a typed value outside the list moves the list around it. The optional `aside` slot renders left of the draft and receives `{ value }`, the valid draft as a number or null; the workout app shows barbell plates there. It is used for weight and repetitions in both active sets and routine templates.

```vue
<BaseInputNumber
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

The model accepts a string or number and emits a canonical numeric string only on confirmation or a quick-pick selection. Opening preserves the original value; Cancel, Escape and outside dismissal discard the local edit. The first digit replaces the value, while Backspace edits it. Digit keys, period/comma and Backspace work with a physical keyboard too. Drafts, pasted text and emitted values always use a period; the trigger, the value display, the quick picks and the decimal key show the mark from `numeric.decimalSeparator` in the provided `UiText` (a comma for German), so typing either mark yields the same number. Enter confirms from the value display and retains normal activation on buttons. Whole-number inputs omit the decimal key. New decimal entry is limited by `decimals`; existing more precise weights remain unchanged unless edited. Out-of-range, too precise or empty values cannot be confirmed, and the hint names the range or the allowed decimal places. Values are non-negative: there is no minus key and signed input is rejected, so `min` must be 0 or greater. Quick picks are multiples of `preset-step` that are also valid at `decimals`; when the step needs more decimals than allowed (2.5 for whole numbers), they widen to the smallest common multiple (5). A visually hidden status announces the value once it is confirmed or picked, not on every keypress. `open` lets consumers select the active row without marking the set logged. Attributes such as class, id and aria-describedby attach to the trigger button. A consumer `aria-label` replaces the generated "label: value unit" name; keep the visible value in it. Use domain validation when submitting the containing form; this is a button-based editor, not a native number input.

Numeric dialogs have a dedicated overlay layer so they can open inside a template BaseSheet without losing focus trapping or covering their own controls. `BaseDialogContent` accepts `overlayClass` for this purpose. Portaled dialog root styles are global and namespaced because Vue's parent scope attribute does not propagate through the portal wrapper.

## Muscle map

`BaseMuscleMap` renders original schematic muscle artwork using the shared theme. Import `MuscleRegion`, `MuscleHighlight` and `MuscleMapView` from `@form/ui`. The readonly `highlights` array contains `{ muscle, role }` records. Roles are `primary` or `supporting`; missing muscles are not highlighted. Duplicate highlights are idempotent, and primary wins conflicts regardless of order. Consumers own exercise metadata, calculations and external-data validation.

```vue
<BaseMuscleMap
  v-model="selectedMuscle"
  :highlights="[{ muscle: 'chest', role: 'primary' }]"
  view="both"
  interactive
  aria-label="Choose a muscle"
/>
```

`view` accepts `front`, `back` or `both` (default). The text list contains only visible regions, with shared regions listed once. Changing views never clears selection. Standard `v-model` binds `MuscleRegion | null` through `modelValue` and `update:modelValue`. Read-only is the default and may display a parent-supplied selection without emitting changes. `interactive` enables native selection buttons; activating the selected muscle clears it. `disabled` inhibits user selection while still rendering external model updates. Selection outlines a region without changing its involvement color.

The visible text list communicates each region's involvement independently of color and supplies keyboard/touch targets; the SVG is decorative. The single root group forwards native attributes, listeners and classes and exposes `data-slot="muscle-map"`. Supply `aria-label` or `aria-labelledby` for a contextual accessible name. The fallback “Muscle map” applies only when neither naming attribute is supplied. Consumers own headings, descriptions, surrounding cards and width constraints.

See **02 Components / BaseMuscleMap** in Histoire for interactive controls, parent reset, read-only selection, empty highlights and independent front/back instances. These examples use local sample data and are not integrated into the workout app. The component makes no fatigue or recovery claims and has no storage dependencies.

`BaseMuscleMap` accepts `presentation="illustration"` for decorative figures inside a labeled parent card. This mode hides the figure labels, legend and region list, and exposes no interactive regions. The parent supplies the visible label and any selection control. The default `full` presentation retains its accessible text equivalent.

Pure TypeScript consumers may import `MuscleHighlight`, `MuscleMapView` and `MuscleRegion` from the type-only `@form/ui/muscle-map-types` export without loading Vue component declarations. SVG geometry remains private.

## Mobile feedback components

- `BaseFeedback :active="confirmed"` wraps a status icon. It pulses only on a false-to-true change after mounting, without timers. Consumers retain the accessible label, canonical success state and error handling; never bind it to a draft or pending request. Initially confirmed values and undo do not animate.
- `BaseLoading` presents a static branded status with an optional `label`. Consumers own loading, errors and ready state; it imposes no delay.
- `BaseInstallInstructions` receives `platform` (`ios`, `android`, `browser`), `canInstall`, `busy`, `installed`, and `message`. It emits `install` and never calls browser APIs. Place it inside a user-invoked BaseSheet.

Motion durations and easing come from `tokens.css`. Buttons use an independent scale on press so consumer positioning is preserved. Coarse-pointer standard buttons have a minimum 44px touch target. Reduced motion disables press scaling and confirmation motion. Each component has an interactive Histoire story.
