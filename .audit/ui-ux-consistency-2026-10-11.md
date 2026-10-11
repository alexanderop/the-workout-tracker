# UI/UX consistency audit — 2026-10-11

Method: walked the real app at 375×812 (dark theme) through fresh home → picker → session → numeric editor → log set → finish → review → home, Exercises, Progress, Settings hub, Training preferences, Appearance and History. A code sweep of `apps/workout/src` and `packages/ui/src` ran in parallel. The key code claims were spot-checked with grep.

Severity: **High** means the user notices it on main flows. **Medium** means it is visible but secondary. **Low** means hygiene that drives future drift.

## High

### H1 · Destructive confirmations look like normal actions

- `BaseButton variant="destructive"` exists (`packages/ui/src/styles.css:65`) but is used **0 times** in the app.
- "Delete all data", "Discard workout" and "Remove exercise" confirm with the same accent button as "Save workout".
- There are ~11 confirmation sheets built from three different button recipes:
  - `BaseButton` with `variant="secondary"`
  - `unstyled class="btn primary|secondary"`
  - a generic confirm in `WorkoutDialogs.vue:263`
- **Fix:** a `BaseConfirmSheet` in `@form/ui` (title, consequence, cancel/confirm labels, busy, error slot, `destructive`). Rebuild every confirmation on it.

### H2 · Every screen has a different header

| Screen          | Title                                         | Right side                       | Back                                       |
| --------------- | --------------------------------------------- | -------------------------------- | ------------------------------------------ |
| Workouts        | h1 inside calendar slot                       | calendar icon button             | —                                          |
| Exercises       | `.page-heading`                               | accent text "Create"             | —                                          |
| Progress        | `.page-heading`                               | "All time" pill (looks tappable) | —                                          |
| Settings hub    | bare h1, 32px                                 | —                                | —                                          |
| Settings detail | `BaseScreenHeader`, title inline next to back | —                                | "‹ Settings"                               |
| History         | `.dashboard-heading`                          | —                                | "← Back to workouts" (arrow, small, white) |
| Session         | `TrainingHeader`                              | "Finish" accent text             | "‹ Workouts" above the title               |

- `BaseScreenHeader` is used in exactly 1 file.
- **Fix:** extend `BaseScreenHeader` with `back`, `title` and `action` slots and a `large` variant for tab roots. Add one `BaseBackLink` (chevron, accent, destination name). Migrate all 7 screens.

### H3 · "Selected" has five different looks

- Picker row: tinted row + circle check.
- Plate toggles: **filled accent** blocks.
- Numeric value picker: **grey** pill.
- Segmented control: raised surface.
- Accent swatch: ring + check.
- Exercise strip: accent outline.
- The user has to relearn what "on" means on each screen.
- **Fix:** define one selected token pair (`--accent-soft` background + `--accent` border/text). Build a shared `BaseToggleChip`/`BaseChoiceCard` for the plates, filter cards and calendar. Filled accent stays reserved for the primary action.

### H4 · The check icon means two different things in the session

- In the set row, the filled accent ✓ means **log set**.
- In the numeric editor, the soft ✓ means **confirm value** (draft only).
- The design rules say these must be clearly distinct ("Distinguish editing a value from logging a set").
- **Fix:** label the editor's confirm "Done", or use a different glyph (↵ or "Set"). Keep ✓ for logging only.

### H5 · Duplicate and lingering feedback

- After logging one set, two messages say the same thing: "✓ Set logged" and "Back squat · set 1 logged." Both push "Discard workout" down.
- "Workout saved. Another session in the books." follows the user to Progress, Settings/Appearance and History. It is still visible minutes later.
- There are ~6 notice classes (`.notice`, `.settings-notice`, `.draft-finish-notice`, `.detached-input-notice`, `.name-recovery-notice`, `.field-error` misused as a sheet error) and ~7 empty-state classes.
- **Fix:**
  - Build `BaseNotice` (tone, action slot, role) and `BaseEmptyState` (compact/panel).
  - Show one message per event.
  - Scope route-level toasts to their page, or auto-dismiss them.

## Medium

### M1 · Sheet footers use different layouts

