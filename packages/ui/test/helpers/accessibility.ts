import axe from "axe-core";
import { expect } from "vitest";

export async function expectAccessible(state: string) {
  await document.fonts.ready;
  await Promise.allSettled(
    document
      .getAnimations()
      .filter(
        (animation) => animation.effect?.getTiming().iterations !== Infinity,
      )
      .map((animation) => animation.finished),
  );
  const { violations } = await axe.run(document.body, {
    // Isolated component fixtures do not own the application's landmarks.
    rules: { region: { enabled: false } },
  });
  expect(
    violations.map(({ id, impact, help, helpUrl, nodes }) => ({
      rule: id,
      impact,
      help,
      helpUrl,
      elements: nodes.map(({ target, failureSummary }) => ({
        target,
        failureSummary,
      })),
    })),
    `Accessibility violations in ${state}`,
  ).toEqual([]);
}
