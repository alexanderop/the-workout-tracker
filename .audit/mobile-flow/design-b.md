# Candidate B: synchronous actor-scoped draft journal

## Problem
Confirmed workout snapshots use strict schemas and a single global CAS revision. Per-keystroke drafts must survive immediate interruption without becoming completed results or contending with confirmed commands. SetRow currently holds invalid/intermediate raw text and a canonical baseline for stale-tab protection; both must move behind one capability while preserving old database and backup readability.

## Usage (caller’s view)
Composition injects a draft journal independently from confirmed storage:

```ts
const drafts = createBrowserDraftJournal({ storage: window.localStorage, makeId: () => crypto.randomUUID() });
const workouts = createWorkouts(/* existing confirmed storage dependencies */);
// App props receive workouts and drafts, or composition exposes both as one runtime value.
```

App session UI creates one controller outside conditionally mounted rows:

```ts
const training = useTrainingSession({ workouts, drafts });
// Current/next identity and all row inputs come from this controller.
const row = training.row(exercise.id, set.id);
training.edit(row.key, { weight: event.target.value }); // updates UI and synchronously persists
await training.commit(row.key); // parses, rechecks canonical baseline, executes existing set-entry
```

Recovery and action bar consume the same capability:

```ts
training.useSavedValues(row.key); // explicit draft discard, never hidden behind generic Reload
await training.undoLastLog();
training.selectSet(row.key);
// Bar derives pending row, running pause, or all-complete from canonical snapshot and selection.
```

## Shape

```ts
type SetKey = Readonly<{ sessionId: string; exerciseId: string; setId: string }>;
type RawSetValues = Readonly<{ weight: string; reps: string }>;
type CanonicalSetBase = Readonly<{ weightKg: number; reps: number; completed: boolean }>;
type DraftRecord = Readonly<{
  version: 1; key: SetKey; actorId: string; editId: string;
  values: RawSetValues; base: CanonicalSetBase; revision: number;
  editedAt: number;
}>;
type DraftWriteResult = { kind: 'saved' } | { kind: 'unavailable'; message: string };
interface DraftJournal {
  read(key: SetKey): readonly DraftRecord[];
  write(record: Omit<DraftRecord, 'actorId' | 'editId' | 'version' | 'editedAt'>): DraftWriteResult;
  discard(key: SetKey): DraftWriteResult;
  prune(active: ActiveSession | null): void;
}
```

The adapter creates a fresh actor ID on every document boot. Each actor writes separate localStorage keys such as `form:draft:v1:<session>:<exercise>:<set>:<actor>`. Unlike one shared JSON blob, independent tabs do not read-modify-write each other’s records. A sessionStorage preferred actor hint may improve reload restoration, but is not writer identity: opener-cloned sessionStorage cannot cause actor collision. On reload/reopen, read boundary selects own preferred record first, otherwise most-recent compatible candidate, and exposes differing alternatives rather than merging raw numbers. A recovered record is copied under current actor when first edited; old actor remains read-only. Tie-break equal timestamps using stable edit IDs. Read validates JSON, bounded strings (e.g. 64 characters), identifiers and finite revision/time before publishing typed data, per boundary-discipline.

The controller owns raw rows keyed by stable IDs and subscribes to canonical snapshot changes. It compares stored baseline against current canonical set. Equal baseline allows rebase to current global revision, preserving existing unrelated-write behavior. Different baseline yields visible conflict: raw remains visible but commit requires use-saved-values or intentional re-entry after explicitly resolving. During commit, existing CAS still closes race after comparison. If draft equals newly confirmed canonical values, mark clean. Never erase input before acknowledged successful confirmed write. While confirmed command is pending, inputs may remain editable; capture editId and only clear the matching version after success. Alternatively disable only that committing row for the brief operation, matching current UI, which avoids introducing a queue.

