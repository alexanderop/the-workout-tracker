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
