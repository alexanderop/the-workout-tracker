# Project instructions

## Read first

Start with [README.md](README.md) for the product overview and run commands. Read the documents relevant to the change:

| Question | Read |
| --- | --- |
| Which words do we use for workout concepts? | [Glossary](docs/glossary.md) |
| What are the workout rules and state transitions? | [Domain context](docs/context.md) |
| Which module owns this behavior or dependency? | [Architecture](docs/architecture.md) |
| How should the interface look and behave? | [Design](docs/design.md) |
| How do I add a command, component, or storage change? | [Development workflows](docs/workflows.md) |
| What does each test or check prove, and what does it not claim? | [Verification](docs/verification.md) |
| Which references informed our choices? | [Prior art](docs/prior-art.md) |
| Why did an earlier implementation take this approach? | [History](docs/history/README.md) |

Current contracts live in the glossary, context, architecture, and design. Historical plans and findings are evidence, not current instructions. Use the [glossary](docs/glossary.md) terms consistently; it records where existing code names differ from product language.

When the user says we are not speaking the same language, or terminology causes confusion while working, consult the glossary and suggest a concrete new entry or clearer definition with an example of the intended meaning. Keep suggestions focused on the misunderstanding. Agree on the meaning with the user before updating the glossary; do not silently redefine a term.

When changing terminology, behavior, ownership, or a workflow, update its authoritative document in the same change. Link to that document instead of duplicating its detail here. If documentation and code disagree, inspect the implementation and resolve the discrepancy explicitly; do not silently treat a past plan as implemented behavior.

## Paper design workspace

For visual design tasks only, use the Paper file described in [Design › Paper design workspace](docs/design.md#paper-design-workspace). Code-only tasks do not need Paper.

## Priorities

Write clear, maintainable production code. Keep changes focused and dependencies proportional to the problem. Follow the existing Vue, TypeScript and pnpm conventions.

- Maintain behavior tests at the smallest layer that can expose a failure. Follow [Testing](docs/workflows.md#testing) for pure unit tests, injected dependencies, browser storage tests, and seeded application journeys.
- Use strict types, small cohesive modules and explicit dependencies.
- Preserve workspace exports, feature boundaries and layer direction.
- Validate external data at boundaries and handle failures explicitly.
- Preserve accessible native semantics, keyboard navigation and focus management.
- For new reusable UI components, follow the [Histoire-first component workflow](docs/workflows.md#add-a-reusable-component-and-story): iterate in the explorer, then inspect the real app flow when integrating.
- Deliver changes directly on `main` or merge the working branch into `main`; no pull request is required. Follow [Verification and delivery](docs/workflows.md#verification-and-delivery).
- Clean up subscriptions, event listeners and owned resources.
- Use `pnpm verify` for type checking and linting only. Do not add tests, formatting checks or production builds to this verification command. Linting includes the architecture and workspace-boundary checks. Build only when needed to run or deploy the application.
- Never weaken a guardrail to make a change pass: do not edit lint configs, `tooling/`, hooks, CI, budgets, baselines or coverage thresholds to loosen them. Fix the code, or stop and ask the owner.

## Enforced correction rules

| Rule | Enforcement |
| --- | --- |
| No silenced checks: no `eslint-disable`, `oxlint-disable` or `@ts-*` comments, no skipped or focused tests. | `pnpm lint:guards` ([tooling/lint/no-suppressions.mjs](tooling/lint/no-suppressions.mjs)), run by `pnpm verify`. |
| No non-null assertions (`value!`) in source or Vue templates. | Oxlint `typescript/no-non-null-assertion`, ESLint for Vue scripts, and `pnpm lint:guards` for templates. |
| File-size baseline, performance budgets and coverage thresholds only tighten. | [tooling/lint/ratchet.mjs](tooling/lint/ratchet.mjs) in the pre-commit hook and CI. See [Quality limits only tighten](docs/workflows.md#quality-limits-only-tighten). |
| Unit tests pass with coverage at or above the thresholds. | `pnpm test:unit` in the pre-push hook and CI. |
| Finish actions preserve unsaved workout names and numeric input, including drafts arriving from another tab. | [Workspace command boundary](apps/workout/src/features/workouts/ui/useWorkoutWorkspace.ts), training journal checks, and [workspace finish regressions](apps/workout/test/unit/workspace-finish.test.ts), run by `pnpm test:unit` locally and in CI. See [ownership](docs/architecture.md#active-workout-integration). |

## Commands

- `pnpm dev`: run the workout app.
- `pnpm dev:ui`: run the Histoire component explorer.
- `pnpm verify`: type checking and linting only (includes architecture, boundary and dead-code checks).

See [README.md](README.md) for installation, preview, and deployment commands. Run only the checks appropriate to the change; documentation-only edits need link, path, and consistency review.
