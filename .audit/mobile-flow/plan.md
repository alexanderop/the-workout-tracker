# Mobile workout flow

## Workflow

- [x] Read the Principles section of poteto-mode.
- [x] Phase A: Frame.
- [x] Phase B: Design the workflow.
- [x] Phase C: Run the loop.
- [x] Phase D: Keep the audit trail.
- [ ] Phase E: Verify and hand back.

## Done predicate

Raw set drafts survive navigation and reload without becoming completed sets. Stale drafts cannot overwrite another tab's confirmed result. The active training view identifies the next set, offers a reachable primary action and pause status, and supports undo. Touch targets and essential text remain usable at narrow widths. Existing backups and offline journeys remain valid. Verification, independent review, PR checks and merge to main succeed.

## Throughput checkpoint

- Blocking first steps. Trace the current main branch, compare three design sketches, capture baseline behavior, then implement.
- Independent workstreams. Storage and UI exploration run read-only in parallel. Candidate sketches have separate output files. One worker owns the coupled implementation.
- Shared mutable state. The implementation worktree has one code writer. Drafts must not advance confirmed workout results or silently overwrite concurrent edits.
- Smallest safe decomposition. One implementation owner keeps the domain, persistence, UI and acceptance changes coherent. Root owns verification, review and publication.

## Execution

1. Ground. Trace storage and UI, then synthesize their constraints.
2. Sketch. Compare isolated candidate designs and use an independent judge.
3. Agree. Proceed under the user's autopilot authorization.
4. Implement. Capture the failing draft journey, then build and verify persistence before the training UI.
5. Scrap. Revisit the design only if verification exposes a structural mismatch.
6. Verify the production UI at narrow and desktop widths, with offline reload and tab conflicts.
7. Review comments and the complete diff independently, create a ready PR, verify its checks, and squash merge to main.

## Available tools

Use local subagents with the inherited model. Different model families and Cursor cloud agents are unavailable. Use Playwright and native browser tools instead of Cursor control-ui. Use root diff review and lint instead of unavailable Cursor deslop. GitHub CLI owns forge operations because Origin is unavailable. Physical iPhone behavior remains unverified.
