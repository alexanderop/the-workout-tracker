# Mobile workout integration grounding

## Overview
The workout snapshot is canonical training data. SetRow currently owns transient raw input strings, so leaving the session destroys unfinished edits. Preserve those strings separately from canonical completed sets; let the existing validated command and revision-checked transaction remain the only way to complete a set. The mobile action bar should invoke that same row submission path, not introduce a second validator or writer.

## Key concepts
- Canonical snapshot: strict Zod schema, Dexie v1, backup v1, global revision. Completed canonical sets alone contribute to totals.
- Draft: scoped workout/exercise/set identity, bounded raw strings (including empty or partially typed numbers), canonical baseline/fingerprint and edited revision. A draft is not a completed set.
- Active set: stable selected identity, updated by row focus and recovered with fallback to the next incomplete set.
- Rest: persisted deadline plus originating set identity. Existing undo clears rest only when its source matches.

## How it works
SetRow submission validates its raw refs and emits values plus revision to App.logSet. useWorkouts.run invokes application.execute, the pure reduceWorkout reducer, and a transactional Dexie compare-and-swap against the single snapshot key. Keep that path and its stale-edit protection intact. Draft autosave must use a separate persistence channel: useWorkouts.run drops commands while saving, and every canonical command increments the global revision. Reusing it for keystrokes risks dropped edits and unnecessary cross-tab conflicts.

Persist drafts through injected ports/adapters, outside the canonical snapshot and backup contract. Restore before exposing editable rows; serialize/coalesce writes per identity so slower writes cannot overwrite newer strings. Preserve stale baselines instead of silently rebasing a draft after its own canonical set changes. Unrelated canonical changes may rebase as existing SetRow already does. Surface conflicts explicitly; the existing Reload action must intentionally discard the stale draft and adopt current canonical values. Prevent late autosaves from resurrecting drafts after completion or deletion. Clear drafts on successful commit, set/exercise removal, workout finish or discard, and reconcile restored drafts against the current snapshot. A fingerprint/revision guard or atomic commit must stop stale draft submission from overwriting newer results.

The mobile session action bar replaces the usual bottom navigation and retains an explicit route back to workouts. Selection follows input focus; its primary action submits the active row's native form by association, retaining browser validation and existing command behavior. During a pause show the deadline-driven remaining time plus the existing skip action; after all planned sets are complete show finish, but require a nonempty workout. Keep add-exercise available for an empty workout. Returning from another view restores a valid active identity or chooses the next incomplete set.

Move set removal into the existing accessible Sheet rather than adding another narrow destructive target. Increase target sizes and labels while checking the grid at 320px. Keep keyboard-open inputs and confirmation reachable; do not stack the action bar on top of the ordinary mobile nav. Undo must retain the canonical concurrency guard and only reverse the intended current completion.

## Where things live
- SetRow.vue: raw input state, baseline/revision protection, validation and submit events.
- App: hash navigation, conditional session mounting, global confirmations and timer/finish sheets, logSet orchestration.
- useWorkouts.run / application.execute / reduceWorkout: canonical operation orchestration and pure behavior.
- Dexie snapshot adapter: transactional canonical revision checking.
- @form/ui Sheet: accessible modal option menu and focus behavior.
- docs/architecture.md: injected dependency and feature boundary rules.
- style.css: mobile grid, tiny headings/hints, navigation and session layout.

## Verification and gotchas
Preserve existing command/domain contracts and concurrency tests. Add behavior coverage for draft reload/navigation, partial raw input, completed-set edits, successful cleanup, delayed-write cleanup races, stale-tab conflict recovery, and independent-set updates. E2E should cover the complete mobile flow and empty/all-complete states, with exact Log set / Undo set / Finish workout / Skip rest selectors deliberately preserved or updated. Existing mobile tests run an iPhone profile in Chromium: this proves responsive browser behavior, not native iOS Safari, keyboard, screen-lock or real-device behavior. Expanded @form/ui primitives are already present at main b4a6cb9; reuse them rather than recreating them.
