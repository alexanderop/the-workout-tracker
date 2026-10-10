import axe from "axe-core";
import { expect } from "vitest";

// Same contract as packages/ui/test/support/axe.ts: axe runs against the
// rendered DOM, and an incomplete result fails too because a controlled
// fixture should always be decidable.
export async function expectNoAxeViolations(context: Element) {
  const results = await axe.run(context);
  expect(results.violations.map(describeResult)).toEqual([]);
  expect(results.incomplete.map(describeResult)).toEqual([]);
}

function describeResult(result: axe.Result) {
  return `${result.id}: ${result.nodes.map((node) => node.target.join(" ")).join(", ")}`;
}
