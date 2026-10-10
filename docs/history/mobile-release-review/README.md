# Mobile release review — 2026-10-07

This records observed results for the mobile review and fixes based on `0e9b7a5`. Current contracts live in [design](../../design.md), [domain context](../../context.md), and [architecture](../../architecture.md).

## Ten findings addressed

| Finding                                           | Delivered change                                                                         |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Numeric confirmation clipped on short phones      | Fixed header/footer with a scrolling body; compact 44px keypad at 320 × 568.             |
| No way to correct completed workouts              | Edit name and logged weight/reps together, preserving identity, dates and unlogged work. |
| Repeated log activation undoes a set              | Stable Logged state; explicit Undo log in set options.                                   |
| Retained draft and applied values sound identical | Finish names affected sets and explains Apply input values does not log them.            |
| Next is informational only                        | Action selects, reveals and focuses the first unfinished set.                            |
| Add set is buried                                 | Inline action below rows selects the newly created set.                                  |
| Set count lacks a visible label                   | Number of sets label in configuration.                                                   |
| Configuration save is too small                   | Minimum 44px mobile button height regardless of pointer type.                            |
| Search hides selected exercise identity           | Removable selection tray resolves against the full catalog.                              |
| Active filters show only a count                  | Individually removable equipment, muscle-group and custom filter chips.                  |

Completed corrections use a narrow atomic command with a captured revision. Concurrent changes retain local input and require explicit reload. Cancel, Escape, Back and native unload preserve editing intent; Back is blocked while a numeric keypad is open. No storage migration or new dependency was added.

## Observed verification

- `pnpm verify`: type checking and lint passed.
- `pnpm test:unit`: 119 tests passed (15 shared UI, 104 workout).
- `pnpm test:browser`: 8 storage tests passed.
- `pnpm test:e2e`: 44 Chrome journeys passed, including completed correction persistence, second-tab conflicts, Back/discard, keypad input, finish safeguards, and catalog focus.
- Performance bundle budget and offline artwork checks passed. Lighthouse assertions passed in the idle rerun across six runs: median LCP 2598 ms for Workouts and 2747 ms for Exercises, with performance scores 94–96. The exercise result is only 3 ms inside the 2750 ms budget and should be treated as marginal.
- Computer-use review inspected Histoire numeric input first, then the integrated application at 320 × 568 and 390 × 844. It exercised selection/filtering, configuration, keypad confirmation, explicit undo, add/next, retained input at finish, completed correction and reload. A 50 kg × 8 logged set produced 400 kg volume after reload while a 2.5 kg unlogged set remained excluded.

The full suite caught a navigation guard that closed the normal post-finish review. Restricting that guard to an actual open correction editor restored the existing flow. Manual inspection caught keypad ancestor clipping and picker rows consuming the short screen; full-visibility assertions now cover both. An undo message incorrectly promised unchanged values despite planned-rep restoration; that claim was removed.

The first parallel end-to-end/performance run collided on shared output paths. The suites were rerun sequentially. The first sequential Lighthouse run measured exercise-page LCP at 2759 ms against 2750 ms, so it was repeated with owned preview servers stopped. The threshold was not changed.

## Review and evidence boundaries

Independent code reviews covered catalog, training, completed correction, and navigation. Added comments and suppressions were reviewed with no findings. The configured model overrides were rejected by the account, and the fresh reviewer thread limit was reached. Reviews therefore used available inherited-model agents, including reused independent reviewers; cross-model diversity was not achieved. The unavailable control-ui and deslop skills were replaced by computer-use inspection and explicit cleanup review.

This is desktop Chrome/IAB mobile-viewport evidence, not a physical iOS/Safari or Android release certification. No production deployment or remote push is implied.

[Decision trail](decisions.tsv) records choices and corrections. Timestamps record when entries were written; batched recap rows are not exact action times. Detailed transient logs and design alternatives are in `/tmp/form-mobile-release-audit/`. Local screenshots are in `/Users/alexanderopalic/.codex/visualizations/2026/10/07/01a117bf-082d-73a1-89ed-04e08ed5827d/` (`mobile-keypad-fixed.jpg`, `mobile-selection-fixed.jpg`, `mobile-configure-fixed.jpg`, `mobile-completed-edit-fixed.jpg`, `mobile-review-saved.jpg`, `mobile-training-fixed.jpg`). These machine-local artifacts are not repository assets.
