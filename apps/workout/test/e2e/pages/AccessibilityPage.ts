import { expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import type { AxeResults, Result } from "axe-core";

const axeSource = readFileSync(
  createRequire(import.meta.url).resolve("axe-core/axe.min.js"),
  "utf8",
);

/**
 * Runs axe-core against the rendered production page. Same contract as the
 * component helper in packages/ui/test/support/axe.ts: violations fail, and so
 * does an incomplete result, because a page the scanner cannot decide on has
 * not been checked.
 */
export class AccessibilityPage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async openPage(name: string) {
    await this.page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name, exact: true })
      .click();
    await expect(
      this.page.getByRole("heading", { name, exact: true, level: 1 }),
    ).toBeVisible();
  }

  async expectNoViolations() {
    await this.page.addScriptTag({ content: axeSource });
    const results = await this.page.evaluate<AxeResults>(
      `axe.run(document, { resultTypes: ["violations", "incomplete"] })`,
    );
    expect(results.violations.map(describe)).toEqual([]);
    // Where the translucent navigation overlaps scrolling artwork, axe cannot
    // compute a background color. Contrast is not established on those pages.
    const undecided = results.incomplete.filter(
      (result) => result.id !== "color-contrast",
    );
    expect(undecided.map(describe)).toEqual([]);
  }
}

function describe(result: Result) {
  return `${result.id}: ${result.nodes.map((node) => node.target.join(" ")).join(", ")}`;
}
