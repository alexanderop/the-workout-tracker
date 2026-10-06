# Design system

## Product brief

We design for a developer who enjoys going to the gym and wants a minimal workout tracker: fast editing, a clear overview, visible progress and a reason to keep coming back. This direction comes from the product owner; it is a design brief, not findings from user research.

The product promise is: **Log quickly. See where you stand. Notice your progress.**

Developer familiarity should inform our respect for efficiency and precision. It does not justify technical language, configuration-heavy screens or requiring keyboard shortcuts to complete an action.

### Core user needs

- Before training: understand recent workouts and quickly start or repeat a session.
- During training: see the current exercise and set, enter weight and repetitions, and correct mistakes with little effort.
- After training: review what was actually completed and understand the session at a glance.
- Over time: see personal progress and feel encouraged to return.

### Design principles

| Principle | Design consequence |
| --------- | ------------------ |
| Minimal, but understandable | Keep the next action prominent. Use clear labels and progressive disclosure rather than hiding essential actions behind unfamiliar icons. |
| Fast to edit, safe to correct | Keep frequent edits close to their values. Distinguish editing a value from logging a set, preserve input on failure and make recovery clear. |
| Confirm before deleting | Every delete, removal or discard action opens a confirmation modal before changing data. Name what will be lost, explain permanence, and provide a clear Cancel action. |
| An overview before detail | Lead with information needed for the current task. Keep workout summaries scannable and exercise and set details easy to reach. |
| Progress grounded in real training | Explain metrics, units and comparison periods. Distinguish completed work from planned work, and handle limited history honestly. |
| Motivation without pressure | Make completed work and personal improvements visible. Use calm, specific encouragement; avoid guilt, invented achievements or rewards that distract from training. |

### Design review questions

Can the user identify the next action at a glance? Can they change a value and recover from a mistake without losing context? Can they distinguish planned, edited and logged values? Does the overview explain what they did, and does progress show a meaningful comparison? Does the experience encourage returning after a break?

These principles guide future work; they do not claim every behavior is already implemented. Phone use between sets, one-handed interaction and short attention windows are working assumptions to validate. Exact progress comparisons and motivational feedback still need design decisions. A developer audience does not by itself establish demand for gamification, social features or advanced analytics.

The Histoire **00 Start here / Product brief** page presents this direction alongside the component catalog. Responsive specifications, a complete typography scale and workflow coverage remain separate documentation work.

## Visual foundation

The Workout Tracker uses the approved five-color palette. Values live in [`packages/ui/src/tokens.css`](../packages/ui/src/tokens.css); [`packages/ui/src/workout-theme.css`](../packages/ui/src/workout-theme.css) maps them to shared component roles. App layout lives in [`apps/workout/src/style.css`](../apps/workout/src/style.css).

| Token      | Color   | Role                                             |
| ---------- | ------- | ------------------------------------------------ |
| background | #141414 | Canvas and modal surfaces                        |
| surface    | #232322 | Controls, borders, selected navigation           |
| text       | #EEEEEC | Primary content                                  |
| muted      | #A3A39E | Supporting labels and icons                      |
| purple     | #A78BFA | Primary actions, logged sets, progress and focus |

There are no separate success or error colors. Status uses text, icons and shape with purple when emphasis is needed. The modal overlay reuses the background at partial opacity.

Inter Variable is bundled locally for offline use. Lucide icons use a consistent light stroke. Content has a restrained type hierarchy, compact desktop navigation and generous space around workout controls. Mobile uses a persistent four-item bottom menu, large number inputs and a compact rest timer. Dialogs use Reka focus trapping and explicitly return focus to their opener.

The interface uses a quiet visual hierarchy; empty states show actual data rather than fabricated statistics. [Prior art](prior-art.md) records the original reference and adaptations.

## Mobile motion and feedback

Motion explains a change without delaying the next action. Shared motion tokens define a 120ms press response, 180ms exit, 240ms entrance and 320ms completion response. Mobile sheets and numeric editors slide from the bottom; desktop dialogs use a small scale and fade. Close, Escape and backdrop dismissal retain the existing confirmation and focus contracts. Sheets do not advertise swipe dismissal until that interaction is implemented.

