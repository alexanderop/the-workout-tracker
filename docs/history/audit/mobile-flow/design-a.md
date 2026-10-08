# Candidate A: active snapshot owns draft values

## Problem

A raw edit currently belongs to a mounted row; navigation loses it. The app already has a complete transactional snapshot, pure reducer, corruption recovery, backups and competing-tab CAS. Extend that coherent boundary with active-only drafts rather than introducing a second database whose lifecycle can disagree with confirmed sets. Existing storage data and backups must remain readable, and rapid autosave must not reuse the current run function that drops operations while saving.

Phase tracking: Ground complete; Sketch complete in this candidate; Agree remains opt-in; Implement and Scrap belong to orchestrator.

## Usage (caller’s view)

The row renders a draft when present and emits raw strings. The app-owned session editor survives row unmounts; its edit method immediately keeps the text in reactive memory and starts a write without a debounce.

```ts
const editor = useWorkoutEntries(workouts, snapshot)
// Input event: no waiting and no disabled input during autosave.
editor.edit({ sessionId, exerciseId, setId }, { weight: input.value, reps })
// The same native row form is submitted by row button or associated training bar.
await editor.submit(target) // validates raw text, saves canonical values, clears draft
// A real resolution gesture discards a conflicting local draft in favor of storage.
editor.useSaved(target)
```

A row obtains `editor.entry(target)`, which derives displayed text and a discriminated persistence status: saving, saved, unsaved, or conflict. Storage errors never replace its local text. `submit` returns success only after the transaction; the app then selects the next open set and shows undo. Undo calls the existing completion command with the revision/result baseline captured from successful submission; do not overwrite subsequent remote changes.

```ts
// Same validation and commit path on the selected row.
<button :form="selectedFormId" type="submit">Complete set</button>
// After success, derive next open target, or retain current exercise if desired.
const next = nextOpenSet(snapshot.active, selectedSetId)
```

## Shape

Data first:

```ts
type SetTarget = Readonly<{ sessionId: string; exerciseId: string; setId: string }>
type RawSetValues = Readonly<{ weight: string; reps: string }>
type SetBaseline = Readonly<{ weightKg: number; reps: number; completed: boolean }>
type SetDraft = Readonly<{
  id: string // fresh write identity, protects independent competing draft writes
  values: RawSetValues
  base: SetBaseline
}>
// Add only to ActiveSession, optional so old stored state/backup data decode.
type ActiveDrafts = Readonly<Record<string, SetDraft>>
// active.drafts?: ActiveDrafts

type EntryStatus =
 | { kind: 'saving' | 'saved' }
 | { kind: 'unsaved' | 'conflict'; message: string }
type DraftExpectation = Readonly<{
  base: SetBaseline
  draftId: string | null
}>

// Narrow application capability hides revision retry and serial storage detail.
function saveDraft(target: SetTarget, values: RawSetValues,
  expected: DraftExpectation): Promise<Result> { throw new Error('not implemented') }
// Extend set-entry with optional expected baseline/draft identity for guarded
// commits from this editor; old commands/tests remain accepted.
// Pure reducer handles set-draft and existing set-entry; no IO or clocks for edits.
function useWorkoutEntries(service: Workouts, snapshot: Readonly<Ref<Snapshot | null>>): {
  edit(target: SetTarget, values: RawSetValues): void
  entry(target: SetTarget): Readonly<{ values: RawSetValues; status: EntryStatus }>
  submit(target: SetTarget): Promise<boolean>
  useSaved(target: SetTarget): void
} { throw new Error('not implemented') }
```

Derived schema must bound raw strings (e.g. 32 characters each), permit empty/intermediate values, validate baseline as existing canonical numeric fields, and validate draft keys refer to current active sets. Do not allow arbitrary draft fields on completed sessions. Validation at storage/command boundaries follows boundary-discipline; arithmetic always consumes confirmed values. Literal decimal comma can be normalized only at submission; raw entry uses text with appropriate inputmode if preserving punctuation is required.

Module map:

