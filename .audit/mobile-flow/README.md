# Mobile training evidence

The baseline production app replaced an unconfirmed weight of 82.5 with 0 after reload. `baseline.json` records the observation. `baseline-verify.log` records the pre-change verification suite.

`design.md` records the chosen design and its alternatives. `design-judgment.md` records the separate comparison. The host limited agent seats, so roles reused the available local agents and all used the inherited model. This provides separated implementation and review responsibility, not cross-model evidence.

`review-findings.md` records defects found before publication. The implementation fixes them and adds regressions. `review.md` records the subsequent source review. `decisions.tsv` records the decisions and evidence.

`probe.mjs` exercises the production app through semantic controls. It tests immediate reload, an empty raw value, a second edit after reload, tab reopening, confirmed offline reload, and narrow/reduced-height layouts. With the production preview on port 4190, run `PROBE_ENGINE=chromium node .audit/mobile-flow/probe.mjs`. Override `PROBE_URL` for another preview. `probe-results.json` and the chromium screenshots record the observed result. Preview-prefixed screenshots are intermediate layout observations, not final output.

Local WebKit could render static injected HTML but could not navigate to either unchanged or changed local HTTP pages. The Linux container also timed out before navigation. These runs are not passing product evidence. The hosted workout-webkit job must pass on the PR head. Browser tests do not prove physical iPhone keyboard placement or OS process termination.
