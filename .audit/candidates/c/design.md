# Session service candidate

## Problem

A gym user must record a set quickly and recover it after a reload, even offline. The architecture centers on a durable session. Vue renders persisted snapshots while a small service owns operations, their domain rules, and storage failures. The approved five-color system remains a presentation constraint.

## Usage (caller's view)

```ts
const workouts = createWorkoutService({ storage: dexieStorage, now: () => Date.now(), id: () => crypto.randomUUID() })
const stop = workouts.watch(result => { state.value = result })
onUnmounted(stop)

const started = await workouts.start(routineId)
if (!started.ok) showIssue(started.issue)

const saved = await workouts.editSet({ sessionId, revision, setId, weightKg: 80, reps: 8, completed: true })
if (!saved.ok) showIssue(saved.issue)

const finished = await workouts.finish(sessionId, revision)
if (finished.ok) openHistory(finished.value.id)
```

Callers do not orchestrate transactions or calculate rest deadlines. They submit explicit desired values. Pending draft input remains local Vue state and the saved indicator follows commit success.

## Shape

Five ownership modules are sufficient.

- `domain.ts` owns session/routine/exercise types, pure transitions, and progress derivation.
- `workouts.ts` owns the service, injected clock/IDs/storage, conflict handling, and user-facing issues.
- `storage.ts` owns Dexie tables, transactions, live queries, migrations, and external backup parsing.
- `useWorkouts.ts` owns one Vue subscription and presentation-level pending/error state. The composition root constructs its concrete service.
- `ui/` owns screens, navigation, accessible controls, PWA status, and the approved design tokens.

A session embeds its exercise names and set prescriptions when started. Later routine edits cannot rewrite history. `Session` is a discriminated union of active and finished states, per Model the Domain. History queries use an indexed finish timestamp; progress derives only from finished sessions. There is no separately synchronized progress store.

The service hides transactional ownership, conflict detection, restart recovery, and idempotency behind workout operations. The view receives domain snapshots plus a revision for safe writes. This is the single exposed concurrency concept. Storage schema and Dexie classes stay private, per Boundary Discipline. Time, generated identifiers, and persistence enter at construction, per Make Dependencies Explicit.

One active workout is a real shared invariant. A Dexie transaction on sessions and metadata atomically claims the singleton active-session key. Cross-tab writes compare revisions inside transactions. A stale write returns a conflict with fresh data instead of silently overwriting. This follows Separate Before Serializing Shared State because independent sessions, routines, and exercises are separate records; only the active session requires shared serialization. Dexie live queries refresh every tab after commits.

Every command awaits persistence before resolving success. Finish updates the existing session record and clears the active pointer in one transaction. Repeated finish returns the existing finished record. Set completion writes desired `completed: true`, never a toggle; repeating an already satisfied command does not restart rest. The first completion sets `restEndsAt = now + restSeconds * 1000`. Undo clears the timer only when that set owns it. The renderer derives remaining time from the deadline and current time, so background throttling and reload do not extend rest. These choices apply Make Operations Idempotent.

Startup opens and migrates IndexedDB, validates recovered records, then emits data. A failed database open produces a blocking retry screen without substituting empty state. A committed change remains saved if the page closes before its promise settles. A failed transaction leaves the previous snapshot visible with a retryable issue. Updates to the service worker are offered while idle and deferred during active sessions.

Backup import accepts a versioned JSON string with size limits, finite numeric ranges, enum checks, unique IDs, and valid cross references. Its preview reports counts before an explicit replace action. Full validation occurs before a single all-tables replacement transaction. Export takes a consistent read transaction. Import cannot race with an ongoing workout mutation because it overlaps the same transaction scopes. An imported active session is resumable. Persisted records and backup bytes cross validation boundaries; pure domain functions trust validated types.

## Synthesis decision

Pending parent arena selection. Candidate C proposes a session service with embedded session documents and explicit persistence ports.

## Tradeoffs accepted

- We accept one modest service API in exchange for components that cannot announce unsaved work as saved.
- We accept revision conflicts in the uncommon two-tab edit case in exchange for preserving both users' visible intent.
- We accept replacing a whole session document per set edit in exchange for atomic, easily exported session history. Workout records are small.
- We accept ordinary async functions and explicit result unions in exchange for fewer concepts in this local-only application.

## Alternatives considered

An Effect service with typed storage errors and scoped streams hides resource cleanup well, but still needs Dexie transactions, subscriptions, and a Vue adapter. This workload has no network retries, cancellation graph, or concurrent resource pipeline. Explicit `Result` values plus a disposer expose fewer concepts to its only caller. Reconsider Effect when actual workflows require orchestration, rather than adding it for one dependency object.

A pure aggregate reducer over the whole application makes transitions concise but exposes global state copying, backup replacement, and concurrency merging to its shell. Session-local transitions retain pure logic while limiting transaction contention and write size.

A normalized table for every set makes selective updates cheap but forces read joins, snapshotting, and finish semantics across several tables. For short workouts, its extra structural complexity earns little interface depth.

## Open questions and risks

- Will future users need simultaneous active sessions on one device? The current product assumes one, matching a single ongoing gym workout.
- Will progress require weighted assisted exercises or bodyweight metrics? This version records nonnegative external kilograms and repetitions only.
- Will mobile storage eviction require cloud synchronization later? Export/import offers a manual backup boundary, not durable cloud backup.

These are future design risks and do not block implementation.

## Next implementation step

Implement start, editSet, and finish against real IndexedDB, then verify concurrent finish, failed writes, and reload recovery through their public service calls.
