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

## Workout-first screens

The main page groups history and templates under Workouts. A fresh journal has one prominent start action. The exercise picker supports search, filters, and multiple selection. The active workout shows named exercise controls above a focused set table. Selected and completed states use the existing purple token, text, and icons. The bottom training control refers to the same exercise as the visible table.

Closing an exercise panel preserves its input drafts. Finishing requires pending edits to be resolved. Converting a workout to a template opens an editor so the user can remove skipped sets and adjust targets before saving. Domain meanings belong in [context](context.md).

## Component explorer

[Histoire stories](../apps/design-system/src/stories) show foundations, components, and illustrative application patterns. Run `pnpm dev:ui` to browse them. Both the explorer and workout app consume public `@form/ui` styles and the shared workout theme.

Explain what a component means and when to use it before implementation names or token values. Document Usage, Variants, States, Behavior, and Examples and limitations. Show real keyboard and focus behavior. Pattern stories use isolated local state and must not imply real persistence. Spacing examples are reference values, not additional global tokens. The [UI package guide](../packages/ui/README.md) owns detailed component API contracts.
