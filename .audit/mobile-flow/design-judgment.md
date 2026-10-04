# Cross-judgment

All three sketches read end to end. Scores assess proposed behavior, not proven implementation. This judge previously wrote candidate C, so this is a separate comparison pass rather than independent authorship.

| Criterion (1–5) | A: snapshot | B: localStorage journal | C: IndexedDB journal |
|---|---:|---:|---:|
| Interruption durability incl immediate reload | 3 | 5 | 3 |
| Confirmed data and multiple-tab safety | 5 | 4 | 4 |
| Backward compatibility | 3 | 5 | 5 |
| Small maintainable API | 3 | 4 | 3 |
| Mobile UX integration and testability | 5 | 5 | 5 |
| Total | 19 | 23 | 20 |

## Recommendation
Use B as the base. These drafts contain only two bounded strings, so synchronous independently keyed records buy an important user-visible property without whole-snapshot churn or an asynchronous queue. B preserves current database/backup parsing and does not run keystrokes through the dropping command runner. A offers strongest atomic semantics but changes too many existing invariants for this requirement; C retains both cross-store reconciliation and async queue complexity without a meaningful scale benefit.

Graft A's disciplined expected canonical baseline and guarded undo, and C's discriminated recovery outcome. In particular, B's newest-compatible fallback must not silently choose among distinct compatible values from competing actors: show conflict or a clear explicit recovery choice. Avoid broadening the public API with generic journal machinery. A small injected read/write/discard/prune capability plus one UI controller is sufficient.

## Hard constraints before implementation
1. Fresh document actor identity; sessionStorage may provide a recovery hint but must never be sole writer identity because tabs can clone it.
2. Persist synchronously in every raw input handler, without debounce. A failed write retains visible raw input and displays an unsaved state. Do not assert physical disk durability after an OS crash.
3. Per-actor independent keys and strict boundary validation, bounded payloads, stable set identities. No shared JSON blob.
4. Canonical baseline mismatch blocks silent commit; unrelated canonical changes may rebase. Existing CAS still guards the final commit race. A reload-based conflict resolution must intentionally discard local input and use confirmed values.
5. Successful confirmation must never rehydrate stale fallback records. Explicit discard needs a durable rejection rule; actor-local deletion alone is insufficient. Repeated reopening, undo-to-baseline and completed-set edit scenarios must be tested because baseline equality can recur.
6. Pruning must not delete another actor's still-valid edit using a stale in-memory canonical snapshot. Prefer lazy eligibility filtering, bounded age cleanup and cleanup against freshly loaded canonical data. Keep the scope proportional.
7. Simplify pending-commit behavior by disabling only the committing row, rather than allowing edits during commit and adding an async input queue. Journal writes remain synchronous and independent.
8. Reuse one native row form for both row and bar actions. Bar replaces mobile navigation only in training, retains a visible route out, handles empty workout separately, derives timer from existing absolute deadline and does not finish an empty workout.
9. Preserve 320px usability, readable labels and 48px primary/options targets. Destructive options use existing accessible Sheet. No arbitrary universal weight increments.
10. Verify immediate reload without waiting for saved UI, navigation/unmount recovery, storage failure, competing tabs, explicit discard across reopen, commit/undo recovery, removal/finish/discard, offline timer and empty/all-complete UI. Existing Chromium mobile profile is not native-device proof.

## Proportional implementation boundary
Do not implement a general event journal, cross-tab merge UI or persistent selection framework. Store current raw intent and enough revision/baseline metadata to reject stale recovery. If safe multi-actor fallback recovery begins requiring many tombstones or merge states, stop and reduce scope: deterministic preferred-record recovery plus explicit conflict is simpler than silently resolving histories.
