# Workout-first redesign

The app starts with an exercise catalog and an empty training journal. A workout becomes a historical record when the user finishes it. Repeating that record starts a new workout. Saving it as a template creates an editable plan, separate from the record.

## Data model

Templates contain a list of target sets for each exercise. Each target contains weight and repetitions. Starting a template copies those targets. Repeating a workout copies the chosen workout's values with new IDs and unchecked sets. Neither operation changes history or replaces targets with newer performance data.

Templates use one canonical per-set representation. New exports use backup version 2. The user confirmed that there are no existing users and old backup compatibility is outside this change. There is no legacy decoder or storage migration.

The alternative was to retain the old fields alongside optional per-set overrides. That would require every writer to keep summaries and targets synchronized. Independent design review selected the canonical representation. Both candidates required a finish gate for unresolved input and shared exercise selection between the page and mobile controls.

## Interaction

Workouts is the main page, with history and templates. Exercises is the searchable catalog. Progress remains available for completed training.

A new workout opens an exercise picker with search, muscle and equipment filters, and multiple selection. During training, a named exercise control selects the visible set table. The same controller selects the mobile action's target. Previous performance is a reference, not an implicit change to a planned value.

Closing an exercise panel does not dispose its input drafts. Finishing requires pending edits to be resolved. Conversion to a template opens an editor so the user can remove skipped sets and adjust targets before saving.

## Verification and delivery

The project forbids automated tests unless separately requested. This change uses type checking, linting, direct browser interaction, and independent code review. An old-format browser journal was captured before implementation. Compatibility verification was dropped after the user clarified that there are no existing users. The new flow is checked on a fresh local origin.

The work runs in an isolated Git worktree and lands through one pull request. Available agents share the parent model. The host rejected a third design runner because it exhausted agent thread slots, so two design candidates and an independent judge were used. This provides independent review, not model diversity. Native browser tools replace the unavailable Cursor control-ui tool. Direct diff review replaces the unavailable deslop tool. Local reviewers replace unavailable Cursor cloud reviewers.
