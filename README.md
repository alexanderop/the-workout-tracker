# The Workout Tracker

[Open the app](https://alexanderop.github.io/the-workout-tracker/) · [Source](https://github.com/alexanderop/the-workout-tracker)

A quiet, local-first workout journal. Dark mode, five colors, purple as the primary accent. Built with Vue 3, strict TypeScript, Vite, Dexie, Reka UI, Lucide and a service worker.

## Workspace

This pnpm monorepo contains independently owned workspaces:

- `apps/workout` (`@form/workout`): the PWA, workout domain, IndexedDB storage, application styles.
- `packages/ui` (`@form/ui`): reusable Vue components, design tokens. It has no workout or persistence dependencies.
- `packages/result` (`@form/result`): a vendored copy of [better-result](https://github.com/dmmulroy/better-result) (MIT) for `Result` and `TaggedError`. Expected failures in the workout feature are return values.
- `packages/composables` (`@form/composables`): small Vue composables for events, connectivity, media queries, visibility and validated `localStorage`, adapted from [VueUse](https://github.com/vueuse/vueuse) (MIT). Not imported by `@form/ui` or the pure workout layers.
- `apps/design-system` (`@form/design-system`): the Histoire product design workspace, with foundations, components, patterns, complete product pages, flows and explorations. Run `pnpm dev:ui` and open http://127.0.0.1:4186.

The app imports its buttons, form controls, dialogs and mobile numeric editor from `@form/ui`, with shared colors from `@form/ui/tokens.css`. The dependency uses `workspace:*`. Each workspace declares its own dependencies and uses strict TypeScript settings from `tsconfig.base.json`.

`@form/ui` is a private source package: Vite compiles its Vue source as part of the consuming app. It does not yet produce a standalone npm distribution. New component consumers import `@form/ui/styles.css` alongside the tokens. Its public API is limited by package exports; import paths into another workspace's source are forbidden.

`pnpm check:boundaries` checks workspace manifests and imports in source and configuration. It rejects cross-workspace relative imports, private deep imports, undeclared dependencies and dependencies on applications. Source cannot rely on development-only dependencies. This standalone check is optional and is not part of `pnpm verify`.

Within the app, `src/features/workouts` contains the domain, application, storage port, Dexie adapter, and feature UI. The app composition root supplies concrete dependencies. Shared Oxlint and standalone rules enforce feature entry points and layer direction; `pnpm check:architecture` checks feature and layer boundaries.

Run an individual package with `pnpm --filter @form/ui typecheck` or `pnpm --filter @form/workout dev`. Root commands coordinate the workspace. Add generic components to the UI package; keep `SetRow` and `RoutineEditor` in the workout feature because they use workout domain types.

## Run

Requires Node 22.12+ or Node 24 and pnpm 10.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:4180. For installation and offline use, run the production preview instead:

```sh
pnpm build
pnpm preview
```

The preview uses the same address. Stop the development server first. Keep the same origin to retain access to your local journal.

## What you can do

- Start a workout from an empty journal and choose exercises from the built-in catalog.
- Search and filter exercises by muscle group or equipment, select several at once, or create a custom exercise.
- Switch exercises from the thumbnail strip and edit weight and repetitions directly in aligned set rows. Use each row’s check button to log.
- Repeat a past workout with its original set values, or save an editable template with targets for each set.
- Configure each exercise's set count, target repetitions and weight during training. Bulk changes preserve logged work and existing mixed targets unless you explicitly replace them. Edit a logged row to correct it, open set options to undo logging or explicitly clear values. Add another set directly below the rows. The mobile bar shows rest and opens the next unfinished set.
- Enter weights in kg and repetitions with the numeric keypad or quick-pick suggestions, then log each set. Zero repetitions records a failed attempt. Confirming a numeric value saves it to the input draft; Cancel leaves it unchanged. Drafts recover after navigation, reload and reopening. Logging a set is a separate action. A storage error leaves the input visible and reports when recovery is unavailable.
- Resume a workout, use the rest timer, add or remove sets and exercises, finish or explicitly discard the session.
- Review history, completed-set volume, lifting trends and heaviest sets. Correct a completed workout name or logged set values with one explicit save.
- Export and import JSON backups from Settings, or delete all personal data after confirmation.
- Use the app offline after its first complete production load. Use your browser's installation option, or Share → Add to Home Screen on iOS.

The installed app has no accounts, analytics, cloud sync, or demo workout history. Histoire examples use separate, temporary sample data. New installations contain exercises but no workouts or templates. New exercise weights start at zero. Repeated workouts and templates keep their own set values; previous performance is shown as a reference.

## Your data

IndexedDB holds your journal in this browser profile, on this origin. Clearing site data removes it. Export backups regularly; installation is not a backup.

Imports restore an empty journal with the default catalog and preferences, including after deleting all data. Otherwise they add missing records, skip exact duplicates and reject conflicting IDs without partially importing. Local settings stay unchanged. Two different active workouts cannot be merged. A newer backup with edits to records already on another device can therefore require a fresh browser profile for restoration. Import is not multi-device synchronization.

An unreadable database offers a raw recovery export rather than silently clearing your data. Simultaneous edits use revision checks; if another tab changed the set you are editing, The Workout Tracker keeps your draft visible and offers an explicit choice to keep your input against the latest saved values or discard the draft. Recovered drafts require review when the saved values or source revision changed. Live drafts can follow unrelated saves while their set values remain unchanged.

## Code quality

Keep code readable, strictly typed and focused. Use explicit dependencies, enforce feature and layer boundaries, validate external data, and handle errors and resource cleanup deliberately. Avoid unnecessary abstractions and dependencies.

`pnpm verify` runs TypeScript 7 native checks for the typed core/controllers, full Vue type checking through the TypeScript 6 compatibility toolchain, Oxlint, and focused Vue/CSS ESLint checks. See the [lint and TypeScript policy](docs/workflows.md#lint-and-typescript-policy) for ownership and enforced conventions. Verification contains only type checking and linting:

```sh
pnpm verify
```

Run `pnpm test` for the unit, browser, and application suites. Install Chrome for browser execution with `pnpm --filter @form/workout exec playwright install chrome`. See [Testing](docs/workflows.md#testing) for individual commands and data setup.

Run `pnpm performance:check` for a production build, image/bundle size budgets, an offline artwork regression, and mobile Lighthouse audits. CI requires these checks before deployment. See [Performance and offline guardrails](docs/workflows.md#performance-and-offline-guardrails) for thresholds, reports, and local setup. They remain separate from `pnpm verify`.

Husky runs `pnpm verify` and the limit ratchet before each commit, and `pnpm test:unit` with coverage thresholds before each push. See [Verification and delivery](docs/workflows.md#verification-and-delivery) for hook setup and behavior.

## Documentation map

| Question | Document |
| --- | --- |
| How should an agent work here? | [AGENTS.md](AGENTS.md) |
| Which words do we use for workout concepts? | [Glossary](docs/glossary.md) |
| What are the workout rules, state transitions, and revisions? | [Domain context](docs/context.md) |
| Which workspace or module owns a behavior? | [Architecture](docs/architecture.md) |
| What are the visual and interaction rules? | [Design](docs/design.md) |
| How do I add a command, component, or persistence change? | [Development workflows](docs/workflows.md) |
| Which references informed our choices? | [Prior art](docs/prior-art.md) |
| What did earlier work decide or report? | [Implementation history](docs/history/README.md) |

The glossary, context, architecture, and design describe current contracts. History preserves earlier plans and evidence, not current instructions. Update the authoritative document when its contract changes and link to it from other guides.

## GitHub Pages

The verification workflow checks code quality and builds the actual Pages project path before deployment. It publishes `apps/workout/dist` through the official GitHub Pages actions only after verification succeeds.

The repository variable `PAGES_BRANCH` selects the publication branch. It is set to `main`, which is also the default when the variable is absent. Pull requests run verification without deployment permissions.

For a local deployment build, run `VITE_BASE_PATH=/the-workout-tracker/ pnpm build`. The same base path scopes the manifest, icons, application navigation, and service worker. The app remains installable and works offline after its first complete online load.

The display name and download filenames use The Workout Tracker. The internal IndexedDB name remains unchanged. The workout-first model uses backup version 2 and does not migrate older snapshots or version 1 backups.

## Product design workspace

Histoire is the living product design workspace. Start in **04 Pages** to review complete screens with the real application shell, navigation and dialogs. Open **05 Flows** to walk through connected workout journeys. Use the viewport controls to compare phone and desktop layouts, the Docs panel for context, and **Reset example** in Controls to restore the selected example.

```sh
pnpm dev:ui
```

Open http://127.0.0.1:4186. This root command coordinates Histoire and a workout-owned preview server on port 4187; both ports must be available. Stopping the command stops both servers. Page and flow examples run the real application with isolated, temporary sample data. Edits, logged sets and drafts disappear on reset or reload and never change the personal journal in the installed app. Their clock starts from a repeatable example date and advances so rest timers remain interactive.

`pnpm build:ui` produces the standalone static site in `apps/design-system/.histoire/dist`, including its product previews. It needs no running workout server after building. The root commands also synchronize the app-owned example catalog into the explorer. Use these commands rather than starting or building only the design-system workspace when working on product previews.

The explorer uses Histoire 1.0 beta with Vite 7; the workout app compiles its own preview with Vite 8. They share public `@form/ui` exports without importing each other's source. The normal workout build and deployment remain separate. Product previews do not register a service worker and do not establish real storage, reload recovery, offline or installation behavior. Inspect those in the production app. Automated behavior tests live in `apps/workout/test` and run separately; `pnpm verify` remains type checking and linting only.

### Design workspace organization

| Section | Contents |
| --- | --- |
| **00 Start here** | Product audience, design principles, catalog guidance and naming |
| **01 Foundations** | Semantic colors, typography, spacing, touch sizes, icons and motion |
| **02 Components** | Public `@form/ui` components, variants and interactive controls |
| **03 Patterns** | Illustrative compositions with local sample state and explicit limitations |
| **04 Pages** | Workouts, Exercises, Active workout, Progress and Settings in named states |
| **05 Flows** | First workout, repeat a workout, and finish and review |
| **06 Explorations** | Proposals clearly distinguished from implemented product behavior |

Stories live in `apps/design-system/src/stories/**/*.story.vue`. Complete pages render the production application through its preview document; do not copy page markup or move workout rules into the UI package for the explorer. Sample feedback in patterns and explorations must not imply a real save. Spacing examples are reference values, not additional global tokens.

See [the design contract](docs/design.md#product-design-workspace) for presentation rules and [the preview workflow](docs/workflows.md#add-a-product-page-state-or-flow) for adding examples.
