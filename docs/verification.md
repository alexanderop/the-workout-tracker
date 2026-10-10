# Verification

What each automated check proves, how to run it, and what it does not claim. Commands are run from the repository root. [Testing](workflows.md#testing) explains how to write them; this page records what they establish.

## Commands

| Command | Result on the recorded run |
| --- | --- |
| `pnpm verify` | Type checking, linting, architecture, boundary and dead-code checks passed |
| `pnpm test:unit` | 80 shared UI tests and 161 workout tests passed, above the coverage thresholds |
| `pnpm test:browser` | 44 shared UI tests and 32 workout tests passed in Chrome |
| `pnpm test:e2e` | 69 journeys passed: 61 in desktop Chrome, 3 in Pixel 7 Chrome, 5 service-worker update journeys |

The recorded run was on macOS with Google Chrome. The e2e suite also passed with `--repeat-each 3` (207 runs, no failures), which is the check for flaky journeys; the suite itself does not retry.

## What the journeys prove

Each journey runs against a production build in a fresh browser context.

### Service-worker updates

`apps/workout/test/e2e/features/updates.feature` (`@updates`, port 4199). The test server builds the app twice into separate directories and switches the served build through a test-only endpoint (`apps/workout/scripts/serve-e2e.mjs`). The endpoint is not part of the application build. Each build carries its version in a `build-version` meta tag, so a scenario can tell which build a page loaded.

- While a workout is active, a deployed update waits: no Update app notice, no reload, and an unlogged weight draft stays on screen. Ending the workout makes the notice appear, which shows the waiting worker was known all along.
- An unlogged draft survives a reload while the update still waits.
- Accepting the update after finishing reloads into version 2 and the logged set is still in history.
- Another tab that activates the waiting version cannot cost this tab its unlogged draft; after reload the draft is restored, and the set can still be logged and finished.
- When the update is accepted in a second tab, a tab with an unsaved template keeps it, because the browser's leave prompt stands between the editor and the reload.

Not claimed: updates on a real deployment path (`/the-workout-tracker/`), update checks on the hourly timer, or behavior in an installed app. The cross-tab draft scenario sends the same message the Update app button sends, because the button is withheld during an active workout.

Known behavior that differs from the design text: [Design](design.md) says the app "reloads only when the user chooses it". The reload is registered in every tab that has seen the waiting worker, so accepting the update in one tab also asks the other open tabs to reload. Unlogged weight and repetitions are restored from the draft journal. Unsaved editors (template, note, name) are protected only by the browser's leave prompt. See [architecture](architecture.md#service-worker-updates-and-tabs).

### Offline

`apps/workout/test/e2e/features/offline.feature`. After the first online visit and a reload, the context goes offline:

- A workout started online is continued, its set logged, reloaded offline and finished offline, and the history survives another reload.
- A workout started after an offline reload is kept when the connection returns.

Not claimed: offline behavior after the browser evicts its caches, after an operating-system restart, or on iOS. Offline exercise artwork has its own check in `pnpm performance:offline`.

### Mobile

Features tagged `@mobile` (currently `mobile-controls.feature`) also run in a Pixel 7 Chrome project: touch input, a mobile user agent and a phone-sized viewport. Not claimed: real phone keyboards, Android browsers other than Chrome, or physical touch latency.

### Accessibility

`apps/workout/test/e2e/features/accessibility.feature` runs axe-core on Workouts, Exercises, Progress, Settings and the active workout, each in the light and the dark theme. A scan fails on any violation and on any undecided result, except color contrast on pages where the translucent navigation overlaps scrolling artwork. Workouts and Exercises carry one named known issue: `label-content-name-mismatch` (WCAG 2.5.3), for the calendar day buttons and the catalog Filters and Sort buttons. The scenario fails once the issue is fixed, which forces the exception out.

Not claimed: keyboard-only operation, screen reader output, dialogs and sheets, color contrast where axe cannot decide, or zoom and reflow. A passing scan is not a full accessibility audit.

### Error recovery

`apps/workout/test/browser/AppErrorBoundary.test.ts` renders a screen that throws while rendering and proves that the boundary offers Reload app, moves focus to its heading, passes axe, and shows diagnostics with only the app name, build version and a generic label. It does not repeat the exception message or any workout content. Not claimed: recovery from errors outside Vue rendering, such as a rejected promise in storage code, or the copy button against a real clipboard.

### Other journeys

The remaining Gherkin features cover drafts and finish rules, edit safety across tabs, completed-workout editing, the calendar, the exercise catalog, compact Home and appearance settings. They establish functional behavior in Chrome. They do not establish visual parity, Safari or Firefox behavior, or physical installation.

## Performance baseline

Initial delivery baseline on 2026-10-05: the isolated performance change passed all six local Chrome Lighthouse runs and the offline artwork check. Its production build was 1,265,763 bytes, gzip JavaScript 167,847 bytes, and 46 exercise images totaled 401,144 bytes. The earlier working-tree audit included a separate, uncommitted artwork expansion with 77 images totaling 620,106 bytes; the image budget accommodates that measured expansion. These are local lab results, not a CI or real-device guarantee. The first GitHub run measured Workouts LCP at 2,524ms versus 2,448ms locally, with all other gates passing. The LCP regression budget is therefore 2,750ms (about 9% above the measured CI baseline); 2,500ms remains the improvement target. This small explicit runner margin avoids treating a 24ms target miss as a deployment regression.

## Not verified by any automated check

- Installation on a physical phone, and Safari or Firefox.
- Real-user performance (INP, installed-app startup); Lighthouse is a lab measurement.
- Service-worker behavior on the deployed GitHub Pages origin beyond what `pnpm performance:offline` covers.
