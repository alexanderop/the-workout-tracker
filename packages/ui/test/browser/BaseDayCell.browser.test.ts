import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import Cells from "../fixtures/_BaseDayCell.vue";
import { expectNoAxeViolations } from "../support/axe";
import { find } from "../support/dom";

const cell = (name: string) => page.getByRole("button", { name });
const dot = (name: string) =>
  getComputedStyle(find(cell(name).element(), ".ui-day-cell-dot"))
    .backgroundColor;

describe("given day cells", () => {
  it("should be native buttons named by the caller, at least 44px high", async () => {
    const { container } = await render(Cells);
    expect(
      cell("October 12").element().getBoundingClientRect().height,
    ).toBeGreaterThanOrEqual(44);
    await expectNoAxeViolations(container);
  });

  it("should be taller when it carries a weekday", async () => {
    await render(Cells);
    const tall = cell("Mon 8, one workout").element().getBoundingClientRect();
    expect(tall.height).toBeGreaterThanOrEqual(64);
  });

  describe("when a cell is selectable", () => {
    it("should expose aria-pressed and move it on click", async () => {
      await render(Cells);
      await expect
        .element(cell("October 12"))
        .toHaveAttribute("aria-pressed", "true");
      await cell("October 11").click();
      await expect
        .element(cell("October 11"))
        .toHaveAttribute("aria-pressed", "true");
      await expect
        .element(cell("October 12"))
        .toHaveAttribute("aria-pressed", "false");
      await expect
        .element(page.getByTestId("selected"))
        .toHaveTextContent("11");
    });

    it("should leave a cell that only acts without aria-pressed", async () => {
      await render(Cells);
      expect(
        cell("Mon 8, one workout").element().hasAttribute("aria-pressed"),
      ).toBe(false);
    });
  });

  describe("when a cell is today", () => {
    it("should announce the date and stay apart from the selected look", async () => {
      await render(Cells);
      const today = cell("October 13");
      await expect.element(today).toHaveAttribute("aria-current", "date");
      await cell("October 13").click();
      // Selected and today at once keeps the underlined number.
      const number = today.element().querySelector(".ui-day-cell-number");
      expect(number && getComputedStyle(number).textDecorationLine).toBe(
        "underline",
      );
    });
  });

  it("should mark a day with activity by color, not by a label alone", async () => {
    await render(Cells);
    expect(dot("October 11")).not.toBe(dot("October 12"));
  });

  it("should not be clickable when disabled", async () => {
    await render(Cells);
    await expect.element(cell("October 14")).toBeDisabled();
  });
});
