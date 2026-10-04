# The Workout Tracker

[Open the app](https://alexanderop.github.io/the-workout-tracker/) · [Source](https://github.com/alexanderop/the-workout-tracker)

A quiet, local-first workout journal. Dark mode, five colors, purple as the primary accent. Built with Vue 3, strict TypeScript, Vite, Dexie, Reka UI, Lucide and a service worker.

## Workspace

This pnpm monorepo contains three independently owned workspaces:

- `apps/workout` (`@form/workout`): the PWA, workout domain, IndexedDB storage, application styles and application tests.
- `packages/ui` (`@form/ui`): reusable Vue components, design tokens and isolated component browser tests. It has no workout or persistence dependencies.
- `apps/ui-gallery` (`@form/ui-gallery`): an independent consumer of the public UI exports and styles. Run `pnpm dev:ui` to inspect the components.

The app imports `Sheet` from `@form/ui` and the shared colors from `@form/ui/tokens.css`. The dependency uses `workspace:*`. Each workspace declares its own dependencies and uses strict TypeScript settings from `tsconfig.base.json`.

`@form/ui` is a private source package: Vite compiles its Vue source as part of the consuming app. It does not yet produce a standalone npm distribution. New component consumers import `@form/ui/styles.css` alongside the tokens. Its public API is limited by package exports; import paths into another workspace's source are forbidden.

`pnpm check:boundaries` checks workspace manifests and imports in source, tests and configuration. It rejects cross-workspace relative imports, private deep imports, undeclared dependencies and dependencies on applications. Source cannot rely on development-only dependencies. The check runs during `pnpm lint` and CI verification.

Within the app, `src/features/workouts` contains the domain, application, storage port, Dexie adapter, and feature UI. The app composition root supplies concrete dependencies. Shared Oxlint and standalone rules enforce feature entry points and layer direction; `pnpm check:architecture` also tests the rules with real TypeScript and Vue fixtures.

Run an individual package with `pnpm --filter @form/ui test:browser` or `pnpm --filter @form/workout dev`. Root commands coordinate the workspace. Add generic components to the UI package; keep `SetRow` and `RoutineEditor` in the workout feature because they use workout domain types.

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

- Start one of three editable starter routines or a free workout.
- Create routines and custom exercises.
- Enter weights in kg and repetitions, then log each set. Logged sets save immediately; unlogged input drafts do not survive navigation or reload.
- Resume a workout, use the rest timer, add or remove sets and exercises, finish or explicitly discard the session.
- Review history, completed-set volume, lifting trends and heaviest sets.
- Export and import JSON backups from Settings.
- Use the app offline after its first complete production load. Use your browser's installation option, or Share → Add to Home Screen on iOS.

No accounts, analytics, cloud sync, or demo workout history. Starter weights are zero until you enter your own values. Later routine sessions prefill from your previous logged sets.

## Your data

IndexedDB holds your journal in this browser profile, on this origin. Clearing site data removes it. Export backups regularly; installation is not a backup.

Imports restore a completely untouched installation, including edited starter routines. Otherwise they add missing records, skip exact duplicates and reject conflicting IDs without partially importing. Local settings stay unchanged. Two different active workouts cannot be merged. A newer backup with edits to records already on another device can therefore require a fresh browser profile for restoration. Import is not multi-device synchronization.

An unreadable database offers a raw recovery export rather than silently clearing your data. Simultaneous edits use revision checks; if another tab changed the set you are editing, The Workout Tracker keeps your draft visible and asks you to reload the saved version.

## Verify

```sh
pnpm exec playwright install chromium
pnpm verify
```

Verification includes formatting, lint, type checking, production build, pure domain tests, real Chromium IndexedDB and component tests, and desktop/mobile browser journeys. Acceptance tests exercise production service-worker offline reload, custom exercise logging, routine editing, real backup downloads and imports, discard and stale-tab conflicts. Screenshots are written to `apps/workout/test-results/`.

The mobile suite uses Chromium device emulation. It does not establish physical iPhone/Safari installation behavior. The manifest and assets are generated; native OS installation still requires a user action.

Architecture decisions are in [docs/architecture.md](docs/architecture.md), test responsibilities in [docs/testing.md](docs/testing.md), the design tokens in [docs/design.md](docs/design.md), and the implementation trail in [.audit/decisions.tsv](.audit/decisions.tsv).

## GitHub Pages

The verification workflow builds and tests the actual Pages project path before deployment. It publishes `apps/workout/dist` through the official GitHub Pages actions only after verification succeeds.

The repository variable `PAGES_BRANCH` selects the publication branch. If unset, it defaults to `main`. While the architecture PR is open, it selects `codex/feature-architecture` so the reviewed changes remain unmerged. After merging, set the variable to `main` or delete it. Pull requests run verification without deployment permissions.

For a local deployment rehearsal, run `VITE_BASE_PATH=/the-workout-tracker/ pnpm verify`. The same base path scopes the manifest, icons, application navigation, and service worker. The app remains installable and works offline after its first complete online load.

The display name and download filenames use The Workout Tracker. The internal IndexedDB name and versioned backup identifiers retain their existing values so the rename does not discard data or invalidate backups.
