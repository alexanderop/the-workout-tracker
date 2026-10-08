# Verification

The complete `pnpm verify` command passed after the gallery port moved to 4182. It covers formatting, package and feature boundaries, lint, TypeScript, both application builds, 28 unit tests, 33 browser tests including 11 UI tests, and 12 production E2E scenarios. See [the run output](verified.log).

`pnpm test:visual` passed all seven comparisons without updates in the pinned Linux amd64 container. See [the run output](visual-check.log) and [reference images](../../packages/ui/test/__screenshots__).

The baseline images are in `packages/ui/test/__screenshots__` at repository root. Light/dark controls, light/dark dialogs, narrow controls, narrow dialog, and outline keyboard focus were visually inspected.

A temporary workspace copy appended `.ui-button { border-radius: 0 !important; }` to the visual fixture CSS. All seven screenshot comparisons failed with image differences, as expected. Production source and references were unchanged. See [the negative control output](visual-negative.log).

The local gallery was exercised in the Codex browser. Initial input values, editing, error display, reset, light/dark theme, dialog save, and return focus were observed. Automated IME coverage dispatches composition events; it is not an operating-system IME session. No real screenreader test or measured pixel comparison against upstream was performed.

Independent code and comment reviews found no actionable issues. Cross-model review was unavailable. The trail was checked against the current conversation and tool outputs; no separate transcript export was available.

## PR review follow-up

A later three-agent review identified three P2 issues missed by the initial review: composed input text overwritten on an attribute update, stale form ownership for reset, and insufficient destructive hover contrast in dark mode. All three are corrected. Regression tests first reproduced both input failures and the 3.48:1 axe color-contrast failure before the fixes. Controlled value updates now avoid overwriting active composition, and reset handling checks the current form owner after cancellation handlers have completed.

The default browser suite now includes a shared axe assertion with actionable rule, selector, failure explanation, and help-link output. Seventeen additional accessibility tests cover both themes, all six button variants at hover and keyboard focus, fields, body-portalled dialogs, and the legacy Sheet. New components and interaction states must be added to the matrix; axe cannot establish complete accessibility.

After these changes, `pnpm verify` passed: 28 unit tests, 52 browser tests (30 UI and 22 workout), and 12 E2E scenarios, plus formatting, boundaries, lint, types, and builds. All seven canonical Linux visual comparisons passed without baseline changes. The IME regression uses synthetic composition events, not an operating-system IME session.

## Reka Browser Mode integration

Inspected the user's `alexanderop/reka-ui-bench-mark` checkout at `ab4207bf38e4f72feb08f9202fd3eed97f728fbe`: Browser Mode setup, browser-safe axe adapter, cookbook, Dialog tests, ARIA census/transition tests, and cross-browser configuration. Added matching patterns for this library's current public API: strict ARIA trees, resolved ID references, bidirectional focus wrapping, modal reopen/unmount cleanup, native disabled activation, and changing FieldError props. See `packages/ui/test/README.md` for the source-to-test mapping and extension rules.

The ARIA census has ten reviewed snapshots, rooted at the document with `deep-equal` child matching. A temporary extra button caused the expected snapshot mismatch; the mutation was removed before final verification. A Linux WebKit scan detected 4.49:1 contrast on light destructive hover, while Chromium and Firefox passed. The light blend was increased from 90% to 95% opacity while keeping the dark blend at 50%; the full state scans then passed in both additional engines.

Final results: `pnpm verify` passed (28 unit, 61 browser including 39 UI, 12 E2E, formatting, lint, types, boundaries, builds); seven canonical Linux amd64 visual comparisons passed without snapshot changes. All 39 UI tests passed separately in Firefox and WebKit using the Playwright 1.63.0 Linux arm64 container (`sha256:a0f4498920a5dbac63196d9140ed738ef00470f27e2e74029abd8850b7bd5717`). CI now runs both engines separately on Linux and requires these checks before deployment.

Local macOS limitations were not counted as passes: Firefox could not start its temporary profile, and WebKit skipped buttons in native Tab navigation. An initial emulated Linux amd64 Firefox launch also failed before tests; native Linux arm64 provided the successful local cross-browser evidence. No engine failures were hidden with expected-failure markers or skips.
