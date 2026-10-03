# Autopilot build plan

- [x] Read the Principles section of the poteto-mode skill.
- [x] Phase A: Frame
- [ ] Phase B: Design the workflow
- [ ] Phase C: Run the loop
- [ ] Ground
- [ ] Sketch
- [ ] Agree
- [ ] Implement
- [ ] Scrap
- [ ] Frame
- [ ] Fan out
- [ ] Cross-judge
- [ ] Pick
- [ ] Graft
- [ ] Verify
- [ ] Establish strict Vue/Vite types, verification commands, and a production PWA build.
- [ ] Implement and verify workout rules and IndexedDB persistence.
- [ ] Implement and verify four product screens and workout interactions.
- [ ] Verify reload recovery, backup roundtrip, and real service-worker offline behavior.
- [ ] Run independent correctness and comment reviews and resolve accepted findings.
- [ ] Phase D: Keep the audit trail
- [ ] Phase E: Verify and hand back

## Frame

Deliver a local strength-training PWA in form-workout. Keep workout-design-system as the approved reference. The product uses exactly five base colors, Inter, Lucide, quiet navigation, and 48px touch targets. Primary accent is purple #A78BFA. Other colors are #141414, #232322, #EEEEEC, and #A3A39E.

Done is observable through creating and editing routines, starting a workout, entering and completing sets, recovering it after reload, finishing it once, viewing accurate history and progress, exporting and importing a backup, and repeating the core workflow offline after first load. No fictional completed sessions appear on first use.

Scope is four primary screens, one active workout workspace, routine and exercise editors, settings and backups, one IndexedDB adapter, and one production service worker. Estimate 20 to 35 source and test files. High rigor applies to persistence, imports, and offline behavior. Visual exploration remains reversible.

## Workflow and throughput checkpoint

The critical path is architecture selection, domain and storage contracts, app integration, then offline acceptance. Three isolated architecture candidates run first. A judge compares them against data integrity, API depth, recovery, testing, and proportional complexity. Implementation fans out only after the contract is settled. Each delegate owns separate files or an isolated checkout. The root owns integration and product UI. Tests and storage adapters can be verified before the UI is complete.

Local agents substitute for cloud workers. No project model configuration exists, so all seats inherit the parent model. Cross-family review is unavailable. No scheduler is required for this foreground session. Browser interaction uses the available computer-use tools as the control-ui equivalent. Publication and a remote PR are outside this local build until a destination exists.
