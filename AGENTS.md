# Project instructions

## Priorities

Write clear, maintainable production code. Keep changes focused and dependencies proportional to the problem. Follow the existing Vue, TypeScript and pnpm conventions.

- Do not add, maintain or run automated tests, test infrastructure or testing strategies unless the user explicitly requests them.
- Use strict types, small cohesive modules and explicit dependencies.
- Preserve workspace exports, feature boundaries and layer direction.
- Validate external data at boundaries and handle failures explicitly.
- Preserve accessible native semantics, keyboard navigation and focus management.
- Clean up subscriptions, event listeners and owned resources.
- Use `pnpm verify` for type checking and linting only. Do not add tests, formatting checks, standalone architecture checks or production builds to this verification command. Build only when needed to run or deploy the application.
