# Workout state and persistence

Candidate A is the selected design. The independent judge and root both preferred its atomic snapshot and small command API. Each mutation reads the current revision inside a Dexie transaction, applies one transition, and commits the new snapshot. The UI never reports success before persistence succeeds.

The implementation retains A's additive import and raw recovery export. It adopts B's refusal to finish an empty session and completed-set-only totals. It retains immutable exercise snapshots in active and completed sessions. Candidate C's extra storage interface and destructive backup replacement are excluded. Settings and routines use the same revision protection as sets.

The app has one active workout. Session IDs also identify completed records, making finish idempotent. Rest stores its deadline and source set, so reload or background throttling cannot extend the countdown. History and progress derive from completed session snapshots.

Whole-snapshot writes simplify this small local app. A future measured write-latency problem can justify separate history records. No Effect runtime is needed for one local transaction source. Explicit time and ID capabilities support deterministic tests.

## Implementation contract

`src/domain.ts` exports these readonly shapes and functions.

- Exercise has id, name, category, and custom.
- Routine has id, name, description, and exercises. Each routine exercise has exerciseId, sets, reps, and weightKg.
- WorkoutSet has id, weightKg, reps, and completed.
- SessionExercise has id, exerciseId, name, category, and sets.
- ActiveSession has id, status equal to active, name, startedAt, exercises, and rest. Rest is null or an object with setId and endsAt.
- CompletedSession has id, status equal to completed, name, startedAt, finishedAt, and exercises.
- Settings has restSeconds and autoRest.
- Snapshot has revision, exercises keyed by ID, routines keyed by ID, active, completed keyed by ID, and settings.
- Command is a discriminated union listed below.
- initialSnapshot() supplies a real exercise catalog and starter routines, with no history.
- sessionTotals(session) returns completedSets and volumeKg.
- remainingRestSeconds(active, at) returns a nonnegative integer.
- reduceWorkout(snapshot, command, inputs) returns changed, unchanged, or rejected. Inputs contain at and id, an injected ID function. The transition returns snapshot or message.

Commands have the following fields.

- start has routineId, a string or null. Null starts an empty workout called Free workout.
- set-entry has sessionId, exerciseId, setId, weightKg, reps, and completed. It atomically saves the entered values and desired completion state.
- set-values has sessionId, exerciseId, setId, weightKg, and reps. exerciseId identifies the session exercise.
- set-completed has sessionId, setId, and completed.
- add-set has sessionId and exerciseId, identifying the session exercise.
- remove-set has sessionId, exerciseId, and setId. Require at least one set per exercise.
- add-exercise has sessionId and exerciseId, identifying a catalog exercise.
- remove-exercise has sessionId and exerciseId, identifying the session exercise.
- finish has sessionId. Reject zero completed sets. Retain unfinished rows but exclude them from totals.
- stop-rest has sessionId.
- save-routine has routine, the full Routine value.
- save-exercise has exercise, the full Exercise value.
- settings has settings, the full Settings value.

`src/workouts.ts` exports openWorkouts({ databaseName, now, id }). It returns execute(command, expectedRevision), subscribe(listener), exportBackup(), importBackup(json, expectedRevision), close(). Results are {kind:'saved',snapshot}, {kind:'conflict',snapshot}, {kind:'invalid',message}, or {kind:'unavailable',message}. LoadState is {kind:'loading'}, {kind:'ready',snapshot}, {kind:'recovery',message,rawExport}, or {kind:'unavailable',message}. Subscribe initializes the database and emits ready or a failure. exportBackup returns a Promise<string>. All writes validate at the boundary. Zod supplies validation. A corrupt read never silently replaces data. Import merges complete records atomically, skips exact duplicates, rejects conflicting IDs, validates all references, and keeps local settings. Import cannot introduce two active workouts.

## Ownership

The domain/storage worker owns src/domain.ts, src/workouts.ts, and their unit and database browser tests in an isolated checkout. The root owns UI, styling, integration, PWA configuration, acceptance tests, and documentation. No delegate modifies the shared contract.
