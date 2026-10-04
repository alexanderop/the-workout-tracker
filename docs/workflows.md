# Development workflows

Read [AGENTS.md](../AGENTS.md) first. Use [context](context.md) for behavior, [architecture](architecture.md) for ownership, and [design](design.md) for interaction rules. Paths below are relative to the repository root.

## Add or change a workout command

1. Identify the domain transition in `apps/workout/src/features/workouts/domain.ts`. Extend the validated command model and pure reducer where the behavior belongs. Keep time and generated identities explicit.
2. Use `application.ts` for orchestration, revision handling, and explicit results. Keep database access behind `ports.ts`; the UI must not select adapters.
3. Expose only the necessary API through `index.ts` or `ui.ts`. Wire user actions through the feature UI and its existing shared controllers. Preserve one `useWorkoutWorkspace` instance across navigation.
4. Handle invalid input, unavailable storage, and conflicts without discarding visible user input. Update the domain context if product meaning changes and architecture if ownership changes.
5. Run `pnpm verify` for code changes. When interaction changes, inspect the affected flow in the running app, including keyboard use and focus where relevant. Report what was actually checked.

## Add or change a route

Routing belongs to the workout application. Add a PascalCase `*Route.vue` adapter under `apps/workout/src/pages`, with an explicit lowercase `path` and named route in `definePage`. Import feature UI through its public entry point and use `useWorkoutRouteContext` for the persistent workspace. Keep router imports out of feature components. Use generated route names for navigation. The fallback uses the file-routing convention `[...pathMatch].vue`; keep that dynamic filename so the experimental generator ranks it after static routes.

Declare parsed query parameters in `definePage.params.query` and their Zod parsers in `src/app/route-params`. The experimental resolver exposes parsed query values through `route.params`; named navigation supplies them through `params`. Do not cast raw URL strings to domain values.

Run `pnpm --filter @form/workout routes:generate` after changing routes or parsers and include the generated `src/route-map.d.ts` in the change. This runs the configured Vite plugin without a build or listening server. Development and builds also generate the declarations. Committed declarations let a clean checkout run `pnpm verify` before starting Vite. Verification remains type checking and linting only.