Buttons compress subtly on press without changing layout. Completion feedback runs only when a mounted control changes from incomplete to confirmed complete, never for an initial saved value or numeric draft confirmation. Reduced motion removes movement, including sheet and dialog state animations; the final state remains visible.

Startup shows a lightweight branded loading surface with no minimum wait. Installation is a user-invoked sheet with platform-specific instructions and native installation when available. There is no onboarding or guided tour. Develop shared components and review their Histoire examples before integrating application behavior.

## Button ownership

Icon-only actions use the shared `BaseButtonIcon`: a required accessible label, decorative icon, centered content and a minimum 44px square touch target at every viewport size. Circle and square surfaces share this geometry. Application classes position these controls without resetting their internals.

Standard buttons retain the UI package's variant and size styling. Existing custom cards, rows and text actions explicitly use `BaseButton unstyled` with an app-owned layout class. Global resets must exclude shared buttons; removing their flex layout is what previously displaced the settings icon. Histoire's BaseButtonIcon story owns the isolated interaction examples.

The desktop sidebar installation action uses a left-aligned label with an icon column. Wrapped labels stay aligned with their first line; the local-storage note uses the same icon and label offsets.

## Settings navigation

Settings is a full page at `/settings`, reached through the content footer on desktop and mobile and through a gear icon with a Settings label in the mobile bottom navigation. The bottom navigation has four equally sized destinations: Workouts, Exercises, Progress, and Settings. Its Settings link uses the same selected styling and active-page announcement as the other destinations. During an active workout, the training dock replaces the mobile bottom navigation. The content footer uses a native navigation link with a visible focus outline and a minimum 44px touch target. The current Settings link announces its active page. Settings has no header or sidebar trigger and does not open an overlay. Desktop navigation keeps its three destinations.

The page groups training preferences, backup controls, installation, and data deletion under the Settings heading. Delete all data uses a separate neutral section after backups and installation. Its confirmation names history, the active workout, drafts, templates, custom exercises, and preference reset. Downloaded backups remain on the device. Browser Back returns to the previous page. Leaving Settings clears an unsubmitted backup selection. Saved preferences and workout drafts remain in the shared workspace.

## Destructive actions

Deleting data, removing exercises or sets, clearing a logged result, discarding input drafts, and reducing a template or workout set count require an additional confirmation modal. The initiating control never performs the deletion. State the affected data and consequence, label the confirming action explicitly, and make cancellation easy. Escape, the close button and backdrop dismissal cancel. Keep initial focus on a safe control and restore focus on dismissal. Disable repeated submission while saving and report failures without claiming success. A conflict requires another review before deletion.

Use the existing palette and modal surfaces; deletion does not introduce a new warning color. Normal reversible logging toggles remain quick corrections. Cancelling an unconfirmed numeric edit or changing a picker selection does not delete saved data.

## Workout-first screens

Workouts Home summarizes the latest workout and links to full history and templates. A fresh journal has one prominent start action. The exercise picker supports search, filters, and multiple selection. New workouts open this picker before a session exists. Its fixed Start (count) action creates the selected workout; cancelling returns to Home without starting the clock. During training the same picker uses Add (count). Saving prevents dismissal, and errors retain selection. The active workout presents a horizontally scrollable thumbnail strip and one selected exercise. Native navigation buttons announce exercise names, selection and completion. The saved exercise order stays stable, including after the last set is logged. Before the first logged set, the header shows only the exercise count. Logging reveals set progress and volume. The picker remains available during training and after all sets are logged.

The compact workout header shows the saved title and a Rename workout action. Rename opens a sheet. Workout name changes use Save name or Enter. Moving focus to another control does not save the name or swallow the next action. Unsaved name input stays in the rename sheet and must be saved or cancelled before finishing. Conflicting names show explicit Keep my name and Use saved name choices.

