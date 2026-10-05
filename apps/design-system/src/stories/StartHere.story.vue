<template>
  <Story title="00 Start here/Product brief">
    <Variant title="Audience and principles">
      <div class="stack">
        <p class="eyebrow">THE WORKOUT TRACKER</p>
        <h1>Log quickly. See where you stand. Notice your progress.</h1>
        <p>
          For a developer who enjoys the gym and wants a minimal workout tracker
          with fast editing, a clear overview and visible progress that
          encourages them to return.
        </p>
        <section class="pattern-card stack" aria-labelledby="brief-needs">
          <h2 id="brief-needs">What the user needs</h2>
          <ul>
            <li>Before training: review recent workouts and start quickly.</li>
            <li>
              During training: log sets and correct values with little effort.
            </li>
            <li>After training: understand what was actually completed.</li>
            <li>
              Over time: see personal progress and feel motivated to return.
            </li>
          </ul>
        </section>
        <section class="pattern-card stack" aria-labelledby="brief-principles">
          <h2 id="brief-principles">How we design</h2>
          <ul>
            <li>
              <strong>Minimal, but understandable.</strong> Keep the next action
              clear and essential controls discoverable.
            </li>
            <li>
              <strong>Fast to edit, safe to correct.</strong> Keep edits close
              to values and preserve input when saving fails.
            </li>
            <li>
              <strong>Confirm before deleting.</strong> Every delete, removal or
              discard action opens a modal naming what will be lost. Offer a
              clear way to cancel before making any change.
            </li>
            <li>
              <strong>An overview before detail.</strong> Make summaries
              scannable and set details easy to reach.
            </li>
            <li>
              <strong>Progress grounded in real training.</strong> Explain
              metrics and comparisons using completed work.
            </li>
            <li>
              <strong>Motivation without pressure.</strong> Recognize effort and
              improvement with calm, specific feedback.
            </li>
          </ul>
        </section>
        <p class="note">
          Product-owner direction, not validated user research. These principles
          guide design; they do not claim every behavior is implemented. Use the
          Docs panel for review questions and open decisions.
        </p>
      </div>
    </Variant>
  </Story>
</template>

<docs lang="md">
# Product brief

## Usage

Start here before designing a screen or choosing a component. Respect the user's
efficiency without assuming they want technical terminology or complex settings.
The full brief lives in docs/design.md. Keep this summary aligned with it.

## Variants

Consider the task before, during and after a workout, and the longer-term task of
understanding progress. Each context needs a different information hierarchy.

## States

Design for a fresh journal, active training, completed history and enough history
to make meaningful comparisons. Include interrupted work, save failures and a
return after a break. Never fabricate progress to fill an empty screen.

## Behavior

Review each design against these questions:

- Is the next action apparent at a glance?
- Can a value be edited and a mistake corrected without losing context?
- Does every deletion ask for confirmation and explain what will be lost?
- Are planned, edited and logged values distinguishable?
- Does the overview explain what was completed?
- Are progress metrics and comparison periods understandable?
- Does the experience encourage returning without guilt or pressure?

## Examples and limitations

Showing a previous completed set beside the current input can support a quick
decision. Confirming a numeric edit and logging a set remain separate actions.
A workout enters history when it is finished.

Phone use between sets, one-handed interaction and short attention windows are
working assumptions to validate. Exact progress comparisons and motivational
feedback remain design decisions. This brief does not commit the product to
streaks, badges, social features or advanced analytics.
</docs>
