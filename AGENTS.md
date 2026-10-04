# Project instructions

## Read first

Start with [README.md](README.md) for the product overview and run commands. Read the documents relevant to the change:

| Question | Read |
| --- | --- |
| What do workout terms and state transitions mean? | [Domain context](docs/context.md) |
| Which module owns this behavior or dependency? | [Architecture](docs/architecture.md) |
| How should the interface look and behave? | [Design](docs/design.md) |
| How do I add a command, component, or storage change? | [Development workflows](docs/workflows.md) |
| Which references informed our choices? | [Prior art](docs/prior-art.md) |
| Why did an earlier implementation take this approach? | [History](docs/history/README.md) |

Current contracts live in context, architecture, and design. Historical plans and findings are evidence, not current instructions. Use the domain terms consistently; the glossary records where existing code names differ from product language.

When changing terminology, behavior, ownership, or a workflow, update its authoritative document in the same change. Link to that document instead of duplicating its detail here. If documentation and code disagree, inspect the implementation and resolve the discrepancy explicitly; do not silently treat a past plan as implemented behavior.

## Priorities

Write clear, maintainable production code. Keep changes focused and dependencies proportional to the problem. Follow the existing Vue, TypeScript and pnpm conventions.

- Do not add, maintain or run automated tests, test infrastructure or testing strategies unless the user explicitly requests them.
- Use strict types, small cohesive modules and explicit dependencies.
- Preserve workspace exports, feature boundaries and layer direction.
- Validate external data at boundaries and handle failures explicitly.
- Preserve accessible native semantics, keyboard navigation and focus management.
- For new reusable UI components, follow the [Histoire-first component workflow](docs/workflows.md#add-a-reusable-component-and-story): iterate in the explorer, then inspect the real app flow when integrating.
- Deliver changes directly on `main` or merge the working branch into `main`; no pull request is required. Follow [Verification and delivery](docs/workflows.md#verification-and-delivery).
- Clean up subscriptions, event listeners and owned resources.
- Use `pnpm verify` for type checking and linting only. Do not add tests, formatting checks, standalone architecture checks or production builds to this verification command. Build only when needed to run or deploy the application.

## Commands

- `pnpm dev`: run the workout app.
- `pnpm dev:ui`: run the Histoire component explorer.
- `pnpm verify`: type checking and linting only.

See [README.md](README.md) for installation, preview, and deployment commands. Run only the checks appropriate to the change; documentation-only edits need link, path, and consistency review.