Persist every input synchronously: no debounce, pagehide flush or async write gap. Memory updates first; localStorage throw leaves draft in memory plus explicit ‘not saved on this device’ error. Do not claim durable success. Storage unavailable does not block typing or confirmed storage operations. Draft writes never call useWorkouts.run, whose busy guard drops commands.

Cleanup ignores/removes records for absent active session/set, completed sessions and identical confirmed raw values. Discard is actor-scoped plus a local rejection marker for fallback records, preventing immediate re-import after explicit use-saved-values. Other actors’ records are not mutated while session remains active. Set completion makes old baseline records incompatible; present newest canonical value by default after confirmed completion, retain conflict only for already visible touched rows. Record count/age pruning bounds orphaned actors. These recovery rules must be concentrated in the journal/controller rather than callers knowing key formats.

Module map:
- `features/workouts/drafts.ts`: raw draft model, validation/reconciliation helpers and port, no ambient browser APIs.
- `features/workouts/adapters/browser-drafts.ts`: localStorage access, key encoding, actor identity, parsing/pruning; injected through composition.
- `features/workouts/ui/useTrainingSession.ts`: one Vue controller for selection, raw state, commit/conflict, last-log undo.
- `SetRow.vue`: controlled raw input and select/edit/commit/options events; form ID allows bar submit without duplicate validation.
- `App.vue`: training bar/back route, options sheet and confirmation, presentation only.
- `style.css`: 48px targets, >=11–12px supporting text, current-row styling, responsive bar safe-area/keyboard clearance.

Undo stores logged set identity and acknowledged canonical value/revision. It verifies unchanged set before completed:false; existing domain clears matching rest. Hide/invalidate undo after remote change, new session, removal or subsequent unrelated undo target change. Do not revert all snapshot state.

The action bar has pause / incomplete set / completed plan / empty session states. Empty session opens exercise picker. Focus and semantic select button choose current set; successful log advances to next incomplete. Current row owns an HTML form with id, bar submit button references it; preventDefault dispatches controller commit. Main nav disappears only on active training page, replaced by visible Back to workouts. Existing summary remains on desktop and avoids duplicate mobile timer actions. Accessible options uses existing Sheet, preserving focus/escape and existing destructive confirmation.

## Synthesis decision
Pending root comparison; primary differentiator is separate synchronous actor-scoped persistence, unchanged canonical schemas and no async interruption gap.

## Tradeoffs accepted
- We accept synchronous tiny writes on input in exchange for immediate interruption durability; cap payload and measure typing responsiveness.
- We accept drafts being excluded from existing backup/export in exchange for unchanged backup v1 and confirmed-history semantics; explain exports preserve confirmed work.
- We accept a small recovery journal and stale-record pruning in exchange for avoiding shared snapshot revision contention.
- We accept reopened drafts may need conflict recovery when another tab changed canonical set; never silently overwrite.
- We accept memory-only editing with explicit failure message when localStorage is unavailable.

## Alternatives considered
1. Extend confirmed snapshot with active drafts. Hides storage and atomic completion cleanup well, but exposes global revision/contention to every keystroke, requires queue semantics and backup/schema compatibility changes, and async interruption flush remains a separate obligation. More coupling for this requirement.
2. Separate IndexedDB draft table. Better large-data storage and transactional draft consumption but async keystrokes can be lost immediately before reload/close unless journal or explicit pending-save UI is added. Caller must account for asynchronous persistence; a localStorage write-ahead journal plus IndexedDB is excessive for two short strings per set.
3. Persist current whole form in one localStorage key. Small API but shared read-modify-write loses other tabs’ drafts; rejected by per-actor shared-state principle.

## Open questions and risks
Can storage write cost stay negligible with bounded two-field records on target devices? Can same-set alternative actor drafts be presented without creating noisy recovery prompts? These should be resolved by tests and UI behavior before broadening the journal API. Generic Reload must not mean silently discard durable input; use explicit latest-values action.

## Next implementation step
Build the injectable browser draft journal and tests for immediate reload, cloned actor hints, unavailable storage and conflicting records, then make SetRow controlled through one session controller.