- `domain.ts`: active draft schema, draft command, target/baseline guard, draft cleanup and commit semantics, optionally pure next-open-set selector. Existing domain remains sole invariant authority.
- `application.ts`: targeted saveDraft operation executes existing read/transform/CAS. On revision collision, retries only after reducer verifies both baseline and expected draft ID still match. Bounded retry returns a visible conflict; no blind overwrite.
- `ui/useWorkoutEntries.ts`: meaningful editor capability encapsulates local pending strings, serialized/coalesced per-target writes and statuses; instantiated once at App scope. Internal pending writes use identities to avoid old response overriding newer input.
- `ui/SetRow.vue`: inputs/events/form and status display. No persistence knowledge or revision algorithm.
- `App.vue`: one editor instance, selected stable set ID, training bar/form association, options Sheet, success/undo notice. The selection follows focus/click; derive fallback when target disappears. Persist selected ID only if trivial; draft correctness does not depend on it.
- Existing Dexie adapter/ports/composition need no new persistence surface. Existing UI barrel exports editor if needed.

Queue invariants: one draft write in flight per editor, latest pending values retained and coalesced per set; successful write updates that target's draft ID expectation. A conflicting target stops its pending writes and keeps newest local text. New snapshots can refresh untouched rows; touched rows update automatically only when their canonical baseline and draft identity remain compatible. `submit` drains pending target edit then atomically commits using latest acknowledged identity. No pending edit may execute after that commit and recreate a draft: clear/invalidate its queue generation. Navigation keeps queue alive. Removal/discard can render queued target writes invalid, and the reducer rejects them. A monotonically newer snapshot never gets replaced by an older command response.

Persisted drafts are shared as one visible current draft per set. Independent actors are not allowed to silently overwrite one another: baseline plus draft ID detects the conflict. This explicitly chooses shared visible work with compare-and-save rather than per-actor hidden copies because browser reopen has no stable tab identity. The local unresolved draft remains per editor until resolution. Interface depth is favorable: four UI operations hide queue, stale response, conflict and persistence behavior without exposing transport schemas. Avoid adding generic queue frameworks or pass-through repository wrappers.

Training presentation: show current exercise and set count, next open action, rest countdown based on existing absolute deadline, and finish only when a nonempty session has no open sets. Mobile training bar replaces bottom nav only in session view and includes route out. Native form association avoids duplicate numeric validation. Options Sheet owns destructive remove; min 48px primary and menu targets with readable labels. Inline undo uses guarded existing uncomplete semantics. Do not add arbitrary weight increments; reps +/- can be considered only if layout remains uncluttered at 320px.

## Synthesis decision

Pending orchestrator comparison; this candidate recommends snapshot-owned active drafts as the base.

## Tradeoffs accepted

- Accept more whole-snapshot writes in exchange for atomic draft/confirmation/cleanup and existing recovery/backups. Coalesce in-flight edits; do not debounce the first write.
- Accept explicit draft conflicts between tabs in exchange for never silently overwriting someone else's pending or confirmed work.
- Accept bounded retry on unrelated revision movement in exchange for keeping global CAS semantics unchanged.
- Accept old-data-readable compatibility, not old-client-readable new exports, because the old client has strict schemas. Optional fields retain current import version; document new exports require current app.
- Accept that abrupt browser/process death before asynchronous IndexedDB acknowledgment cannot be guaranteed durable. Show saving state honestly, start writes immediately, and test persistence after saved acknowledgment; do not promise synchronous storage guarantees.

## Alternatives considered

1. Separate draft persistence capability/store: leaves confirmed snapshot and backups unchanged and avoids whole-history writes per edit. However atomic commit/delete needs an expanded port and cross-store transaction, subscriptions must reconcile two data sources, and fallback localStorage adds synchronous failure/size handling. It is attractive for very large histories or per-actor journals but exposes more lifecycle complexity for this app.
2. Component-local draft plus pagehide flush: shallow change, fails navigation and process interruption, duplicates lifecycle handlers, and cannot honestly meet persistence requirement.
3. Persist raw text by immediately editing canonical numbers: avoids extra model but cannot preserve blank/partial values and would mutate completed volume before explicit confirmation. Rejected on semantics.

## Open questions and risks

- Should backup export include raw active draft text? Candidate answer: yes, because the snapshot represents recoverable active work; old-client reading is not promised.
- How should a conflicting persisted draft be resolved after reopen? Candidate answer: explicit Use saved values, preserving local conflicting text until that gesture; adapt existing Reload-based conflict test.
- Does profiling show whole-snapshot validation/storage becoming expensive with large history? If yes, choose separate transactional storage candidate before adding caches or special cases.

## Next implementation step

Implement domain draft transitions with old-snapshot parse and totals/rest/cleanup tests, then editor queue behavior with deterministic delayed storage tests before wiring the mobile form.