- Picker: full-width sticky primary.
- Finish: right-aligned pair.
- Review: ragged wrap. "Edit workout" (small) sits next to a large "Repeat workout", and "Save as template" (large) drops to its own line.
- **Fix:** one `form-actions` rule. On phones, stack full-width with the primary on top or bottom. Use the same size for every button in a group.

### M2 · Lists are hand-rolled outside Settings

- History rows are 94px with `--border`, Settings rows are 56px with `--rule`, and catalog rows have no chevron.
- The Home "Latest workout" is a flat row, but "Templates" directly below it is a bordered card.
- **Fix:** extend `BaseListRow` with leading, subtitle and trailing slots and a `density` prop. Migrate History, Catalog, Templates and Filter rows.

### M3 · The same stats render three ways

- Finish and Review: value above label ("1 / sets logged").
- Progress: label, then value, then unit, each on its own line.
- Home and History: inline "1 min · 1 set · 800 kg".
- Duration shows as "00:24" in Finish and as "1 minutes" in Review (wrong plural; Home says "1 min").
- **Fix:** one `StatGroup` component and one duration formatter (`Intl` plural rules).

### M4 · Duplicate navigation on phones

- A "Settings" footer link appears under Progress, History and even on Settings detail pages, while the bottom nav already has Settings.
- **Fix:** hide the content footer at the phone breakpoint.

### M5 · Enumerated choices use mixed controls

- Theme and language use a segmented control.
- Rest, bar weight and Progress exercise use native selects.
- Weight unit is a non-interactive value row.
- Picker category uses a leftover `class="input"`.
- **Fix:** 2–4 options use a segmented control, more use a select.

### M6 · Gutters are inconsistent

- The page uses a 20px gutter.
- The training dock text uses ~10px ("Next: Back squat", "01:30 rest").
- The numeric editor keypad uses ~12px.
- **Fix:** add a `--page-gutter` token and use it in the dock and editor.

### M7 · Heading colour

- The selected exercise name in the session is a large **accent** heading.
- Every other heading uses `--text`.
- The accent should signal selection or action, not a title.

## Low (drift sources)

- **Type:** 23 distinct px font sizes in app CSS, including 8, 9 and 10px. That text is too small for a phone in the gym (labels such as "Logged", "session", "kg"). Add `--text-xs…2xl` tokens and lint raw px values.
- **Radius:** 14 values (2–20px, 1rem, 999px), but the only token is `--ui-radius`. Add `--radius-sm/md/lg/pill`.
- **Spacing:** values such as 7, 9, 11, 13, 18, 22 and 50px. Add a 4px scale.
- **Button recipes:** `.btn` and `.text-button` re-implement the `secondary`, `link` and `ghost` variants with 51 `unstyled` uses.
- **Icons:** `ChevronRight` at 16, 18 and 22px. Both `ArrowLeft` and `ChevronLeft` are used for back.
- **Hand-built switch:** the filter sheet builds its own `role="switch"` instead of using `BaseSwitch`.
- **Settings hub groups:** the first group has no section label, while "This device" and "Your data" do. Install uses an accent icon tile, while Export and Import use grey tiles.

## Already good

- Settings (hub, detail pages, list rows, segmented control, switch) is the cleanest area and should be the template for the rest.
- All overlays are `BaseSheet`, with consistent grabber, close, swipe and focus behaviour.
- Colours come from tokens throughout, and lint enforces it.
- Icon-only buttons use `BaseButtonIcon` with 44px targets.
- Cancel sits left and confirm right in almost every sheet.

## Suggested order

1. `BaseConfirmSheet` with a destructive variant (H1, M1). ~half a day.
2. `BaseNotice` and `BaseEmptyState`, then dedupe the feedback (H5). ~half a day.
3. Unify selected-state tokens and the editor confirm glyph (H3, H4). ~2–3 h.
4. `BaseScreenHeader` with slots and `BaseBackLink` (H2). ~half a day.
5. Extend `BaseListRow`, add `StatGroup`, fix the duration formatter (M2, M3). ~half a day.
6. Type, radius and spacing tokens, plus a lint rule against raw px values (Low). ~half a day, then ongoing.