The session omits the duplicate workspace topbar while retaining offline status. The selected exercise shows its name, equipment, repetition prescription and optional note. Rounded set rows align set number, weight, repetitions and an explicit log button. Numeric confirmation updates the draft only. The log button logs unfinished sets, saves corrections to logged sets, or undoes logging on an unchanged logged set. Its accessible name states the operation. The row options open a detailed editor with save-without-logging, explicit clear and discard-input actions. Inline rows are unmounted while that editor is open to avoid duplicate control IDs. Closing returns focus to the corresponding row, with the selected exercise or add control as a fallback.

The exercise ellipsis opens grouped options for targets, set editing, notes, replacement and removal. Draft recovery and conflict choices remain visible with the affected row. Saved rest deadlines drive the compact mobile dock, with skip or dismiss controls. Rest uses the user's configured duration; corrections do not restart it. Controls retain at least 44px touch targets at narrow widths. The current row uses purple emphasis; logged rows retain a quiet purple check. A Last time card below the rows shows logged sets from the most recent completed workout containing this catalog exercise, combining repeated entries and preserving zero-repetition attempts. It is absent when no matching logged history exists. Review presents results, the exercise ledger, then repeat and template actions. The existing purple semantic accent applies to selection and logged work; there are no unsupported metrics or invented history.

For a fresh journal, the welcome card owns the only start action. Its copy wraps naturally and its height follows its content. Mobile uses a compact mark and a full-width action; the page header omits repeated introductory copy. Returning journals without an active workout show one start action below their training rhythm. An active workout instead has one outlined card with its name, exercise and logged-set counts, and a single Continue workout action. The mobile navigation divides the available width equally among its rendered links, without unused columns.

Closing an exercise panel preserves its numeric input drafts. Changed notes, configuration and workout names ask before route navigation discards input, including browser Back. Changed templates ask before Cancel, Escape, close-button, backdrop dismissal or browser Back; unchanged editors close directly. Numeric editors accept a complete pasted value, normalize a decimal comma and reject invalid or overly precise input without replacing the current draft. Pasting does not confirm or log the value. Weight displays preserve up to two decimal places.

Opening a workout selects pending input after recovery, or unfinished work when no input is pending. Review my sets selects, scrolls to and focuses the first pending row, even in another exercise. Finishing requires pending edits to be resolved. Converting a workout to a template opens an editor so the user can remove skipped sets and adjust targets before saving. Domain meanings belong in [context](context.md).

### Training rhythm dashboard

Workouts Home puts the title and calendar button in one row above the past seven local dates ending today. Each date shows its weekday, day number and a circular purple mark when it contains completed workouts. The outline identifies today. Empty dates remain visible without invented sessions.

Home contains one Start action or a compact active-workout card with Continue, the latest completed workout with its date and logged metrics, a View history action and a Templates button. Standard fresh, returning and active states fit a 375 × 667 viewport above the fixed navigation. Larger text, long names and notices may scroll naturally; content is never clipped to enforce the compact layout. The duplicate Settings footer is omitted on Home, while save status remains announced.

The calendar button opens a monthly sheet; tapping a rhythm date opens its month with that date selected and focused. The month starts Monday. Future dates and next-month navigation beyond the current month are disabled. A selected date lists every completed workout from that date. Selecting a workout closes the calendar before opening its existing review, which offers Repeat workout and Save as template. Closing the review returns focus to the calendar action. Date controls have native button semantics, full date and workout-count labels, and at least 44px targets. Narrow grids scroll within their own container.

History is a separate searchable view with Back to workouts. It shows compact review rows with date, exercise summary and logged metrics; the review owns repeat and save-template actions. Templates opens a sheet. Browsing and editing share the existing template sheet, with focus moving to the name field on edit and back to the template action on save or cancel. Browser Back preserves a dirty editor and asks before discarding. The shell retains offline status.

## Product design workspace

[Histoire stories](../apps/design-system/src/stories) form the living product design workspace. **04 Pages** is the entry point for reviewing complete implemented screens; **05 Flows** connects screens into real workout journeys. **00 Start here**, **01 Foundations**, **02 Components** and **03 Patterns** provide context and reusable details. **06 Explorations** holds clearly labeled proposals, separate from implemented behavior. Run root `pnpm dev:ui` to browse them.

