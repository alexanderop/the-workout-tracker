# Independent correctness review

Scope: source diff/new files and current tests against origin/main b4a6cb9 in mobile-workout-flow worktree. Read-only review while worker still edits. No rebuild or shared test runner started. One isolated in-memory probe evaluated actual transpiled controller/domain source against Vue refs.

## Findings

### P1 — Keep a live draft conflict sticky after the target changes

`apps/workout/src/features/workouts/ui/useTrainingSession.ts:64-72,127-131,222-232`

A live row's `recoveredStale` never changes when canonical snapshots arrive. `conflict` depends only on current baseline equality. Reproduction: A edits set from 0 to draft80; B logs unchanged canonical 0 then undoes it; A's conflict becomes true after log, false after undo. A commit then submits draft80 using latest revision and succeeds. The old intent was invalidated by confirmed transitions, but equality returning makes it silently valid again. This also differs from the deliberately conservative recovered-draft revision check.

Probe using actual controller printed:

```
conflict after rival completion true
conflict after rival undo false
command accepted after ABA { type: 'set-entry', weightKg: 80, reps: 8, completed: true, ... }
```

Persist a sticky invalidation when an observed canonical target diverges; do not clear it on a subsequent unrelated snapshot or ABA. Add live-row ABA regression, not only existing reopened ABA test. Final CAS must remain.

### P1 — Mobile Update set action currently undoes an unchanged completed set

`apps/workout/src/App.vue:1325-1327` and `useTrainingSession.ts:213`

Select a completed row by tapping its set number or input, leave values unchanged, then tap mobile `Update set`. Native form reaches commit, whose `dirty ? true : !completed` computes false. This silently changes the set back to incomplete (and clears matching rest) despite the action saying Update. Row button correctly labels this case Undo; bar should derive the same action semantics/label or not offer update without an edit. Test selected-completed clean and dirty states.

### P2 — Resuming and editing a recovered draft manufactures competing drafts

`apps/workout/src/features/workouts/ui/useTrainingSession.ts:150-153,186-196` and `adapters/browser-drafts.ts:46-53`

Type82 → reload (fresh writer recovers82) → type85 → reload. The second document writes85 but retains82 because persist filters only records owned by the new writer, and journal's owned map only knows writes in this document. The third document sees both82 and85 and shows an artificial multi-actor conflict although this is ordinary resume/edit use. Repeated reopens accumulate stale prior-document records. Choosing a recovery alternative likewise clears only in-memory alternatives, so reload reopens the same ambiguity.

On successful replacement of an explicitly adopted recovered record, acknowledge that exact predecessor while retaining genuinely competing alternatives/new immutable records. Add repeated reload/edit coverage, not just single reopen.

## Already reported / worker fixing

The post-await recovery scan used to collect/delete drafts written by another actor during canonical commit. Latest observed code moves recover before await, so no duplicate finding here. Keep the captured-record race regression.

## Coverage and limitations

- Read App, SetRow, training controller, journal adapter/schema, composition, ports/exports and current browser/unit/e2e changes.
- Confirmed snapshot and backup schemas remain unchanged; draft keystrokes use independent synchronous storage.
- Existing recovered revision mismatch blocks unseen closed-document ABA conservatively, including cleanup failure after commit/undo. Live-row behavior is the gap above.
- LocalStorage failures preserve raw input and report unsaved state; persistent recovery cannot be guaranteed when browser storage rejects operations, appropriately acknowledged.
- No claim of physical-device/iOS keyboard verification from this review.
- Line references reflect observed worktree and may move with worker fixes.
