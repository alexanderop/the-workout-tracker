# Candidate C: independent draft journal and session controller

## Problem
Confirmed workout data uses a strict snapshot schema and revision-checked command pipeline; raw input needs interruption recovery without changing completion or causing a canonical revision on every keystroke. The command runner drops concurrent calls while saving, so it cannot carry autosave. Keep the confirmed snapshot/backup format intact and introduce a narrowly scoped draft capability in its own IndexedDB database using the existing Dexie dependency.

## Usage (caller's view)
```ts
// Composition root; ambient storage and actor creation stay here.
const drafts = createIndexedDbDraftJournal({ databaseName: 'form-workout-drafts', actorId });
const session = useTrainingSession({ workouts, drafts });

// SetRow: controller owns recoverable raw strings; row retains native validation.
const row = session.row(setIdentity);
row.edit({ weight: event.target.value });
await row.complete(); // existing canonical command, then conditional journal cleanup

// App: the bar submits this row's native form; no second validation path.
const action = session.action; // set | rest | finish | empty
session.select(setIdentity);
await session.leave(); // drains writes before deliberate navigation
// Reload conflict action explicitly chooses confirmed values.
await row.useLatest();
```

## Shape
```ts
type SetIdentity = Readonly<{ workoutId: string; exerciseId: string; setId: string }>;
type RawSet = Readonly<{ weight: string; repetitions: string }>;
type Draft = Readonly<{
  identity: SetIdentity;
  actorId: string;
  sequence: number;
  raw: RawSet;
  baseline: Readonly<{ weight: number; repetitions: number; completed: boolean }>;
  editedRevision: number;
}>;
type Recovery =
  | { kind: 'none' }
  | { kind: 'restored'; draft: Draft }
  | { kind: 'conflict'; drafts: readonly Draft[] };
type SaveState = 'saved' | 'saving' | 'unavailable';
interface DraftJournal {
  recover(identity: SetIdentity): Promise<Recovery>;
  write(draft: Draft): Promise<void>;
  remove(identity: SetIdentity, throughSequence: number): Promise<void>;
  discardWorkout(workoutId: string): Promise<void>;
  flush(): Promise<void>;
}
```
The controller creates immutable draft records and resolves canonical baselines; the adapter owns storage validation, transaction ordering and durable records. Bound raw strings at ingress but preserve empty strings, decimal separators and temporarily invalid numbers. The controller exposes one writable row view and a derived action union rather than parallel UI flags. Native row validation remains authoritative for numeric submission.

Use records keyed by workout/exercise/set/actor and retain only the latest sequence for that actor. This is a bounded journal of current intent, not an unbounded event log. Never let two tabs overwrite each other's drafts: separate actor records, merge at recovery. Reuse an actor identity within the same tab via sessionStorage when available; copied-tab identity collisions require an instance suffix or always-new actor and explicit recovery claim. New-tab/reopen recovery chooses the sole applicable candidate; distinct candidates surface a conflict instead of relying on wall-clock last-write-wins. Keep identity generation out of pure modules.

All writes begin immediately and serialize per actor/identity without a debounce window. `flush` drains them before deliberate navigation; pagehide/visibility hooks request a flush but cannot guarantee durability after immediate process termination. Show saving until transaction completion and retain raw input on failure. The independent database does not make draft removal and canonical commit atomic: stale recovery is prevented by comparing baseline/canonical state, and cleanup tombstones or generation checks stop queued writes from resurrecting cleared edits. A completed command invalidates the controller generation before awaiting cleanup; adapter transactions delete only matching/older generations. Successful canonical save followed by cleanup failure must still display success and make the stale record ineligible for future restore.

Before completion, validate the draft against the latest canonical set baseline. Unrelated snapshot changes can rebase the revision; changes to this set produce an explicit conflict. Existing canonical compare-and-swap is still the final protection. `useLatest` deletes this actor's draft generation and resets the raw view to current confirmed values. Deletions/finish/discard invalidate controller generations and remove relevant records; recover filters identities absent from the active workout. An unavailable journal preserves in-memory editing and announces that reload recovery is unavailable rather than blocking training.

UI action derives from persisted rest deadline first, otherwise selected valid row or next incomplete row, otherwise finish only for a nonempty all-complete workout. Selection follows focus and survives route changes in the controller; optionally persist it as journal metadata. Mobile bar replaces normal nav only during training, exposes Back to workouts, and associates its submit control with the selected row's form. Reuse the existing accessible Sheet for set options/removal. Increase touch targets and label sizes while validating 320px layout. Undo is a guarded canonical command with matching-source rest cleanup. Omit weight-step shortcuts without a known per-exercise step; repetitions may gain +/- only if the layout remains clear.

Module map: workouts ports owns DraftJournal contract; persistence adapter owns Dexie draft DB and boundary parser; workouts application/session controller owns raw intent, revision conflict and selection transitions; existing SetRow/App consume controller views; composition root injects adapter. Keep pure domain unaware of browser lifecycle, DB and time. Architecture boundaries remain enforceable.

Interface depth: one journal hides DB schema, actor partitioning and ordered writes; one controller hides draft lifecycle and current-action derivation. Row callers expose only input and user intent. Avoid additional pass-through repositories or generic autosave abstractions.

## Synthesis decision
Candidate C only; final selection belongs to orchestrator.

## Tradeoffs accepted
- Accept an additional database and asynchronous writes for nonblocking typing, structured transactions and unchanged backup compatibility.
- Accept an explicit conflict when several tabs leave competing drafts for preserving both actors' intent.
- Accept that immediate OS termination can preempt a transaction for avoiding a synchronous storage dependency; ordinary navigation waits for durability.
- Accept controller integration work for one authoritative place governing restore, cleanup and active-row actions.

## Alternatives considered
- Extend confirmed snapshot with drafts: hides all persistence behind the existing repository and can commit atomically, but exposes keystrokes to global revision contention, strict backup migration and the dropping command runner. A substantial repository/runner redesign would be necessary for equivalent behavior.
- Separate localStorage capability: offers immediate synchronous persistence and a smaller adapter, useful if interruption durability is dominant. It blocks the main thread, lacks transactions, and exposes cross-tab read-modify-write risks unless independently keyed per actor. For these very small records it is a credible alternative, not intrinsically inferior.
- Keep row-local state with lifecycle hooks: smallest implementation but cannot own lifecycle across conditional row unmounts reliably, and scatters cleanup/conflict policy across components.

## Open questions and risks
- Can asynchronous durability satisfy the product expectation for immediate process termination? No browser approach guarantees OS-level durability; label saving accurately and test reload after transaction completion separately from abrupt shutdown.
- Does per-actor conflict UI justify the complexity versus a simpler per-set last-write policy? The stated stale-tab requirement favors preserving competing intent.
- Can the existing feature-boundary rules permit the controller-to-port shape without a new layering exception? Verify before implementation.

## Next implementation step
Build the journal contract and in-memory behavioral contract tests for write ordering, recovery eligibility and cleanup generations, then implement Dexie and connect one SetRow before changing the action bar.
