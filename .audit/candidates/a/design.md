# Aggregate snapshot candidate

## Problem

A lifter needs a session that survives reloads, works offline, and cannot finish twice. A maintainer needs one place to understand workout invariants. This greenfield PWA has one local owner but may be open in several tabs. One active session is a deliberate product invariant. Sharing this session is necessary; different tabs must not silently overwrite each other.

## Usage (caller's view)

```ts
const workouts = openWorkouts({ databaseName: 'form-workout', now: Date.now, id: crypto.randomUUID })
const stop = workouts.subscribe(view => {
  if (view.kind === 'ready') state.value = view.snapshot
})
// Called after the initial ready state.
await workouts.execute({ type: 'start', routineId }, state.value.revision)
```

```ts
const result = await workouts.execute({
  type: 'set-values', sessionId, exerciseId, setId, weightKg: 60, reps: 8,
}, state.value.revision)
if (result.kind === 'conflict') announce('Updated in another tab. Review your values and try again.')
```

```ts
await workouts.execute({ type: 'finish', sessionId }, state.value.revision)
const backup = await workouts.exportBackup()
const imported = await workouts.importBackup(await file.text(), state.value.revision)
```

The UI keeps draft numeric text locally. Blur or Enter submits a complete field edit. Completed-set toggles submit explicit desired state. Controls show saving until the database transaction commits. Successful results contain the committed view. Subscription handles initial loading and subsequent writes from every tab.

## Shape

Four ownership modules form the complete non-UI architecture.

1. `domain.ts` owns readonly exercises, routines, sessions, the aggregate, the pure reducer, and derived history/progress. Session exercise names and targets are copied when a workout starts. Past records never depend on a later routine edit. This follows Model the Domain.
2. `workouts.ts` owns the Dexie database, transaction commands, backup parsing/merging, revision handling, and subscriptions. Its public object exposes execute, subscribe, exportBackup, importBackup, and close. Boundary Discipline puts numeric limits, unknown persisted values, JSON shape, reference integrity, version, unique IDs, and import-size limits here.
3. `useWorkouts.ts` owns Vue integration, subscription disposal, loading/error state, saving state, and announcement messages. It adapts domain snapshots to Vue; it does not mirror workout rules.
4. `App.vue` plus screen components own navigation, input drafts, focus, formatting, installation UI, and design tokens. Vite PWA configuration owns the app shell cache at build time.

The aggregate stores exercise and routine records keyed by ID, one nullable active session, completed sessions keyed by session ID, and settings. All common reads are direct lookup or a linear fold over completed sessions. Progress is derived from completed sets only; it is never written as a second source of truth. History sorts completed snapshots by finish timestamp. No event log or state framework is needed.

A Dexie readwrite transaction reads the singleton record, compares its revision with the caller's revision, validates and reduces the command, and writes the entire next aggregate with revision incremented once. All readwrite transactions covering that object store serialize across tabs. Dexie liveQuery drives subscriptions. A stale mutation returns a conflict and latest view; it never rebases destructive edits silently. A local promise queue serializes UI commands, but does not replace database revision protection. Time and generated IDs enter the reducer as explicit values, following Make Dependencies Explicit.

Finishing removes the active session and inserts the completed snapshot in the same atomic write. A repeated finish for an already completed session returns that completion without mutation, even when the submitted revision is stale. Set completion carries a boolean, not toggle semantics. It starts rest only when changing incomplete to complete, preventing retry from resetting the timer. These choices apply Make Operations Idempotent. Undo clears only a rest timer belonging to that set. Rest stores a deadline and originating set ID; remaining time is derived from wall-clock time after reload or visibility changes. Timers are advisory and do not mutate the workout when they expire.

Backup import defaults to additive merge. Exact duplicates are ignored. Differing records sharing IDs produce a conflict report and no write. A backup with another active workout conflicts if this installation already has a different active workout. Existing settings remain local. Validate the whole file before entering a transaction and recheck the revision inside it. Export reads a committed snapshot and serializes a versioned envelope. Unsupported or corrupt persisted data produces a recovery state with raw export available; startup never silently resets it.

Storage errors preserve the current confirmed UI view and input drafts. No optimistic success is shown. Reload first loads the persisted snapshot before offering start. The service worker caches application assets and navigation fallback; user data stays in IndexedDB. Update activation is deferred while a workout is active.

## Synthesis decision

Candidate A is proposed as a base for a deliberately small personal app. Arena selects the final base separately.

## Tradeoffs accepted

- We accept copying the aggregate on each committed edit in exchange for one atomic invariant boundary and straightforward backup consistency. This should be revisited if real stored histories make input persistence observably slow.
- We accept rejecting unrelated stale writes in exchange for avoiding field-level merge rules and lost edits.
- We accept a thin explicit dependency object in exchange for deterministic time and ID behavior without adding a container or Effect runtime.

## Alternatives considered

Normalized Dexie tables reduce write amplification and make large history queries cheaper. They also spread complete-session and backup atomicity across several tables and expose more repository machinery unless a transaction module hides it. A durable event log permits replay and provenance but introduces migrations for event versions, projection recovery, and compaction that this product does not need.

## Open questions and risks

Will measured aggregate write latency justify splitting immutable history into its own table? Does the product eventually need simultaneous independent active workouts? Both are future evidence questions, not implementation blockers. The selected design explicitly supports one active workout today.

## Next implementation step

Implement the reducer with start, edit, complete, undo, and finish behavior, then prove cross-tab revision rejection against the real Dexie adapter.

## Candidate phase record

- Ground. Greenfield integration grounding is skipped; the supplied brief defines the app boundary.
- Sketch. Complete in this candidate package.
- Agree. Root arena owns selection; no human checkpoint requested.
- Implement. Skipped for candidate scope.
- Scrap. Root implementation will revisit the shape if repeated friction appears.

The red-flag screen found no temporal modules or pass-through persistence wrappers. The Vue adapter must own subscription lifecycle and confirmed-versus-draft state to retain its separate purpose.
