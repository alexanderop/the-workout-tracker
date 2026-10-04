# The Workout Tracker

[Open the app](https://alexanderop.github.io/the-workout-tracker/) · [Source](https://github.com/alexanderop/the-workout-tracker)

A quiet, local-first workout journal. Dark mode, five colors, purple as the primary accent. Built with Vue 3, strict TypeScript, Vite, Dexie, Reka UI, Lucide and a service worker.

## Workspace

This pnpm monorepo contains three independently owned workspaces:

- `apps/workout` (`@form/workout`): the PWA, workout domain, IndexedDB storage, application styles.
- `packages/ui` (`@form/ui`): reusable Vue components, design tokens. It has no workout or persistence dependencies.
- `apps/ui-gallery` (`@form/ui-gallery`): an independent consumer of the public UI exports and styles. Run `pnpm dev:ui` to inspect the components.

The app imports `Sheet` from `@form/ui` and the shared colors from `@form/ui/tokens.css`. The dependency uses `workspace:*`. Each workspace declares its own dependencies and uses strict TypeScript settings from `tsconfig.base.json`.

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

- Start one of three editable starter routines or a free workout.
- Create routines and custom exercises.
- During a workout, the mobile training bar shows the selected set, running pause, or completion action. Set options offer repetition adjustments and removal; the last log can be undone.
- Enter weights in kg and repetitions, then log each set. Logged sets save when confirmed. Raw input drafts save as you type and recover after navigation, reload and reopening, including unfinished fields. A storage error leaves the input visible and reports when recovery is unavailable.
- Resume a workout, use the rest timer, add or remove sets and exercises, finish or explicitly discard the session.
- Review history, completed-set volume, lifting trends and heaviest sets.
- Export and import JSON backups from Settings.
- Use the app offline after its first complete production load. Use your browser's installation option, or Share → Add to Home Screen on iOS.

No accounts, analytics, cloud sync, or demo workout history. Starter weights are zero until you enter your own values. Later routine sessions prefill from your previous logged sets.

## Your data

IndexedDB holds your journal in this browser profile, on this origin. Clearing site data removes it. Export backups regularly; installation is not a backup.

Imports restore a completely untouched installation, including edited starter routines. Otherwise they add missing records, skip exact duplicates and reject conflicting IDs without partially importing. Local settings stay unchanged. Two different active workouts cannot be merged. A newer backup with edits to records already on another device can therefore require a fresh browser profile for restoration. Import is not multi-device synchronization.

An unreadable database offers a raw recovery export rather than silently clearing your data. Simultaneous edits use revision checks; if another tab changed the set you are editing, The Workout Tracker keeps your draft visible and offers an explicit choice to keep your input against the latest saved values or discard the draft. Recovered drafts from an older revision also require review.

## Code quality

Keep code readable, strictly typed and focused. Use explicit dependencies, enforce feature and layer boundaries, validate external data, and handle errors and resource cleanup deliberately. Avoid unnecessary abstractions and dependencies.

This project does not maintain automated tests or a testing strategy. `pnpm verify` runs type checking and linting only:

```sh
pnpm verify
```

Architecture decisions are in [docs/architecture.md](docs/architecture.md), the design tokens in [docs/design.md](docs/design.md), and the historical implementation trail in [.audit/decisions.tsv](.audit/decisions.tsv).

## GitHub Pages

The verification workflow checks code quality and builds the actual Pages project path before deployment. It publishes `apps/workout/dist` through the official GitHub Pages actions only after verification succeeds.

The repository variable `PAGES_BRANCH` selects the publication branch. If unset, it defaults to `main`. While the architecture PR is open, it selects `codex/feature-architecture` so the reviewed changes remain unmerged. After merging, set the variable to `main` or delete it. Pull requests run verification without deployment permissions.

For a local deployment build, run `VITE_BASE_PATH=/the-workout-tracker/ pnpm build`. The same base path scopes the manifest, icons, application navigation, and service worker. The app remains installable and works offline after its first complete online load.

The display name and download filenames use The Workout Tracker. The internal IndexedDB name and versioned backup identifiers retain their existing values so the rename does not discard data or invalidate backups.
