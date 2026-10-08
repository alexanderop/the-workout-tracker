# Testing and dependency refactor

- [x] Read the Principles section of the poteto-mode skill.
- [x] Phase A: Frame.
- [x] Phase B: Design the workflow.
- [x] Phase C: Run the loop.
- [x] Extract pure draft and template rules; retain existing injected application ports.
- [x] Add deterministic factories and Node behavior tests.
- [x] Add real storage browser tests and Gherkin journeys with page objects and isolated seeding.
- [x] Connect separate commands, type checking, linting, and CI.
- [x] Review the changed implementation and run all relevant verification.
- [x] Phase D: Keep the audit trail.
- [x] Phase E: Verify and hand back.

Done means all three test commands and pnpm verify pass, production decisions have no new hidden dependencies, and app journeys exercise real saving and reload. Existing unrelated edits remain intact. No PR is requested. Delivery remains on the existing main checkout.

The previous turn settled the design. The implementation uses pure functions and existing ports, not a new controller framework or DI container. A second design competition is skipped for these concrete extractions. Workers share this checkout with disjoint file ownership because copying the mixed working tree risks losing the exact state under test. Root owns configuration and documentation. Read-only independent review follows implementation.
