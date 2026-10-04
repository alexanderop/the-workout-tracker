# Persistent input and the active training step

Use a separate synchronous draft journal as the base design. Tiny raw input records must survive an immediate reload without changing the confirmed snapshot or backup contract. Canonical commands remain the sole authority for completed sets and volume.

## Comparison

Scores range from one to five. Parent assessment, pending independent cross-judge.

| Candidate | Immediate recovery | Confirmed data safety | Compatibility | Small API | UI integration |
| --- | --- | --- | --- | --- | --- |
| A, snapshot drafts | 3 | 5 | 3 | 3 | 4 |
| B, synchronous separate journal | 5 | 4 | 5 | 4 | 5 |
| C, independent IndexedDB | 3 | 5 | 5 | 3 | 5 |

Candidate B avoids a pending asynchronous write on each keystroke. Candidate A couples drafts to the global snapshot revision and changes new backup content. Candidate C introduces asynchronous ordering and cleanup machinery for two small strings.

## Implementation contract

- Define raw string fields, set identity, canonical baseline, source revision and per-writer identity before code. Bound raw record sizes and validate persisted data.
- Keep the existing snapshot, IndexedDB and backup v1 unchanged. Inject the small draft capability from composition; domain and application remain free of browser globals. Use permitted domain, ports, application and adapter layers rather than a new top-level feature layer.
- Each writer owns separate persisted records. Reload/reopen recovers drafts. A stale baseline remains an explicit conflict even after reload. Prefer keeping conflicting intent visible over silently adopting it or dropping it.
- A successful log clears the exact submitted draft. Explicit use-saved-values must not resurrect fallback records on reload. Removal, finish and discard remove obsolete drafts. Storage failure preserves memory input and announces the lack of recovery.
- Keep the existing canonical CAS checks. No automatic overwrite of a changed target. Unrelated canonical changes may rebase only while the target baseline matches.
- One App-lifetime training controller owns row values, selected identity and undo. SetRow and the mobile bar use one native form submission path. Avoid duplicate validators and generic autosave frameworks.
- The mobile bar has current-set, pause, complete and empty states. It replaces mobile navigation during the session and includes Back to workouts. Keep input and confirmation usable in a reduced viewport.
- Use the existing Sheet for set options, with labelled removal and confirmation. Keep 48px touch controls and legible labels at 320px. A compact repetitions adjustment in the options view is acceptable; avoid guessed universal weight steps.
- Reuse the existing domain undo behavior with a guarded target baseline. No full-snapshot rollback.

## Grafts

Adopt candidate A's explicit baseline guard and removal/finish invariants. Adopt candidate C's single derived action state. Do not adopt asynchronous queues, a second database, or speculative sensor features.

## Evidence

The original production build loses 82.5 after reload and returns 0. The complete baseline verification suite passed. See baseline.json and baseline-verify.log. Physical iPhone keyboard and process termination remain outside browser automation proof.
