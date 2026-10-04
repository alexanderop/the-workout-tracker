# Prior art and adopted ideas

This document records influences and deliberate adaptations. Current requirements live in [context](context.md), [architecture](architecture.md), and [design](design.md); references do not override those contracts.

## Psychopomp: documentation responsibilities

[Psychopomp](https://github.com/kitlangton/psychopomp/tree/46fd612) separates agent working rules, domain language, module ownership, workflows, references, and historical evidence. Its agent guide routes readers to the relevant document and asks that changes update the current contracts.

We adopt that separation, using the existing `docs/` directory rather than moving every reference document to the root. Our domain glossary describes workouts and persistence. Our workflows describe Vue components and workout commands. Psychopomp's Rust commands, rendering rules, and automated testing requirements do not apply here.

## shadcn-vue: component contracts

The UI package uses the pinned [shadcn-vue new-york-v4 reference](https://github.com/unovue/shadcn-vue/tree/b251d9fd92aa496495e127137a7734704fb34a29/apps/v4/registry/new-york-v4/ui) and neutral theme. We adapt native and Reka-based component semantics using explicit CSS imports and namespaced tokens. The package does not expose the upstream Tailwind variant API or require its CLI.

The exact delivered families, intentional differences, and remaining catalog are maintained in [packages/ui/README.md](../packages/ui/README.md). Preserve [third-party notices](../packages/ui/THIRD_PARTY_NOTICES.md) when changing adapted source.

## Workout design reference

The existing design documentation identifies the neighboring `workout-design-system` project as the original visual reference, with a quiet Linear-inspired hierarchy. The adopted direction is a restrained five-color palette, generous space around training controls, and real empty states. Shared palette values and Histoire stories now provide the implementation references within this repository; the neighboring project is not required to run the app.

## Workout-first redesign

The redesign chose canonical per-set template targets over retaining old summary fields alongside optional overrides. That decision keeps one representation for writers to maintain. The [historical record](history/workout-first.md) preserves the rationale and delivery context; [domain context](context.md) defines the current meaning of templates and completed workouts.

## Active workout app studies (2026-10-04)

The Histoire [Workout apps · research & designs](../apps/design-system/src/stories/patterns/WorkoutAppResearch.story.vue) story compares ten established apps: Strong, Hevy, Fitbod, JEFIT, StrongLifts, Boostcamp, Alpha Progression, Nike Training Club, Freeletics and Sweat. This is a relevant design sample, not a verified global popularity ranking. Each variant links its public evidence and distinguishes documented behavior from our interpretation. Older interface references are labeled; authenticated current app screens were not verified.

The explorations contrast set ledgers, exercise detail screens, large completion targets, program guidance and circuit players. They use our palette and isolated sample state. The comparison variants remain isolated proposals. The production workout now adopts the circle interaction described below; recommendation engines, effort models and circuit behavior remain outside its scope. The comparison page records the current design shortlist and review prompts.

The dedicated [StrongLifts interactive prototype](../apps/design-system/src/stories/patterns/StrongLiftsPrototype.story.vue) deepens the circle study with repeated-tap rep reduction, per-set corrections, exercise weight editing, real rest timing and incomplete-session review. Sources: [logging](https://support.stronglifts.com/article/63-log-workouts), [rest timer](https://support.stronglifts.com/article/39-timer), [weight editing](https://support.stronglifts.com/article/8-change-weight), and [official interface illustrations](https://stronglifts.com/app/). Public guidance specifies target reps on first tap, descending reps on later taps, blank versus zero, and default 3/5-minute success/failure rest. Our palette, explicit editing/clear controls, countdown display, application of weight to unlogged sets and manual finish are adaptations. The installed app was not inspected. No progression, notifications, background behavior or persistent workout saving is implemented in this study.

The StrongLifts study also explores our own session organization: beginning, mid-workout, all-completed and empty states, a sample exercise picker during training, and completed exercises collapsed below unfinished work. Clearing a logged set returns its exercise to the active list. Added exercises update the set totals. These are Form adaptations, not attributed StrongLifts behaviors. The production workout now adopts exercise-count-first entry, configurable set targets, adding exercises during training, and completed exercises below unfinished work. The last completed exercise stays in place until the user moves it or starts another exercise, allowing immediate rep corrections. Production uses the existing rest preference and persistent command/draft flows; see the [design contract](design.md) and [domain context](context.md).

In the configurable study, each exercise owns its set count and target reps. Configuration affects remaining work while retaining logged sets and their original targets. The initial 5 × 5 routine is a sample, not a constraint; newly added exercises open their settings with editable 3 × 8 sample values.
