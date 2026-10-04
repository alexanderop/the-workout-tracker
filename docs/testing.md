# Testing responsibilities

Choose the smallest environment that can expose the failure. Test behavior through public operations and visible results. Do not replace imported modules or assert private call sequences.

## Pure rules and application workflows

`pnpm test:unit` runs Vitest in Node. `test/unit/domain.test.ts` exercises real domain transitions with explicit time and IDs. Application tests use the real service and an injected in-memory storage implementation. Controlled failures and interleaved writes test the service's error and conflict behavior.

The in-memory implementation is a test double. It does not prove IndexedDB behavior. Test helpers stay outside production source.

## Adapter contracts

`test/contracts/storage.contract.ts` defines reusable storage behavior. `test/unit/storage.test.ts` runs it against memory. `test/browser/storage.test.ts` runs the same suite against real IndexedDB through Dexie.

The contract covers initialization, reopen, concurrent writes, stale no-ops, revision discipline, invalid data, corrupt-data recovery, value isolation, observation, and closure. Each fixture owns its handles and cleanup. Browser fixtures use unique database names.

A future remote adapter needs real backend integration tests for its atomic writes and authorization. HTTP parsing and error mapping can additionally use MSW in a separate Vitest integration project. There is no HTTP adapter or placeholder integration suite in the current app.

## Browser components and storage

`pnpm test:browser` runs the UI package and workout browser suites in Chromium using Vitest Browser Mode. Component tests use `vitest-browser-vue`, accessible roles, and visible outcomes. Storage tests keep IndexedDB real.

Browser Mode uses Playwright as its browser provider. These tests render a component or exercise a browser-dependent module. They do not automatically start the complete production application.

The existing workout persistence tests retain coverage for backup merging, restoration, recovery exports, retries, and cross-instance notifications. Lifecycle tests verify that component cleanup unsubscribes without closing an app-owned service.

## Application acceptance

`pnpm build` followed by `pnpm test:e2e` tests the served production build with Playwright. `playwright-bdd` turns the Gherkin scenarios in `test/e2e/workout.feature` into executable tests. BDD is the scenario format for this suite, not a second copy of the E2E tests.

The scenarios cover reload, offline completion, custom exercises, backup restore, discard, and stale drafts in two tabs. They use the real local storage and production service worker. A fixture must not replace persistence or offline behavior when that mechanism is what the scenario proves.

Both desktop and mobile projects use Chromium. Mobile device emulation does not prove physical iPhone or Safari behavior. Failed runs retain Playwright traces and screenshots.

## Architecture policy

`pnpm test:architecture` tests allowed and forbidden imports and runs the installed Oxlint plugin against real TypeScript and Vue fixtures. The standalone checker also rejects forbidden imports hidden behind inline lint suppressions.

`pnpm check:boundaries` verifies workspace dependencies and package exports. `pnpm check:architecture` verifies feature and layer boundaries. Both run in `pnpm lint`.

## Verification before a pull request

Run `pnpm verify`. It checks formatting, boundaries, lint, types, the production build, unit tests, browser tests, and BDD application journeys. CI runs the same command after a frozen-lockfile install and browser installation.

Keep edge-case combinations in lower layers. Add an E2E scenario when a new user journey introduces a new integration risk. Do not copy every unit-test case into browser tests or E2E tests.
