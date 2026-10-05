# Finish boundary correction — 2026-10-05

## Repeated mistake

Unsaved-edit protection was implemented in individual controls, leaving other finish paths able to bypass it. Commit `93ea712` added explicit name editing and page-level protection. Commit `1ed3216` then moved the name draft into the workspace and added protection to the mobile dock and finish dialog. Those fixes still exposed raw workspace and training command paths that could finish with an unsaved name; the raw workspace path also skipped the training controller's numeric-draft checks.

Reviewed recent commits and their diffs, current agent instructions, source workaround markers, and repository pull-request review comments (the API returned none). This correction targets the repeated finish-boundary class; it does not infer new rules from single occurrences or duplicate commits on other branches.

## Enforcement level

Architecture: both public workspace command paths now converge on the shared name check, and workspace finish commands pass through the existing training journal checks. Explicit revision expectations survive that routing. The service available to consumers exposes only backup and deletion operations, removing its raw command bypass at runtime and in its inferred TypeScript type.

Architecture is the highest level in the correction hierarchy, so no new lint rule is needed. Unsaved state changes at runtime; types alone cannot decide whether finishing is currently allowed. Existing disabled controls provide feedback while command-boundary regressions protect the actual state transition. The current ownership contract is in [Active workout integration](../architecture.md#active-workout-integration).

## Observed proof

The new `workspace-finish.test.ts` exercises both public runners with unsaved names, numeric drafts, newly arrived journal drafts, and stale revisions. Successful saves and finishes are also asserted, so simply returning null cannot satisfy the suite. Another assertion checks that the raw executor is absent.

Temporarily restoring `useWorkoutWorkspace.ts`, `useWorkouts.ts`, and `useTrainingSession.ts` from real commit `1ed3216` produced **6 failing and 3 passing tests**:

- Both runners finished despite an unsaved name.
- The workspace runner finished despite local numeric input or newly arrived journal input.
- The training runner ignored an explicit stale revision.
- The exposed service still included the raw executor.

The corrected implementation passed all nine tests. `pnpm test:unit` passed all 65 tests across the UI and workout workspaces. CI already runs that same command in `.github/workflows/verify.yml`; `pnpm verify` remains type checking and linting only. This is local controller and in-memory adapter evidence, not browser, deployed CI, or cross-tab browser proof.
