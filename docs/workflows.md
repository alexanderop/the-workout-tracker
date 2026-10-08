# Development workflows

Read [AGENTS.md](../AGENTS.md) first. Use [context](context.md) for behavior, [architecture](architecture.md) for ownership, and [design](design.md) for interaction rules. Paths below are relative to the repository root.

## Explicit AOP workflows

When AOP is explicitly requested, use the project [model configuration](../.aop-mode/models.md). It assigns implementation, review and panel models and keeps reasoning effort separate from model identifiers. Check availability against the current host; report substitutions and unmet model-family requirements. The configuration does not activate AOP automatically.

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
5. **Check the real app flow.** Run `pnpm dev` and open http://127.0.0.1:4180. Exercise the affected user action in its actual page or dialog. Check surrounding layout, mobile sizing, keyboard navigation, focus, and real state updates; inspect saving or reload behavior when the change affects persistence. Product page and flow previews exercise the production shell and wiring with in-memory data. Use the real app to establish browser persistence, reload recovery, PWA and installation behavior. If integration exposes a reusable component issue, fix it and repeat the relevant Histoire and app checks.
6. **Verify and report evidence.** Run `pnpm verify` after code changes for type checking and linting. Report which story states and app interactions were actually inspected, and any checks that could not be completed. These are interactive browser checks; this workflow does not add or run automated tests.

Keep workout-specific components in `apps/workout/src/features/workouts/ui` and inspect them through the product page previews and the app; do not move domain behavior into `@form/ui` to make it available in Histoire. Where useful, extract a genuinely reusable presentation component and apply the loop above to it. Consumers use public exports, never relative imports into another workspace.

Illustrative compositions belong in `stories/patterns`, and foundations in `stories/foundations`. Pattern stories use isolated demo state and must describe their limitations; sample feedback must not imply a real save.

## Add a product page state or flow

1. **Choose the catalog section.** Put complete implemented screens in `apps/design-system/src/stories/pages`, connected journeys in `stories/flows`, and proposals in `stories/explorations`. Keep isolated illustrative compositions in `stories/patterns`. Start with the designer's task and a recognizable state name, such as Exercises / No results.
2. **Define the example in the owning app.** Add its ID, title and description to `apps/workout/src/preview/catalog.json` and its setup to `apps/workout/src/preview/scenarios.ts`. Build valid sample snapshots and give each mount fresh memory state. Use narrow initialization inputs on the existing UI owner for filters, selections or open dialogs; do not simulate clicks to reach the advertised starting state.
3. **Render the production page.** Add a story variant using the design workspace's `ProductPreview` and reset controls. Reuse the established page-story layout so the full product viewport contains only the app. The preview supplies the actual shell, routes and feature pages; never copy them into stories or import source across application workspaces.
4. **Synchronize and inspect.** Run root `pnpm dev:ui` to update the catalog mirror and start both servers. Commit the generated `apps/design-system/src/preview-catalog.json` alongside source catalog changes; do not edit it manually. Open the named variant directly, inspect phone and desktop presets, follow its real interactions, and reset after edits. Confirm reset restores its initial route, sample data, drafts and clock. Check a normal component story too when changing preview layout or styling.
5. **Document limits.** Explain what the state demonstrates and what is simulated. Saving and deleting affect only temporary sample data. The preview has no browser persistence or service worker; inspect the installed-app capabilities separately. Keep proposals visibly labeled in Explorations.
6. **Verify the delivered boundary.** Run `pnpm verify` for code changes. For preview delivery changes, also run root `pnpm build:ui` and inspect the standalone site with the development preview server stopped, including a direct state link and the intended hosting base path. Check that ports fail visibly when occupied and both development processes exit together when changing the coordinator. Report only observed results.

