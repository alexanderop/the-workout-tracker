# UI library implementation

- [x] Read the Principles section of the poteto-mode skill.
- [x] Phase A: Frame
- [x] Phase B: Design the workflow
- [x] Phase C: Run the loop
- [x] Baseline and reference contract
- [x] Build Button, Input/Field, Dialog and consumer gallery
- [x] Verify behavior, accessibility, and screenshots
- [x] Independent review and fixes
- [x] Phase D: Keep the audit trail
- [ ] Phase E: Verify and hand back
- [ ] Opening a PR

## Throughput checkpoint

- Blocking first steps. Ground source, run baseline, pin reference, compare designs.
- Independent workstreams. Read-only design candidates write separate files. One implementation owner owns coupled component, tests, and gallery work.
- Shared mutable state. Only the implementation owner edits product files until it returns. Parent owns audit files.
- Smallest safe decomposition. One feature owner avoids simultaneous edits to tokens, exports and tests.

## Architect

- [x] Ground
- [x] Sketch
- [x] Agree
- [x] Implement
- [ ] Scrap. Only if evidence rejects the design.

## Arena

- [x] Frame
- [x] Fan out
- [x] Cross-judge
- [x] Pick
- [x] Graft
- [x] Verify

## Done predicate

The first agreed library increment ships independent composed Button, Input/Field, Dialog, semantic theme tokens, a runnable gallery, pinned upstream contracts and catalog, meaningful behavior/a11y/visual Browser Mode tests, unchanged Sheet consumers, full local verification, independent review, and an attached open PR. Later catalog waves remain explicitly tracked. No merge or deployment.

## Grounding

UI exports source and scoped styles. Legacy Sheet plus five tokens is used by six workout dialogs. Keep its current contract and tokens. New components must work without workout reset or Tailwind. Vue 3.5, Reka 2.10.5, Vitest 5, browser-vue 3.1, Playwright provider already installed. Package boundaries require declared dependencies and public exports. Root build currently builds only workout; gallery needs explicit build check. CI is Ubuntu, local host macOS. Portals need theme tokens inherited at document level or an explicit target.

## Design candidate contract

Produce a compact design package for the done predicate with usage-first API, types, files, state ownership, test plan, tradeoffs, and rejected alternative. Read architect runner-prompt and rationale-template under bundled aop-mode upstream skills. No implementation. Compare at least two distinct shapes among candidates. Rubric for parent: reference API fidelity, a11y and native form semantics, style and portal isolation, maintainability, reproducible verification.