Page variants must open directly in their named state and include the production shell, navigation and dialogs. Reuse the actual application renderer and styles; changes to a production page must appear in its preview. Each example starts with repeatable, isolated sample data and offers Reset example in the Controls panel. The reset control sits outside the product viewport. Phone and desktop presets apply to the complete screen, including fixed navigation and overlays.

Flows start from a useful prerequisite and let designers perform the real actions. They must not pre-seed the advertised outcome or replace production transitions with story-only feedback. Explain sample-data and capability limits in the story documentation: changes last only until reset or reload, and previews do not establish browser persistence, offline use or installation. The [preview workflow](workflows.md#add-a-product-page-state-or-flow) owns the authoring steps.

Both the explorer and workout app consume public `@form/ui` styles and the shared workout theme. The app-owned preview is embedded as a separate document to preserve its layout and style ownership.

Explain what a component means and when to use it before implementation names or token values. Document Usage, Variants, States, Behavior, and Examples and limitations. Show real keyboard and focus behavior. Pattern stories use isolated local state and must not imply real persistence. Spacing examples are reference values, not additional global tokens. The [UI package guide](../packages/ui/README.md) owns detailed component API contracts.

Component names follow the [naming contract](workflows.md#component-names), also available in **00 Start here / Component naming**. Shared component story titles and filenames match their `Base`-prefixed public exports.

## Enforced token policy

Literal CSS colors belong in `packages/ui/src/tokens.css`, including generic overlay and shadow colors. All other CSS files and Vue style blocks use semantic variables; raw hex values, color functions, and named colors are rejected. Vue class bindings reject literal Tailwind palette classes and raw color values in class/style/fill/stroke/color attributes. Dynamic values assembled outside these expressions still require review; these checks are not a CSS data-flow analyzer. Status colors receive no palette exception. CSS imports also follow the workspace dependency policy.

`pnpm lint:vue` (also included in `pnpm verify` and the pre-commit hook) enforces the policy across both applications and the UI package:

- `@shadcn/lint` rejects raw Tailwind colors and arbitrary Tailwind values in supported Vue class expressions and TypeScript class helpers. Use named utilities or existing CSS variables, such as `bg-(--ui-primary)`, instead of `bg-red-500` or `rounded-[13px]`.
- `design/token-references` rejects unknown static `var(--name)` references and Tailwind variable shorthand in CSS declarations, Vue attributes and script strings, and TypeScript strings. Shared names come directly from the UI package's token and component stylesheets; stylesheet-local declarations are also accepted. For example, `var(--ui-primray)` fails instead of silently losing its color.
- The existing CSS rules continue to reject literal colors outside the token source, including Vue style blocks. A CSS variable does not exempt its raw color definition from that rule.

The root `components.json` points the Tailwind linter at the workout stylesheet and UI source directory. It is lint discovery configuration, not a second palette. Histoire continues to consume the same shared CSS tokens.

The article's `no-restyle` and `no-unknown-classes` rules are not enabled: the current component contract permits app-owned CSS through `BaseButton unstyled`, and the explorer has separately loaded CSS classes. These need component-specific contracts and stylesheet discovery before those rules can be applied without false positives. Named CSS classes and inline dimensions are not restricted by the Tailwind arbitrary-value rule. Spacing and typography in foundations remain guidance, not a finite enforced token scale. Static reference checks do not resolve dynamic variable names, CSS scope or runtime values; new tokens and local aliases still need design review.


### Exercise imagery

The **06 Explorations / Exercise imagery** story previews 46 generated equipment illustrations in a gallery and a searchable picker. The artwork uses transparent backgrounds, charcoal materials and silver edge highlights, with the existing semantic surface behind it. Text labels remain essential because equipment does not uniquely identify a movement; these images do not teach exercise technique. Images are decorative when paired with the exercise name.

The production exercise catalog and exercise picker use 77 illustrations for explicitly matched built-in exercises and compatible equipment variants, covering all 82 built-in exercises. Bodyweight floor exercises use mat illustrations; these are equipment cues rather than movement demonstrations. Custom exercises, unmatched definitions and failed image loads use a decorative dumbbell fallback. Names and equipment must match as well as the catalog ID; artwork is presentation metadata and is not persisted in workout data or backups.

The workout feature owns its production asset copies and mapping in `ui/assets/exercises` and `ui/exerciseArtwork.ts`. Histoire retains its independent review assets and generation prompts in `src/assets/exercises`, avoiding imports between applications. Production imports use transparent WebP thumbnails sized for the 64px image slots at up to 3× pixel density. All thumbnails are emitted as separate files and precached for offline use; they are not embedded in startup JavaScript. PNG originals remain available for regeneration but are not imported into the production app. See the [exercise image workflow](exercise-images.md) for conversion and delivery rules.

### Explorer review environment

The explorer uses an iframe per preview so viewport presets exercise actual media queries and portaled overlays. Presets cover narrow, short and tall phones, desktop, both sides of 640px and 768px, and the Sheet transition at 650/651px. The explorer shell starts dark; shared UI tokens remain the source of component colors.

`apps/design-system/src/StoryPreview.vue` provides common surface, padding and typography through Histoire's setup wrapper. A full-screen story or variant can opt out with `:meta="{ wrapper: false }"` and own its layout. Inner story containers own only their composition. Background presets are intentionally not introduced while the product uses one dark surface.

Use Controls for long labels, disabled fields, wide sheets and long overlay content. Numeric Input includes decimal, empty, invalid and disabled examples. The Events panel records component updates and explicitly illustrative actions; draft typing and cancellation must not look like confirmed values. Copyable Numeric Input, Sheet and Dialog sources include consumer wiring. Pattern examples remain disconnected from workout storage.

For manual overlay review, use Phone · short and Desktop: open, Tab and Shift+Tab, scroll long content, dismiss with Escape, and inspect the returned focus. In Sheet, open the numeric editor and dismiss it before dismissing the sheet. These are interactive review steps, not automated tests.

### Muscle map component preview

**02 Components / BaseMuscleMap** previews a reusable `@form/ui` component with original schematic front/back artwork, purple primary/supporting highlights and a visible muscle list. Consumers provide semantic muscle roles and own surrounding cards, headings and layout. Selection uses native text buttons with keyboard focus and changes only the outline; anatomy shapes are decorative rather than small touch targets. Both views appear by default, with front-only and back-only options whose text lists follow the visible regions. The [UI package guide](../packages/ui/README.md#muscle-map) owns the data, naming and selection API. Examples use local sample data only; production exercise mapping, workout coverage and recovery calculations are not integrated.
## Active exercise options

Every workout exercise, including completed entries, exposes an options button. Its sheet shows set count, target reps, and weight, with “Mixed” for varied targets. Options include Edit sets, Add or Edit note, Replace exercise, Remove exercise, and Add exercises. Focused editors use the same sheet. Changed note and configuration forms ask before discarding input.

Replacement previews the remaining set count, preserved logged work, and reset to 0 kg before saving. Fully logged entries direct users to Add exercises. Notes are plain text and appear on the active card and completed workout details. Removal confirms the logged-set count and deletion of unsaved input. Storage and revision errors retain the editor's input; Reload saved values explicitly abandons that local input and refreshes the revision.

### Workouts home explorations

**06 Explorations / Workouts — next version** compares three unapproved home-screen directions: Focus (one filled session card), Journal (open typography-led composition), and Compact (denser rows and segmented library navigation). Compare directions shows identical content in three phone frames; individual variants support viewport presets. Controls switches between an active workout with empty history and a fictional returning journal, with an optional recovery-message proposal. Library buttons switch local content; other actions show explicit preview feedback. These studies do not change production behavior or persist data.

### Calendar dashboard explorations

**06 Explorations / Calendar dashboard** adds three unapproved compositions based on the original workoutTracker calendar: a compact current-week strip with a monthly sheet, a month-first dashboard with inline day details, and a rolling fourteen-day training view. The examples use a fixed 5 October 2026 clock and fictional completed sessions consistent with their history lists. Today, selected dates and completed-workout markers have distinct treatments. Month navigation, day selection, sheet dismissal and an empty-data toggle are interactive; workout actions remain explicit preview feedback. The study explores history, not scheduling or streak rewards, and does not change the production calendar or workout rules.