Vue Router is pinned to 5.3.1. Its [experimental resolver](https://router.vuejs.org/experimental/router-resolver) is explicitly not production-ready upstream. Upgrades require reviewing that API and regenerating route declarations. Inspect deep links, malformed query defaults, navigation history, and dialog focus in the running app after routing changes.

## Add a reusable component and story

For work focused on a new reusable UI component, use Histoire as the first development feedback loop, then check the integrated component in the workout app. This is component-driven development: edit, inspect, interact, and refine in isolation before wiring the component into a real flow.

1. **Define the component contract.** Identify its purpose, props, slots, emitted events, and relevant states. Follow the contracts and attribution in [the UI package guide](../packages/ui/README.md). Preserve native semantics, accessible names, form behavior, keyboard interaction, and focus restoration.
2. **Create the production component and its story together.** Put the component in `packages/ui/src` and export it through `packages/ui/src/index.ts`. Add a `.story.vue` file under `apps/design-system/src/stories/components` that imports the public `@form/ui` export. The story renders the actual component; do not build a separate implementation to copy into the app later. Document Usage, Variants, States, Behavior, and Examples and limitations.
3. **Iterate in Histoire.** Run `pnpm dev:ui` and open http://127.0.0.1:4186. Use controls and variants to exercise relevant states, such as empty, filled, disabled, invalid, or loading, and edge cases such as long labels. Use isolated local state to make emitted events and value changes observable. Inspect the rendered result at narrow and wide widths, interact with it using pointer and keyboard, and check focus behavior. Edit the component or story and repeat until the intended appearance and interactions work. Reading source or starting the server alone does not complete this loop.
4. **Integrate the same component.** When app integration is part of the task, import it from `@form/ui` in the workout feature and connect real props and events through existing controllers. Keep workout rules and persistence in their owning modules. For a component-library-only task, stop after the isolated review and code checks; do not invent an app use case.
5. **Check the real app flow.** Run `pnpm dev` and open http://127.0.0.1:4180. Exercise the affected user action in its actual page or dialog. Check surrounding layout, mobile sizing, keyboard navigation, focus, and real state updates; inspect saving or reload behavior when the change affects persistence. Histoire cannot establish that app wiring works. If integration exposes a reusable component issue, fix it and repeat the relevant Histoire and app checks.
6. **Verify and report evidence.** Run `pnpm verify` after code changes for type checking and linting. Report which story states and app interactions were actually inspected, and any checks that could not be completed. These are interactive browser checks; this workflow does not add or run automated tests.

Keep workout-specific components in `apps/workout/src/features/workouts/ui` and inspect them in the app; do not move domain behavior into `@form/ui` to make it available in Histoire. Where useful, extract a genuinely reusable presentation component and apply the loop above to it. Consumers use public exports, never relative imports into another workspace.

Illustrative compositions belong in `stories/patterns`, and foundations in `stories/foundations`. Pattern stories use isolated demo state and must describe their limitations; sample feedback must not imply a real save.

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

Changes may be committed directly on `main` or merged from a working branch into `main` after the appropriate checks. A pull request is not required; do not create one unless the user explicitly asks for it.

Husky installs the Git hooks through the root `prepare` script when you run `pnpm install`. Before each commit, `.husky/pre-commit` runs `pnpm verify` across the workspace and blocks the commit if type checking or linting fails. The checks read the current working tree, including unstaged changes. Run `pnpm prepare` to reinstall the hooks in an existing checkout.

`pnpm verify` runs only type checking and linting. Do not add, maintain, or run automated tests, test infrastructure, or testing strategies unless the user explicitly requests them. Standalone architecture and workspace checks are optional and remain outside verification. Build only when needed to run or deploy the application; offline and installation behavior require the production preview described in [README.md](../README.md).

For documentation-only changes, check links, referenced paths, command names, and consistency with the implementation. Report edits, checks, commits, pushes, and deployment separately; completing one does not establish the others.

## Lint and TypeScript policy

`pnpm verify` runs type checking and linting only. `typecheck:native` uses the stable Go-based TypeScript 7.0.2 compiler (`@typescript/native`, an npm alias) on the domain, application, adapters, typed UI controllers, and numeric editing modules listed in `tsconfig.native.json`. Each workspace also runs `vue-tsc` over its complete application and Vue templates. TypeScript 6 remains a compatibility dependency for `vue-tsc`, the ESLint parser, and the architecture policy's compiler API; replacing that API with TypeScript 7 is not supported by these tools. TypeScript 8 is not published; the registry's development line was 7.1 when this setup was adopted.

Oxlint owns JavaScript/TypeScript rules, supported Vue script rules, and custom architectural rules. Type-aware Oxlint uses `oxlint-tsgolint` for unhandled/misused promises and exhaustive switches in TypeScript; do not assume this provides type-aware checking of Vue templates. ESLint owns the remaining Vue template rules and CSS policy, and applies the same promise/exhaustive-switch checks to typed Vue script blocks using its project service. `eslint-plugin-oxlint` disables rules already handled by Oxlint; only the three type-aware checks are explicitly restored for Vue files.

- Use literal unions instead of enums, avoid explicit `any`, and avoid type assertions other than `as const`.
- Use early returns or loop continuation instead of JavaScript `else`/`else if`; Vue `v-else` remains valid template structure. Avoid nested ternaries.
- Cover every union case explicitly in a `switch`. A default branch does not count as coverage. Exhaustive union switches do not need a redundant default.
- Keep modified cyclomatic complexity at most 10. This counts a switch as one branch so explicit exhaustive dispatch does not punish adding named domain commands; nested conditions and logical operators still count.
- Destructure `defineProps` using Vue 3.5 reactive destructuring and inline defaults. Wrap reactive reads in getters when passing them to watchers. Reka wrappers may forward the reactive rest-props object.
- Use `useTemplateRef` for template references. Document-level element queries are forbidden in components; a query scoped to an owned template reference is permitted.
- Declare slots explicitly, remove unused props/refs/emits, use PascalCase component references and kebab-case custom events/attributes. Vue's `update:*` model events retain their framework spelling. Existing generic UI primitives may have single-word names; Histoire story filenames are exempt from the multi-word naming rule.
- Keep template nesting at most eight levels. A `use*.ts` module must call an imported Vue/VueUse API or another imported composable. This is a structural check, not a proof of lifecycle correctness.
- Product logging permits `console.warn` and `console.error`, not debug logging.

Run `pnpm lint:oxlint` or `pnpm lint:vue` for focused feedback. Both stages reject warnings. No automated tests, standalone architecture commands, formatting checks, or builds are added to verification.

## Maintain context

Update the document that owns the changed rule in the same change. Keep the README and agent guide as entry points. Historical records should say what was decided or observed, identify relevant limitations, and link to the current contract. Move superseded plans into `docs/history` only after extracting any still-current rules. Add prior art when it explains an actual choice, including what was adapted or left out.
