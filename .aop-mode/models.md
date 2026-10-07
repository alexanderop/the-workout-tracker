# AOP model configuration

Project-local choices for explicitly invoked AOP workflows. These override skill
model defaults; they do not activate AOP or change the parent chat model.

# budget: medium (high)

## Roles

feature, refactoring: gpt-6.1-sol
bug-fix: gpt-6.1-sol
perf-issue: gpt-6.1-sol
hillclimb: gpt-6.1-sol
judgment and prose: gpt-6-astra
hardest tasks: gpt-6-astra
how explorer: gpt-6.1-sol
how explainer: gpt-6-astra
why investigators: gpt-6.1-sol
why synthesizer: gpt-6-astra
reflect tooling: gpt-6.1-sol
reflect judgment, divergent, synthesizer: gpt-6-astra
arena runners: gpt-6.1-sol, gpt-6-astra, gpt-6-sol
arena cross-judge pool: gpt-6-astra, gpt-6.1-sol, gpt-6-sol
swarm workers: gpt-6.1-sol
architect runners: gpt-6.1-sol, gpt-6-astra, gpt-6-sol
interrogate reviewers: gpt-6-astra, gpt-6.1-sol, gpt-6-sol

## Codex invocation

Pass the role's identifier through the supported `model` override and set
`reasoning_effort: "high"` separately. Do not append an effort suffix to the model
identifier. Panel entries each receive one agent; preserve their count.

For a model override, use `fork_turns: "none"` when the host's full-history fork
cannot accept overrides. Supply the task, scope, relevant files, and review rubric
explicitly. Give independent reviewers the source and evidence to assess, without
telling them the desired verdict.

For cross-judging and independent audit-trail review, choose an available model
from the cross-judge pool that differs from the model whose work is being reviewed.
Prefer `gpt-6-astra` for work produced by `gpt-6.1-sol`; prefer `gpt-6.1-sol` for work
produced by `gpt-6-astra`. Do not silently inherit the parent for these reviews.

Check the host's exposed models and tool schema at invocation time. If a configured
model is unavailable, use another supported pool member that meets the review
requirement and disclose the substitution. If no distinct model or override is
available, disclose that specific limit. If the author's model is unknown, report
that diversity is unverified rather than guessing its identity.

A different model identifier does not by itself prove a different model family or
provider. If an upstream workflow requires a different family and the host cannot
supply one, keep that requirement marked unmet; a different-model review is a
useful disclosed fallback, not proof of cross-family review. Report requested
models separately from host-confirmed identities when confirmation is absent.
