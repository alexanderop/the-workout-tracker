import axe from "axe-core";
import { expect } from "vitest";

// Runs axe against the rendered DOM. An incomplete result means axe could not
// decide, which a controlled fixture should never produce, so it fails too.
// Known issues are named rule IDs that must still occur; once fixed, the test
// fails until the exception is removed.
export async function expectNoAxeViolations(
  context: Element,
  { knownIssues = [] }: { knownIssues?: readonly string[] } = {},
) {
  const results = await axe.run(context);
  const violations = results.violations.filter(
    (result) => !knownIssues.includes(result.id),
  );
  expect(violations.map(describeResult)).toEqual([]);
  expect(results.incomplete.map(describeResult)).toEqual([]);
  for (const id of knownIssues)
    expect(
      results.violations.map((result) => result.id),
      `${id} no longer occurs; remove it from knownIssues`,
    ).toContain(id);
}

function describeResult(result: axe.Result) {
  return `${result.id}: ${result.nodes.map((node) => node.target.join(" ")).join(", ")}`;
}
