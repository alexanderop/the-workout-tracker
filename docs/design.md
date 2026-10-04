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

Inter Variable is bundled locally for offline use. Lucide icons use a consistent light stroke. Content has a restrained type hierarchy, compact desktop navigation and generous space around workout controls. Mobile uses a persistent three-item bottom menu, large number inputs and a compact rest timer. Dialogs use Reka focus trapping and explicitly return focus to their opener.

The interface uses a quiet visual hierarchy; empty states show actual data rather than fabricated statistics. [Prior art](prior-art.md) records the original reference and adaptations.

## Button ownership

Icon-only actions use the shared `IconButton`: a required accessible label, decorative icon, centered content and a minimum 44px square touch target at every viewport size. Circle and square surfaces share this geometry. Application classes position these controls without resetting their internals.

Standard buttons retain the UI package's variant and size styling. Existing custom cards, rows and text actions explicitly use `Button unstyled` with an app-owned layout class. Global resets must exclude shared buttons; removing their flex layout is what previously displaced the settings icon. Histoire's Icon Button story owns the isolated interaction examples.

Desktop sidebar footer actions use left-aligned labels with a shared icon column. Wrapped labels stay aligned with their first line; the local-storage note uses the same icon and label offsets.

## Workout-first screens

The main page groups history and templates under Workouts. A fresh journal has one prominent start action. The exercise picker supports search, filters, and multiple selection. The active workout shows named exercise controls above a focused set table. Selected and completed states use the existing purple token, text, and icons. The bottom training control refers to the same exercise as the visible table.

For a fresh journal, the welcome card owns the only start action. Its copy wraps naturally and its height follows its content. Mobile uses a compact mark and a full-width action; the page header omits repeated introductory copy. Returning journals keep the header action. The mobile navigation divides the available width equally among its rendered links, without unused columns.

Closing an exercise panel preserves its input drafts. Finishing requires pending edits to be resolved. Converting a workout to a template opens an editor so the user can remove skipped sets and adjust targets before saving. Domain meanings belong in [context](context.md).

## Component explorer

[Histoire stories](../apps/design-system/src/stories) show foundations, components, and illustrative application patterns. Run `pnpm dev:ui` to browse them. Both the explorer and workout app consume public `@form/ui` styles and the shared workout theme.

Explain what a component means and when to use it before implementation names or token values. Document Usage, Variants, States, Behavior, and Examples and limitations. Show real keyboard and focus behavior. Pattern stories use isolated local state and must not imply real persistence. Spacing examples are reference values, not additional global tokens. The [UI package guide](../packages/ui/README.md) owns detailed component API contracts.

## Enforced color policy

Literal CSS colors belong in `packages/ui/src/tokens.css`, including generic overlay and shadow colors. All other CSS files and Vue style blocks use semantic variables; raw hex values, color functions, and named colors are rejected. Vue class bindings reject literal Tailwind palette classes and raw color values in class/style/fill/stroke/color attributes. Dynamic values assembled outside these expressions still require review; these checks are not a CSS data-flow analyzer. Status colors receive no palette exception. CSS imports also follow the workspace dependency policy.

### Exercise imagery

The **03 Patterns / Exercise imagery** story previews six generated equipment illustrations in a gallery and a searchable picker. The artwork uses transparent backgrounds, charcoal materials and silver edge highlights, with the existing semantic surface behind it. Text labels remain essential because equipment does not uniquely identify a movement; these images do not teach exercise technique. Images are decorative when paired with the exercise name.

The exercise catalog, exercise picker and active exercise header use these illustrations for explicitly matched built-in exercises and compatible equipment variants. Custom exercises, unmatched definitions and failed image loads use a decorative dumbbell fallback. Names and equipment must match as well as the catalog ID; artwork is presentation metadata and is not persisted in workout data or backups.

The workout feature owns its production asset copies and mapping in `ui/assets/exercises` and `ui/exerciseArtwork.ts`. Histoire retains its independent review assets and generation prompts in `src/assets/exercises`, avoiding imports between applications. Imported PNGs are included in the existing offline precache.

### Explorer review environment

The explorer uses an iframe per preview so viewport presets exercise actual media queries and portaled overlays. Presets cover narrow, short and tall phones, desktop, both sides of 640px and 768px, and the Sheet transition at 650/651px. The explorer shell starts dark; shared UI tokens remain the source of component colors.

`apps/design-system/src/StoryPreview.vue` provides common surface, padding and typography through Histoire's setup wrapper. A full-screen story or variant can opt out with `:meta="{ wrapper: false }"` and own its layout. Inner story containers own only their composition. Background presets are intentionally not introduced while the product uses one dark surface.

Use Controls for long labels, disabled fields, wide sheets and long overlay content. Numeric Input includes decimal, empty, invalid and disabled examples. The Events panel records component updates and explicitly illustrative actions; draft typing and cancellation must not look like confirmed values. Copyable Numeric Input, Sheet and Dialog sources include consumer wiring. Pattern examples remain disconnected from workout storage.

For manual overlay review, use Phone · short and Desktop: open, Tab and Shift+Tab, scroll long content, dismiss with Escape, and inspect the returned focus. In Sheet, open the numeric editor and dismiss it before dismissing the sheet. These are interactive review steps, not automated tests.
