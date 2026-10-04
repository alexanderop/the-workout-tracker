# Workout domain context

The Workout Tracker is a local-first journal. A fresh installation contains an exercise catalog, with no workouts or templates. Confirmed data belongs to one browser profile and origin. There are no accounts or cloud synchronization.

This document owns domain terminology and product invariants. [Architecture](architecture.md) describes their implementation; [design](design.md) describes their presentation.

## Exercise and session exercise

An **exercise** is a catalog definition, represented by `Exercise`: identity, name, category (shown as muscle group), equipment, and whether it is custom.

A **session exercise**, represented by `SessionExercise`, is one exercise entry inside a workout. It has its own identity and sets, and captures the exercise name and category so later catalog edits do not rewrite the session's recorded details.

## Template and target set

A **template** is an editable plan for a future workout. Existing code calls it `Routine` and stores templates in `Snapshot.routines`; use “template” in product copy without assuming a code rename is required.

A **target set** contains planned weight in kilograms and repetitions. Templates store targets separately for each set. Starting a template copies those targets into a new workout. It does not change the template or replace its targets with recent performance.

## Active workout

An **active workout** (`ActiveSession`) is the session currently being recorded. There can be at most one. It owns session exercises, sets, its start time, and an optional rest deadline. A new exercise starts with zero weight; previous performance is shown as a reference rather than applied implicitly.

**Discarding** removes the active workout without adding a history record. **Finishing** creates a completed workout with the same session identity. Finishing requires at least one logged set, and the interface requires unresolved input to be handled first.

## Completed workout

A **completed workout** (`CompletedSession`) is a finished session in history. Repeating it creates a new active workout with fresh identities, copied set values, and unchecked sets. Saving it as a template creates a separate editable plan. Neither operation mutates the historical record.

## Set, logged set, and volume

A **workout set** (`WorkoutSet`) has an identity, weight, repetitions, and a `completed` flag. A **logged set** has that flag enabled. History and progress totals count logged sets only; volume is the sum of weight multiplied by repetitions for those sets.

Entering a number, confirming a numeric editor, logging a set, and finishing a workout are distinct actions. Confirming the numeric editor updates the containing input draft; it does not mark a set logged. Cancel leaves the prior input unchanged.

## Draft

A **draft** is recoverable raw weight or repetition input, separate from the confirmed workout snapshot. Drafts survive page navigation and can recover after reload. They may be incomplete or invalid and do not contribute to totals or backups.

A draft retains the saved values it was based on. If those values change, the interface asks the user to keep their input against the latest state or adopt the saved values. Recovery failures leave the input visible and report that it may be lost when the page closes. See [training drafts](architecture.md#training-drafts) for revision and acknowledgement rules.

## Snapshot, revision, and conflict

A **snapshot** (`Snapshot`) contains catalog exercises, templates, the optional active workout, completed workouts, settings, and a revision.

A **revision** identifies the confirmed state used as the basis for a change. A **conflict** means that state changed before the write could be accepted. Conflicts require an explicit outcome; they must not silently overwrite another tab's work. Transaction and lifetime rules belong to the [storage contract](architecture.md#storage-contract).

## Rest

**Rest** is a deadline associated with a source set, not a counter advanced once per second. Reloading or backgrounding the app does not extend it. Remaining time is derived from the deadline and current time.

## Backup and recovery export

A **backup** is versioned JSON containing confirmed workout data. The current format is version 2. Raw drafts are excluded. Import restores an untouched installation or merges compatible records atomically; duplicate records are skipped, conflicting identities are rejected, and local settings are preserved during a merge. Import cannot create two active workouts and is not multi-device synchronization.

A **recovery export** preserves unreadable stored data for recovery. It does not imply that the data is a valid importable backup. The app must not clear unreadable data silently. Legacy snapshots and version 1 backups have no current migration path.
