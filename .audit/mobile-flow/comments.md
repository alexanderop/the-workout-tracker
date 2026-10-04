# Comment-only review

Read-only scope: current diff versus origin/main plus newly added workout source/tests. Source files were read around every detected added comment. No files changed.

## Deletion candidates: 5

1. `apps/workout/src/app/composition.ts:22` — `The durable journal remains usable without a tab hint.` Delete: narrates the optional preferredWriter fallback already visible in the following createDraftJournal call. Not an external platform constraint explanation.
2. `apps/workout/src/features/workouts/adapters/browser-drafts.ts:36` — `An invalid draft must not prevent confirmed workouts from opening.` Delete: narrates the local recovery-loop catch. No public contract or unreshapeable external behavior.
3. `apps/workout/src/features/workouts/adapters/browser-drafts.ts:56` — `Recovery can still use the journal if tab storage is unavailable.` Delete: repeats the independently optional rememberWriter callback already enclosed in its own try/catch.
4. `apps/workout/src/features/workouts/adapters/browser-drafts.ts:62` — `Immutable edit keys allow acknowledgement without deleting a newer edit.` Delete: record key uses immutable draft.id and consume explicitly deletes only the passed records. The code establishes the stated property without prose.
5. `apps/workout/src/features/workouts/ui/useTrainingSession.ts:230` — `The already loaded records can still be acknowledged.` Delete: next consume(row) makes continuation evident after best-effort record refresh.

## MUST KILL flags

None. These comments are narration that can be removed without hiding an implementation constraint; no comment-dependent workaround requiring a symbol redesign was established in this scoped scan.

## Suppressions

None added or present in newly added source/test files: no eslint-disable, @ts-ignore, @ts-expect-error, prettier-ignore or comparable correctness suppressions found.

## Skips

- Hash URLs in templates are navigation targets, not comments.
- Audit Markdown is rationale/evidence documentation, not inline code commentary; outside deletion scan.
- Existing untouched comments are outside this diff scope.
- Worker may add tests after this scan; findings refer to the observed working tree.
