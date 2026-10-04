# Development workflows

Read [AGENTS.md](../AGENTS.md) first. Use [context](context.md) for behavior, [architecture](architecture.md) for ownership, and [design](design.md) for interaction rules. Paths below are relative to the repository root.

## Add or change a workout command

1. Identify the domain transition in `apps/workout/src/features/workouts/domain.ts`. Extend the validated command model and pure reducer where the behavior belongs. Keep time and generated identities explicit.
2. Use `application.ts` for orchestration, revision handling, and explicit results. Keep database access behind `ports.ts`; the UI must not select adapters.
3. Expose only the necessary API through `index.ts` or `ui.ts`. Wire user actions through the feature UI and its existing shared controllers. Preserve one `useWorkoutWorkspace` instance across navigation.
4. Handle invalid input, unavailable storage, and conflicts without discarding visible user input. Update the domain context if product meaning changes and architecture if ownership changes.
5. Run `pnpm verify` for code changes. When interaction changes, inspect the affected flow in the running app, including keyboard use and focus where relevant. Report what was actually checked.

## Add a reusable component and story

1. Put generic components in `packages/ui/src`; keep workout-specific components in `apps/workout/src/features/workouts/ui`. A generic component cannot depend on workout models or persistence.
2. Export the component through `packages/ui/src/index.ts`. Consumers use public `@form/ui` exports, never relative imports into another workspace.
3. Follow the component contracts and attribution in [the UI package guide](../packages/ui/README.md). Preserve native semantics, accessible names, form behavior, keyboard interaction, and focus restoration.
4. Add a story under `apps/design-system/src/stories/components`, or an illustrative composition under `stories/patterns`. Foundations belong in `stories/foundations`. Cover Usage, Variants, States, Behavior, and Examples and limitations.
5. Run `pnpm dev:ui` to inspect the component. Pattern stories use isolated demo state and must describe their limitations; sample feedback must not imply a real save. Run `pnpm verify` after code changes.

## Change storage or backups

1. Inspect `domain.ts`, `ports.ts`, `application.ts`, and the relevant adapter together. Validate external values at the boundary before they become domain state.
2. Preserve atomic comparison and save, explicit conflict results, and ownership of connections and subscriptions. The composition root in `apps/workout/src/app/composition.ts` supplies concrete browser capabilities.
3. Treat confirmed IndexedDB data and the browser draft journal as separate resources. Draft acknowledgement must not erase a newer edit; unreadable confirmed data must remain available for recovery export.
4. Decide format and compatibility behavior explicitly when changing persisted data. The current lack of a legacy migration is an existing limitation, not permission to discard future user data.
5. Update the storage contract and domain context with any changed guarantees. Run `pnpm verify` for code changes and inspect the affected save, recovery, or import flow as appropriate. Distinguish observed behavior from unverified expectations.

## Change design tokens or styles

Palette values and generic tokens live in `packages/ui/src/tokens.css`; the workout mapping lives in `packages/ui/src/workout-theme.css`. Generic component CSS lives in `packages/ui/src/styles.css`. App layout belongs in `apps/workout/src/style.css`, and explorer presentation belongs in `apps/design-system/src/preview.css`.

Update foundations stories and [design](design.md) when a design rule changes. Inspect both consumers when changing shared styling. Keep examples of spacing or layout from becoming a second source of token values.

## Verification and delivery

Husky installs the Git hooks through the root `prepare` script when you run `pnpm install`. Before each commit, `.husky/pre-commit` runs `pnpm verify` across the workspace and blocks the commit if type checking or linting fails. The checks read the current working tree, including unstaged changes. Run `pnpm prepare` to reinstall the hooks in an existing checkout.

`pnpm verify` runs only type checking and linting. Do not add, maintain, or run automated tests, test infrastructure, or testing strategies unless the user explicitly requests them. Standalone architecture and workspace checks are optional and remain outside verification. Build only when needed to run or deploy the application; offline and installation behavior require the production preview described in [README.md](../README.md).

For documentation-only changes, check links, referenced paths, command names, and consistency with the implementation. Report edits, checks, commits, pushes, and deployment separately; completing one does not establish the others.

## Maintain context

Update the document that owns the changed rule in the same change. Keep the README and agent guide as entry points. Historical records should say what was decided or observed, identify relevant limitations, and link to the current contract. Move superseded plans into `docs/history` only after extracting any still-current rules. Add prior art when it explains an actual choice, including what was adapted or left out.
