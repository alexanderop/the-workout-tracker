# Form

A quiet, local-first workout journal. Dark mode, five colors, purple as the primary accent. Built with Vue 3, strict TypeScript, Vite, Dexie, Reka UI, Lucide and a service worker.

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

An unreadable database offers a raw recovery export rather than silently clearing your data. Simultaneous edits use revision checks; if another tab changed the set you are editing, Form keeps your draft visible and asks you to reload the saved version.

## Verify

```sh
pnpm exec playwright install chromium
pnpm verify
```

Verification includes formatting, lint, type checking, production build, pure domain tests, real Chromium IndexedDB and component tests, and desktop/mobile browser journeys. Acceptance tests exercise production service-worker offline reload, custom exercise logging, routine editing, real backup downloads and imports, discard and stale-tab conflicts. Screenshots are written to `test-results/`.

The mobile suite uses Chromium device emulation. It does not establish physical iPhone/Safari installation behavior. The manifest and assets are generated; no native OS installation or remote deployment is part of this local build.

Architecture decisions are in [docs/architecture.md](docs/architecture.md), the design tokens in [docs/design.md](docs/design.md), and the implementation trail in [.audit/decisions.tsv](.audit/decisions.tsv).
