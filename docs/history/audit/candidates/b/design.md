# Normalized workout entities with transactional commands

## Problem

A lifter must recover every saved set after reload and finish a session exactly once. History must survive routine edits. Multiple tabs must not silently overwrite edits. The greenfield PWA needs indexed history and progress without writing an entire lifetime of workouts for every tap.

## Usage (caller's view)

```ts
const workouts = createWorkouts({ databaseName: 'form-workout', now: Date.now, newId: crypto.randomUUID })
const stop = workouts.watch({ page: 'today' }, result => { today.value = result })
const started = await workouts.execute({ type: 'start', routineId })
```

```ts
const result = await workouts.execute({
  type: 'set', sessionId: session.id, expectedRevision: session.revision,
  setId: row.id, weightKg: 60, reps: 8, completed: true,
})
if (result.ok) session.value = result.session
else showSaveFailure(result.error)
```

```ts
await workouts.execute({ type: 'finish', sessionId: session.id, expectedRevision: session.revision })
const backup = await workouts.exportBackup()
const imported = await workouts.importBackup(await file.text())
```

The component waits for successful persistence before showing a completed set. A rejected write preserves input and offers retry. The form owns unfinished input strings; the API receives finite numbers validated at its boundary.

## Shape

Four ownership modules keep call paths short.

| Module | Owns |
| --- | --- |
| `workouts/model.ts` | Domain commands, views, pure progress calculations, session transition policy |
| `workouts/database.ts` | Private Dexie rows, atomic command execution, live queries, backup validation and migrations |
| `app/workouts.ts` | One application instance, Vue subscription lifecycle, online/install/update browser capabilities |
| `ui/` | Screen composition, local form input, five-color tokens and accessible controls |

The data shape is normalized session, set, exercise, routine, and settings entities, per Model the Domain. Each set belongs to one session and stores its exercise ID plus immutable exercise-name snapshot. Session rows discriminate active and finished states. History indexes sessions by status and completion time. Sets index by session ID and exercise ID. Routine steps embed a small ordered template array. No independent table for tiny routine steps earns its cost.

The public API hides table joins, transactions, revision checks, singleton active-session coordination, migrations, backup parsing, and subscription disposal. Views expose the data a screen renders, never Dexie rows. Pure projection functions own progress definitions. Volume is completed weight times repetitions; best set is maximum completed weight with repetitions retained; no estimated one-repetition maximum is implied. Progress reads finished sessions exclusively.

Boundary Discipline places JSON schema validation, finite-number checks, string limits, timestamp bounds, and referential integrity checks at the database facade. Dexie-loaded rows are validated when opening or migrating the database. Branded IDs separate entity references. The injected clock and ID function follow Make Dependencies Explicit without a DI framework or Effect dependency.

## Lifecycle and transactions

Initialization creates starter catalog/routines only for a new database. It never creates history. The startup query finds the existing active session through a singleton metadata reference. Every set edit, add/remove exercise, completion, or timer change atomically reads the session revision, validates active status, mutates its rows, and increments the revision. Start runs in a transaction over metadata, routines, sessions and sets. If an active reference exists, it returns that session instead of creating another.

Finish updates the same session row to finished and clears the active reference in one transaction. Repeated finish returns the already-finished session, per Make Operations Idempotent. A crash rolls back the transaction or preserves the full committed state. There is no separate history insertion to duplicate. Finishing with zero completed sets returns a domain error; partial workouts are allowed and include only completed sets in totals.

Rest is persisted as an absolute deadline plus its originating set ID. Completion starts it in the same transaction. Undo cancels it only if that set owns the current timer. Rendering computes `max(0, deadline - now)` and recalculates on visibility changes. No interval writes storage. Reload resumes the timer by its deadline. Finished sessions cannot carry a running timer.

Each tab owns draft input. Canonical saved sets are genuinely shared, so transactions structurally serialize writes, per Separate Before Serializing Shared State. A stale expected revision returns a conflict with the latest session. The UI refreshes the view and asks the user to reapply their retained draft; it never overwrites silently. Dexie liveQuery invalidation propagates committed changes across tabs. Transactions, not BroadcastChannel messages or a tab lease, enforce correctness.

Backups include a version and complete normalized entities. Import validates the whole payload, maximum size, uniqueness and references before writing. Import merges nonconflicting IDs transactionally; identical records are skipped, conflicting IDs reject the entire import. Import refuses a second active workout. Export reads all relevant tables in one read transaction. No destructive replace flow is needed for version one.

## Synthesis decision

Pending root arena comparison. This candidate argues for normalized persistence with domain commands as the base.

## Tradeoffs accepted

- We accept transactional joins in exchange for small writes and indexed history.
- We accept explicit edit conflicts in exchange for preserving intent across tabs.
- We accept merge-only backup restoration in exchange for avoiding destructive replacement and data loss.
- We accept reading completed sets to compute small personal-history projections in exchange for eliminating fragile cached totals.

## Alternatives considered

A whole-app snapshot reducer offers a small interface but rewrites unrelated data and makes one revision contention domain for every setting, routine and set. An append-only event log hides retry handling well but adds replay, migration and compaction policies beyond this product's needs. Both can expose equally small APIs; normalized entities better isolate real ownership and common query patterns here.

## Open questions and risks

Can very large imported histories make the progress projection slow enough to justify a dedicated derived index after measurement? Does the product eventually need conflict resolution for editing the same routine on two devices? Neither blocks this local-only implementation.

## Next implementation step

Build the real Dexie start/edit/finish transaction slice and prove reload recovery and competing-tab conflict behavior in browser tests before adding the screens.
