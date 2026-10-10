# Verification

What each automated check proves, how to run it, and what it does not claim. Commands are run from the repository root. [Testing](workflows.md#testing) explains how to write them; this page records what they establish.

## Commands

| Command             | Result on the recorded run                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `pnpm verify`       | Type checking, linting, architecture, boundary and dead-code checks passed                    |
| `pnpm test:unit`    | 314 result, 91 shared UI and 1,487 workout tests passed, above the coverage thresholds        |
| `pnpm test:browser` | 6 composables, 47 shared UI and 37 workout tests passed in Chrome                             |
| `pnpm test:e2e`     | 74 journey runs passed in desktop Chrome, Pixel 7 Chrome and the service-worker update server |

The recorded run was on macOS with Google Chrome. The e2e suite also passed with `--repeat-each 3` (207 runs, no failures), which is the check for flaky journeys; the suite itself does not retry.

## What the journeys prove

Each journey runs against a production build in a fresh browser context.

### Service-worker updates

`apps/workout/test/e2e/features/updates.feature` (`@updates`, port 4199). The test server builds the app twice into separate directories and switches the served build through a test-only endpoint (`apps/workout/scripts/serve-e2e.mjs`). The endpoint is not part of the application build. Each build carries its version in a `build-version` meta tag, so a scenario can tell which build a page loaded.

- While a workout is active, a deployed update waits: no Update app notice, no reload, and an unlogged weight draft stays on screen. Ending the workout makes the notice appear, which shows the waiting worker was known all along.
- An unlogged draft survives a reload while the update still waits.
- Accepting the update after finishing reloads into version 2 and the logged set is still in history.
- Another tab that activates the waiting version cannot cost this tab its unlogged draft; after reload the draft is restored, and the set can still be logged and finished.
- When the update is accepted in a second tab, a tab with an unsaved template is not reloaded and shows no browser prompt. It keeps the editor open, and after the editor is closed it offers Reload app in an "Updated — reload when ready." notice. Choosing it loads version 2. This scenario fails if the registration code's own reload on takeover is active again.
- A tab that was taken over and then opens a screen it had not loaded yet cannot fetch that screen's old chunk, because the new precache no longer holds it. It shows the "This page could not be opened" error and the reload notice.

Not claimed: updates on a real deployment path (`/the-workout-tracker/`), update checks on the hourly timer, or behavior in an installed app. The cross-tab draft scenario sends the same message the Update app button sends, because the button is withheld during an active workout.

### Offline

`apps/workout/test/e2e/features/offline.feature`. After the first online visit and a reload, the context goes offline:

- A workout started online is continued, its set logged, reloaded offline and finished offline, and the history survives another reload.
- A workout started after an offline reload is kept when the connection returns.

Not claimed: offline behavior after the browser evicts its caches, after an operating-system restart, or on iOS. Offline exercise artwork has its own check in `pnpm performance:offline`.

### Mobile

Features tagged `@mobile` (currently `mobile-controls.feature`) also run in a Pixel 7 Chrome project: touch input, a mobile user agent and a phone-sized viewport. Not claimed: real phone keyboards, Android browsers other than Chrome, or physical touch latency.

### Accessibility

`apps/workout/test/e2e/features/accessibility.feature` runs axe-core on Workouts, Exercises, Progress, Settings and the active workout, each in the light and the dark theme. A scan fails on any violation and on any undecided result, except color contrast on pages where the translucent navigation overlaps scrolling artwork. No violation is excused; the calendar day buttons and the catalog Filters and Sort buttons now carry their visible text in their accessible name (WCAG 2.5.3, Label in Name).

`apps/workout/test/browser/label-in-name.test.ts` repeats the `label-content-name-mismatch` rule on those components in English and in German, because the accessible names are built from translated text. The scans run in English only, so German names and text length are not scanned.

Not claimed: keyboard-only operation, screen reader output, dialogs and sheets, color contrast where axe cannot decide, or zoom and reflow. A passing scan is not a full accessibility audit.

### Language

`apps/workout/test/e2e/features/language.feature` runs in an English browser context (`locale: "en-US"` in `playwright.config.ts`) and opens German contexts where needed:

- Choosing Deutsch in Settings changes the interface and `<html lang>` at once, and the choice survives a reload.
- A browser whose language is German shows German on first load without a stored choice (System follows the browser).
- An explicit English choice wins over a German browser.

`apps/workout/test/unit/i18n.test.ts` proves that the German catalog has every English key with the same placeholders and plural forms, and that locale matching follows the browser's preference list. Not claimed: that German wording reads well, that any layout fits German text length (checked by hand at 390 px), or that right-to-left languages work.

### Error recovery

`apps/workout/test/browser/AppErrorBoundary.test.ts` renders a screen that throws while rendering and proves that the boundary offers Reload app, moves focus to its heading, passes axe, and shows diagnostics with only the app name, build version and a generic label. It does not repeat the exception message or any workout content. Not claimed: recovery from errors outside Vue rendering, such as a rejected promise in storage code, or the copy button against a real clipboard.

### Other journeys

The remaining Gherkin features cover drafts and finish rules, edit safety across tabs, completed-workout editing, the calendar, the exercise catalog, compact Home and appearance settings. They establish functional behavior in Chrome. They do not establish visual parity, Safari or Firefox behavior, or physical installation.

## Performance baseline

Initial delivery baseline on 2026-10-05: the isolated performance change passed all six local Chrome Lighthouse runs and the offline artwork check. Its production build was 1,265,763 bytes, gzip JavaScript 167,847 bytes, and 46 exercise images totaled 401,144 bytes. The earlier working-tree audit included a separate, uncommitted artwork expansion with 77 images totaling 620,106 bytes; the image budget accommodates that measured expansion. These are local lab results, not a CI or real-device guarantee. The first GitHub run measured Workouts LCP at 2,524ms versus 2,448ms locally, with all other gates passing. The LCP regression budget is therefore 2,750ms (about 9% above the measured CI baseline); 2,500ms remains the improvement target. This small explicit runner margin avoids treating a 24ms target miss as a deployment regression.

After the English and German catalogs on 2026-10-10: gzip JavaScript 199,919 bytes of the 200,000 budget (197,903 before), production build 1,607,543 bytes. The catalogs add about 19 kB gzipped and ship as JSON files, not scripts, because the budget sums every script the build emits; see [Language and text ownership](architecture.md#language-and-text-ownership). Only 81 bytes of JavaScript headroom remained. Lighthouse and the offline artwork check were not rerun for this change, so the cold-start cost of the catalog request (preloaded from `index.html`) is not measured.

After the German decimal comma and the file splits on 2026-10-10: gzip JavaScript 199,942 bytes of the 200,000 budget, so 58 bytes of headroom remain. The new components and the comma handling cost about 240 bytes; storing the exercise artwork as `[id, name, src]` rows grouped by equipment, instead of one object per row, saved more than that. `pnpm format:check` passes and runs in CI.

After the startup path changes on 2026-10-10: Lighthouse LCP had grown to about 2,900ms (Workouts) and 3,290ms (Exercises) locally, against the 2,750ms regression budget, because the startup requests were spread over many small files, the service worker registration and the route chunk waited behind the entry file, and about thirty thumbnails were requested in the same frame as the heading. Four changes (see [Performance and offline guardrails](workflows.md#performance-and-offline-guardrails)) measured on a machine with other load: register the service worker after startup (2,912 to 2,703 and 3,290 to 3,078ms, median of three and five runs), one startup chunk (to 2,103 and 3,006ms, median of five), artwork after the first frame (Exercises to 2,555ms), and the route chunk preload (median of nine runs, 2,553 to 2,477 and 2,633 to 2,478ms). The final `pnpm performance:lighthouse` run reported medians of 2,253ms (Workouts) and 2,552ms (Exercises), performance score 0.96 to 0.97, TBT under 20ms and CLS 0, with single runs between 1,065 and 3,227ms depending on whether a request fell before the paint. Gzip JavaScript is 195,807 bytes of 200,000 (the single startup chunk compresses better than the files it replaced), production build 1,601,279 bytes. The offline artwork check passes. These are local lab results, not CI or real-device guarantees.

## Not verified by any automated check

- Installation on a physical phone, and Safari or Firefox.
- Real-user performance (INP, installed-app startup); Lighthouse is a lab measurement.
- Service-worker behavior on the deployed GitHub Pages origin beyond what `pnpm performance:offline` covers.
