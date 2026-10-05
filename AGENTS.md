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
| Which references informed our choices? | [Prior art](docs/prior-art.md) |
| Why did an earlier implementation take this approach? | [History](docs/history/README.md) |

Current contracts live in the glossary, context, architecture, and design. Historical plans and findings are evidence, not current instructions. Use the [glossary](docs/glossary.md) terms consistently; it records where existing code names differ from product language.

When the user says we are not speaking the same language, or terminology causes confusion while working, consult the glossary and suggest a concrete new entry or clearer definition with an example of the intended meaning. Keep suggestions focused on the misunderstanding. Agree on the meaning with the user before updating the glossary; do not silently redefine a term.

When changing terminology, behavior, ownership, or a workflow, update its authoritative document in the same change. Link to that document instead of duplicating its detail here. If documentation and code disagree, inspect the implementation and resolve the discrepancy explicitly; do not silently treat a past plan as implemented behavior.

## Paper design workspace

The project has a Paper file named **The Workout Tracker — Product design**:
[Open the project guide](https://app.paper.design/file/01M440C3G4G4K1P2R5FBR3JPKW/p-2-0).
Use the Paper MCP tools with explicit file ID `01M440C3G4G4K1P2R5FBR3JPKW`; read the Paper guide and inspect the live file before editing. Do not assume the currently open file is this project.

| Page | Page ID |
| --- | --- |
| 00 — Start here | `p-2-0` |
| 01 — Foundations | `p-3-0` |
| 02 — UI catalog | `p-4-0` |
| 03 — Current app | `p-1-0` |
| 04 — Design explorations | `p-5-0` |
| 05 — User flows | `p-6-0` |

Paper contains visual references and proposals. The [design contract](docs/design.md), Vue components and Histoire remain authoritative for implemented behavior. Paper and code do not automatically synchronize. Token descriptions distinguish existing code palette values from Paper aliases and extracted design references; do not assume all Paper token names exist in app CSS. Copied UI examples are independent copies, not linked component instances.

Last confirmed setup, **2026-10-04**: desktop and mobile welcome screens, 88 tokens with provenance descriptions, the project guide and visual foundations were added. Paper's weekly MCP quota then interrupted setup. Recheck current access and saved content rather than assuming this blocker persists. UI catalog and exploration-page writes were not verified; the core mobile workout flow still needs adding. Inspect before creating duplicates, and recheck the foundations layout after its height adjustment.

The inspected flow is: start workout → select exercises → edit numeric draft → log set / rest → finish → review. Confirming a number is distinct from logging a set; only logged sets contribute to progress. See [domain context](docs/context.md) for the current rules. Detailed local handoff notes from setup are at `/Users/alexanderopalic/.codex/visualizations/2026/10/04/01a10807-6459-71b2-b754-9aa42cf4ec4b/paper-setup-handoff.html` (machine-local, not tracked in this repository).

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
- Use `pnpm verify` for type checking and linting only. Do not add tests, formatting checks, standalone architecture checks or production builds to this verification command. Build only when needed to run or deploy the application.

## Enforced correction rules

| Rule | Enforcement |
| --- | --- |
| Finish actions preserve unsaved workout names and numeric input, including drafts arriving from another tab. | [Workspace command boundary](apps/workout/src/features/workouts/ui/useWorkoutWorkspace.ts), training journal checks, and [workspace finish regressions](apps/workout/test/unit/workspace-finish.test.ts), run by `pnpm test:unit` locally and in CI. See [ownership](docs/architecture.md#active-workout-integration). |

## Commands

- `pnpm dev`: run the workout app.
- `pnpm dev:ui`: run the Histoire component explorer.
- `pnpm verify`: type checking and linting only.

See [README.md](README.md) for installation, preview, and deployment commands. Run only the checks appropriate to the change; documentation-only edits need link, path, and consistency review.