The root commands own catalog synchronization, development process coordination and static preview packaging. The [architecture contract](architecture.md#product-preview-boundary) explains the document boundary. A product preview proves interactions with sample memory adapters, not persistence, restart recovery, installation or offline behavior.

## Component names

Apply the naming rules from the [Vue Style Guide (Priority B)](https://vuejs.org/style-guide/rules-strongly-recommended.html) to our components:

- Give each component its own PascalCase `.vue` file. Use the same PascalCase name in imports, exports and Vue templates.
- Prefix shared, styled `@form/ui` components with `Base`: `BaseButton`, `BaseField`, `BaseDialogContent`. Keep their existing feature folders; the prefix expresses their reusable role.
- Put the general family before its modifier: `BaseButtonIcon`, `BaseInputNumber`, `BaseSelectNative`.
- Prefix a tightly coupled child with its parent's full name, for example `StrongLiftsPrototypeExerciseList` and `StrongLiftsPrototypeExerciseListCircles`. Independently reusable components keep their own names.
- Prefer full words over abbreviations. `BaseTextarea` follows the native HTML element name; third-party components retain their upstream names.
- Match component story filenames and catalog titles to their public export: `BaseButton.story.vue` and `02 Components/BaseButton`. Pattern and foundation stories describe their subject and retain the `.story.vue` suffix.

Histoire's **00 Start here / Component naming** page illustrates this contract. When renaming, update the source file, public export, imports, template tags, story filename/title, copyable examples and current documentation together. Preserve behavior, styles, props and events. The private source package uses the new names directly, without legacy aliases.

PascalCase template references, matching explicitly declared component/file names and multi-word names are linted. Prefix choice, parent relationships, word order and full-word clarity require review; lint does not infer component ownership.

## Change storage or backups

1. Inspect `domain.ts`, `ports.ts`, `application.ts`, and the relevant adapter together. Validate external values at the boundary before they become domain state.
2. Preserve atomic comparison and save, explicit conflict results, and ownership of connections and subscriptions. The composition root in `apps/workout/src/app/composition.ts` supplies concrete browser capabilities.
3. Treat confirmed IndexedDB data and the browser draft journal as separate resources. Draft acknowledgement must not erase a newer edit; unreadable confirmed data must remain available for recovery export.
4. Decide format and compatibility behavior explicitly when changing persisted data. The current lack of a legacy migration is an existing limitation, not permission to discard future user data.
5. Update the storage contract and domain context with any changed guarantees. Run `pnpm verify` for code changes and inspect the affected save, recovery, or import flow as appropriate. Distinguish observed behavior from unverified expectations.

## Change design tokens or styles

Palette values and generic tokens live in `packages/ui/src/tokens.css`; the workout mapping lives in `packages/ui/src/workout-theme.css`. Generic component CSS lives in `packages/ui/src/styles.css`. App layout belongs in `apps/workout/src/style.css`, and explorer presentation belongs in `apps/design-system/src/preview.css`.

Update foundations stories and [design](design.md) when a design rule changes. Inspect both consumers when changing shared styling. Keep examples of spacing or layout from becoming a second source of token values. Run `pnpm lint:vue` for the [enforced token policy](design.md#enforced-token-policy): it checks CSS and Vue styles, supported Tailwind expressions, TypeScript class helpers, and static CSS variable references. Fix findings using the shared token source; do not add one-off tokens merely to silence lint.

## Verification and delivery

Changes may be committed directly on `main` or merged from a working branch into `main` after the appropriate checks. A pull request is not required; do not create one unless the user explicitly asks for it.

Husky installs the Git hooks through the root `prepare` script when you run `pnpm install`. Before each commit, `.husky/pre-commit` runs `pnpm verify` across the workspace and blocks the commit if type checking or linting fails. The checks read the current working tree, including unstaged changes. Run `pnpm prepare` to reinstall the hooks in an existing checkout.

`pnpm verify` runs only type checking and linting. Automated tests run through separate commands described in [Testing](#testing). Standalone architecture and workspace checks are optional and remain outside verification. Build only when needed to run or deploy the application; offline and installation behavior require the production preview described in [README.md](../README.md).

For documentation-only changes, check links, referenced paths, command names, and consistency with the implementation. Report edits, checks, commits, pushes, and deployment separately; completing one does not establish the others.

## Testing

Choose a test by the failure it must expose. Keep `pnpm verify` as type checking and linting. Run `pnpm test` to execute all behavior suites, or choose the affected layer:

| Command | Proof |
| --- | --- |
| `pnpm test:unit` | Pure rules and application orchestration in Node |
| `pnpm test:browser` | Shared UI components and real browser storage adapters in Chrome |
| `pnpm test:e2e` | Executable Gherkin journeys against the production app build in Chrome |

Install Chrome with `pnpm --filter @form/workout exec playwright install chrome`. CI installs it before browser execution. The E2E command generates Playwright specs, builds the app with the root base path, and serves it on port 4197. Keep that port free. Generated specs, reports, and traces are ignored by Git. Failed journeys retain traces and screenshots.

### Performance and offline guardrails

Run `pnpm performance:check` before delivering image, font, dependency, rendering, or PWA changes. It builds the production app, checks asset budgets, checks offline artwork in Chrome, and runs Lighthouse CI. This command remains separate from `pnpm verify` and `pnpm test`.

Install Chrome using the command above. Keep port 4198 free. By default the build and checks use `/the-workout-tracker/`; set `VITE_BASE_PATH` consistently to audit a different deployment path. The command builds `apps/workout/dist`, which is also the deployment artifact. It never audits the development server or Histoire.

| Command | Purpose |
| --- | --- |
| `pnpm performance:check` | Build and run all performance/offline checks |
| `pnpm performance:budget` | Inspect the existing production build and imported exercise sources |
| `pnpm performance:offline` | Start a production preview and verify offline restart plus all catalog artwork |
| `pnpm performance:lighthouse` | Start a production preview and audit Workouts and Exercises |

The last three commands require a fresh `pnpm performance:build` with the same base path. [Asset budgets](../apps/workout/performance-budgets.json) cap the complete uncompressed build at 1,750,000 bytes, gzip JavaScript (including the service worker) at 200,000 bytes, imported exercise images at 750,000 bytes combined and 20,000 bytes each, thumbnail dimensions at 192px, and image data URLs embedded in JavaScript at zero bytes. The checker rejects PNG/JPEG assets emitted into the bundled assets directory; installation icons in the public root remain permitted. These deterministic checks cover assets that lazy loading might hide from a Lighthouse page audit.

[Lighthouse configuration](../lighthouserc.cjs) runs three fresh-storage mobile audits per route with simulated throttling and median assertions. Required thresholds are performance score at least 90, Largest Contentful Paint at most 2,750ms, Total Blocking Time at most 300ms, and Cumulative Layout Shift at most 0.1. The audit URLs include a route-specific query parameter because Lighthouse CI groups URLs without their hash; this keeps the two hash routes independently gated. Reports stay local in `.lighthouseci`; there is no public report upload. Lighthouse is a lab measurement, not a measurement of real users' INP or installed-device startup.

The separate Chrome regression installs the service worker from Workouts, switches offline, closes the page and opens Exercises in a new page, then fetches and decodes every emitted WebP plus the rendered catalog images, including offscreen artwork. Exercises without matched illustrations may still use their intentional icon fallback. This verifies the first offline visit to the catalog rather than warming its images online first. It does not simulate browser cache eviction, an OS process restart, or iOS installation.

Initial delivery baseline on 2026-10-05: the isolated performance change passed all six local Chrome Lighthouse runs and the offline artwork check. Its production build was 1,265,763 bytes, gzip JavaScript 167,847 bytes, and 46 exercise images totaled 401,144 bytes. The earlier working-tree audit included a separate, uncommitted artwork expansion with 77 images totaling 620,106 bytes; the image budget accommodates that measured expansion. These are local lab results, not a CI or real-device guarantee. Keep this baseline distinct from later changes to limits. The first GitHub run measured Workouts LCP at 2,524ms versus 2,448ms locally, with all other gates passing. The LCP regression budget is therefore 2,750ms (about 9% above the measured CI baseline); 2,500ms remains the improvement target. This small explicit runner margin avoids treating a 24ms target miss as a deployment regression.

CI runs these checks on pushes and pull requests before uploading the Pages artifact. A failed check blocks deployment. Lighthouse and offline browser diagnostics are retained as the `workout-performance-results` artifact for 14 days, including on failure. Repository branch protection is a separate setting; this workflow alone does not block Git pushes or merges.

When a budget fails, inspect the report, identify the added bytes or rendering work, and reduce the regression. Change a limit only alongside a documented product reason and fresh measurements; do not automatically increase it to match the failing result. Three-run medians reduce timing noise but do not eliminate host variation. Reproduce timing failures on an idle machine before adjusting thresholds. See [Lighthouse CI assertions](https://googlechrome.github.io/lighthouse-ci/docs/configuration.html) and [Workbox precaching](https://developer.chrome.com/docs/workbox/modules/workbox-precaching) for the underlying behavior.

### Write unit tests without mocks

Call real domain functions with explicit values. Pass time and IDs through parameters or the existing application dependencies. Do not use module mocks, spies, patched globals, or fake timers. Extract a pure decision when a rule is trapped inside a Vue component or composable. Leave browser interaction and lifecycle checks at the browser layer.

Application tests can inject small in-memory implementations of the declared ports. These are test doubles and prove orchestration only. They do not prove IndexedDB transactions or browser storage. Test the production adapters separately with real storage.

Use typed factories under `apps/workout/test/support` to create fresh valid records. Give each scenario its own state and deterministic identities. Override only the fields relevant to the behavior. Expected results must come from the contract, not from the function under test.

### Write property tests for domain invariants

[Workout properties](../apps/workout/test/unit/workout-properties.test.ts) use [fast-check](https://fast-check.dev/) to replay random command sequences through `reduceWorkout` and check [domain rules](context.md) after every step. These include valid snapshots, unchanged history, preserved logged work, rest ownership, and acceptance of valid commands. They run with `pnpm test:unit`.

Add a rule there when it must hold for every reachable state rather than one example. Steps choose targets from the current snapshot so that most commands can be reached from the interface. Assert a rule from the contract, never from a copy of the implementation. Also assert acceptance: snapshot validation can turn a broken transition into a rejection, and a property that checks accepted changes only will miss it. When a property fails, paste the shrunk counterexample into a named example test before fixing the reducer. If you add a command, give it a weight in `KINDS` and a builder.

Prove a new property by temporarily breaking the reducer in a copy and confirming that the property fails. Generated arrays need an explicit `size`, because fast-check otherwise keeps them to about ten steps. Short journeys rarely build up logged work.

### Write component tests in the browser

Shared UI components are tested with [Vitest Browser Mode](https://vitest.dev/guide/browser/) and `vitest-browser-vue` in real Chrome. These tests live in `packages/ui/test/browser/*.browser.test.ts`, and `pnpm test:browser` runs them. Browser Mode supplies layout, focus, pointer hit-testing and the accessibility tree. Do not add jsdom, polyfills or patched globals.

- Render a fixture from `packages/ui/test/fixtures/`. A fixture wraps the component the way a consumer would and shows emitted state, for example the confirmed value next to a numeric input.
- Await `render`. Query by role and accessible name. Act through locators such as `locator.click()`, never `element().click()`: locator actions check that a pointer can reach the target, so an overlay that blocks it fails the test.
- Name tests with BDD nesting: `given …` → `when …` → `should …`.
- Assert focus with `toHaveFocus`, record a dialog's structure with `toMatchAriaInlineSnapshot`, and run `expectNoAxeViolations` from `packages/ui/test/support/axe.ts` in each meaningful open state. The helper also fails on incomplete axe results. A `knownIssues` exception must name the rule and fails once the issue is fixed.
- Teleported content, such as dialogs, is queried through `page`. While a modal is open, content outside it is `aria-hidden`, so a fixture's output is read by test ID.

The [setup file](../packages/ui/test/support/browser-setup.ts) loads the package stylesheets so that tests see the real stacking and layout. Prove a new test by breaking a copy of the component and confirming that the test fails.

### Write application journeys

Put product-language scenarios under `apps/workout/test/e2e`. Keep semantic locators and user actions in page objects. Step definitions connect product intent to those page objects. Avoid arbitrary sleeps and assertions about internal call sequences.

Use the test fixtures to seed prerequisites into an isolated browser context. Seeding is test-only and uses actual browser storage. Never seed the outcome of the action being tested. A fresh-user journey must create its workout through the UI. A reload journey must read the data the application saved. Do not add production seed endpoints or replace persistence with fixtures.

Browser adapter tests use unique database names and close handles before cleanup. Each application scenario gets an isolated browser context. Chrome is the default browser. Functional tests do not establish visual parity, full accessibility, offline availability, or cross-browser compatibility.

## Lint and TypeScript policy

`pnpm verify` runs type checking and linting only. `typecheck:native` uses the stable Go-based TypeScript 7.0.2 compiler (`@typescript/native`, an npm alias) on the domain, application, adapters, typed UI controllers, and numeric editing modules listed in `tsconfig.native.json`. Each workspace also runs `vue-tsc` over its complete application and Vue templates. TypeScript 6 remains a compatibility dependency for `vue-tsc`, the ESLint parser, and the architecture policy's compiler API; replacing that API with TypeScript 7 is not supported by these tools. TypeScript 8 is not published; the registry's development line was 7.1 when this setup was adopted.

Oxlint owns JavaScript/TypeScript rules, supported Vue script rules, and custom architectural rules. Type-aware Oxlint uses `oxlint-tsgolint` for unhandled/misused promises and exhaustive switches in TypeScript; do not assume this provides type-aware checking of Vue templates. ESLint owns the remaining Vue template rules, CSS/token policy, and Tailwind class-helper checks in TypeScript, and applies the same promise/exhaustive-switch checks to typed Vue script blocks using its project service. `eslint-plugin-oxlint` disables rules already handled by Oxlint; only the three type-aware checks are explicitly restored for Vue files.

- Use literal unions instead of enums, avoid explicit `any`, and avoid type assertions other than `as const`.
- Use early returns or loop continuation instead of JavaScript `else`/`else if`; Vue `v-else` remains valid template structure. Avoid nested ternaries.
- Cover every union case explicitly in a `switch`. A default branch does not count as coverage. Exhaustive union switches do not need a redundant default.
- Keep modified cyclomatic complexity at most 10. This counts a switch as one branch so explicit exhaustive dispatch does not punish adding named domain commands; nested conditions and logical operators still count.
- Destructure `defineProps` using Vue 3.5 reactive destructuring and inline defaults. Wrap reactive reads in getters when passing them to watchers. Reka wrappers may forward the reactive rest-props object.
- Use `useTemplateRef` for template references. Document-level element queries are forbidden in components; a query scoped to an owned template reference is permitted.
- Declare slots explicitly, remove unused props/refs/emits, use PascalCase component references and kebab-case custom events/attributes. Vue's `update:*` model events retain their framework spelling. Use the [component naming contract](#component-names). Only the application root `App` and Histoire story filenames are exempt from the multi-word naming rule.
- Keep template nesting at most eight levels. A `use*.ts` module must call an imported Vue/VueUse API or another imported composable. This is a structural check, not a proof of lifecycle correctness.
- Product logging permits `console.warn` and `console.error`, not debug logging.
- Keep source files at most 400 lines (`design/file-size`). Files that were already larger are listed at their current size in `tooling/lint/file-size-baseline.json`. That limit only goes down: growing past it fails, and shrinking a file fails until you lower its entry to the new size, or remove the entry once the file is at most 400 lines. Never raise an entry; split the file instead.
- Keep each awaited effect in application and adapter code in its own `try` (`code-policy/one-effect-per-try`), so a failed read, transition and write produce different results.
- Do not assign through props or values destructured from them (`code-policy/no-prop-ref-writes`). Call the owner's command or emit an event.
- Domain, ports and application compile with the ECMAScript library only (`tsconfig.pure.json`, run by `pnpm typecheck:pure`), and the architecture rule allows only ECMAScript built-ins as globals there. Inject anything else.

Run `pnpm lint:oxlint` or `pnpm lint:vue` for focused feedback. Both stages reject warnings. No automated tests, standalone architecture commands, formatting checks, or builds are added to verification.

## Maintain context

Update the document that owns the changed rule in the same change. Keep the README and agent guide as entry points. Historical records should say what was decided or observed, identify relevant limitations, and link to the current contract. Move superseded plans into `docs/history` only after extracting any still-current rules. Add prior art when it explains an actual choice, including what was adapted or left out.
