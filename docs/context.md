# Workout domain context

The Workout Tracker is a local-first journal. A fresh installation contains an exercise catalog, with no workouts or templates. Confirmed data belongs to one browser profile and origin. There are no accounts or cloud synchronization.

The [glossary](glossary.md) owns our shared core vocabulary. This document owns detailed domain rules, supporting technical terms, and product invariants. [Architecture](architecture.md) describes their implementation; [design](design.md) describes their presentation.

## Exercise and session exercise

An **exercise** is a catalog definition, represented by `Exercise`: identity, name, category (shown as muscle group), equipment, and whether it is custom.

A **workout exercise**, represented by `SessionExercise` and also called a session exercise in technical descriptions, is one exercise entry inside a workout. It has its own identity and sets, and captures the exercise name and category so later catalog edits do not rewrite the session's recorded details.

## Template and target set

A **template** is an editable plan for a future workout. Existing code calls it `Routine` and stores templates in `Snapshot.routines`; use “template” in product copy without assuming a code rename is required.

A **target set** contains planned weight in kilograms and repetitions. Templates store targets separately for each set. Starting a template copies those targets into a new workout. It does not change the template or replace its targets with recent performance. Bulk exercise configuration changes only unlogged sets. Reducing the count removes only unlogged sets and cannot go below the logged count. Changing only the count preserves existing per-set targets.

## Active workout

An **active workout** (`ActiveSession`) is the session currently being recorded. There can be at most one. It owns session exercises, sets, its start time, and an optional rest deadline. A new exercise starts with zero weight; previous performance is shown as a reference rather than applied implicitly.

**Discarding** removes the active workout without adding a history record. **Finishing** creates a completed workout with the same session identity. Finishing requires at least one logged set, and the interface requires unresolved input to be handled first.

## Editing an active exercise

Exercise options provide set count, target reps, weight, detailed set correction, notes, replacement, removal, and adding exercises. Configuration preserves logged sets and mixed targets unless bulk targets are explicitly selected.

Replacement moves only unfinished work to a fresh session exercise and fresh sets. It preserves planned repetitions and resets weight to zero. Logged sets retain their original exercise identity, values, and note. When logged sets remain, the replacement is inserted immediately after them. Otherwise it replaces the original entry in place. A fully logged exercise cannot be replaced. The 50-exercise limit also applies to a replacement that retains an original logged entry. Replacing with the same catalog exercise is rejected; existing duplicate catalog entries remain allowed.

A session exercise can have an optional note of up to 2,000 characters. Saving trims surrounding whitespace and removes empty notes. Notes appear during training and in completed workout details. Repeating a workout or saving it as a template does not copy session notes. Notes do not move to a replacement exercise.

Configuration and replacement require the exercise's numeric drafts to be saved or discarded first. Note saves are independent of numeric drafts. Each editor saves against its opening revision and retains input on failure. Temporary note and configuration input becomes durable only after Save. Explicitly confirmed removal deletes the exercise, its logged sets, and its input drafts.

## Completed workout

A **completed workout** (`CompletedSession`) is a finished session in history. Repeating it creates a new active workout with fresh identities, copied weights, planned repetition targets, and unchecked sets. Saving it as a template creates a separate editable plan. Neither operation mutates the historical record.

## Set, logged set, and volume

A **workout set** (`WorkoutSet`) has an identity, weight, repetitions, a `completed` flag, and an optional positive `targetReps` value. New and edited sets preserve their planned repetitions separately from recorded repetitions. Older sets without that field remain readable; their saved positive repetitions provide the initial target. A logged zero-repetition set records an attempted set and contributes zero volume. Unlogged sets require positive repetitions. A **logged set** has that flag enabled. History and progress totals count logged sets only; volume is the sum of weight multiplied by repetitions for those sets.

The active workout exposes weight and repetitions in each set row. Its check button logs an unfinished set, saves a changed logged set, or undoes an unchanged logged set. Corrections do not restart rest. Clearing is explicit and restores the repetition target. Entering a number, confirming a numeric editor, logging a set, and finishing a workout are distinct actions. Confirming the numeric editor updates the containing input draft; it does not mark a set logged. Cancel leaves the prior input unchanged.

## Draft

A **draft** is recoverable raw weight or repetition input, separate from the confirmed workout snapshot. Drafts survive page navigation and can recover after reload. They may be incomplete or invalid and do not contribute to totals or backups.

A draft retains the saved values it was based on. If those values change, the interface asks the user to keep their input against the latest state or adopt the saved values. Recovery failures leave the input visible and report that it may be lost when the page closes. See [training drafts](architecture.md#training-drafts) for revision and acknowledgement rules.

## Snapshot, revision, and conflict

A **snapshot** (`Snapshot`) contains catalog exercises, templates, the optional active workout, completed workouts, settings, and a revision.

A **revision** identifies the confirmed state used as the basis for a change. A **conflict** means that state changed before the write could be accepted. Conflicts require an explicit outcome; they must not silently overwrite another tab's work. Transaction and lifetime rules belong to the [storage contract](architecture.md#storage-contract).

## Rest

**Rest** is a deadline associated with a source set, not a counter advanced once per second. Reloading or backgrounding the app does not extend it. Remaining time is derived from the deadline and current time.

## Backup and recovery export

A **backup** is versioned JSON containing confirmed workout data. The current format is version 2. Raw drafts are excluded. Import restores an empty journal with the default catalog and preferences or merges compatible records atomically; duplicate records are skipped, conflicting identities are rejected, and local settings are preserved during a merge. Import cannot create two active workouts and is not multi-device synchronization.

A **recovery export** preserves unreadable stored data for recovery. It does not imply that the data is a valid importable backup. The app must not clear unreadable data silently. Legacy snapshots and version 1 backups have no current migration path.

## Delete all data

Settings can delete the journal in this browser after explicit confirmation. It removes completed workouts, the active workout, templates, custom exercises and input drafts, and restores default preferences and the built-in exercise catalog. Downloaded backup files and data on other devices are unaffected. The confirmed snapshot retains an increasing revision so older tabs cannot overwrite the deletion. An empty default journal can restore a backup even after deletion.

Confirmed data and input drafts use separate storage systems. If draft cleanup fails after the journal was deleted, the app reports that partial outcome and offers retry. Retrying still checks the reviewed revision, so another tab's newer changes require a fresh confirmation. Nonpersonal revision markers remain to prevent stale tabs from recreating deleted drafts.
