import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EmptyState from "../fixtures/_BaseEmptyState.vue";
import { expectNoAxeViolations } from "../support/axe";
import { find } from "../support/dom";

describe("given an empty state", () => {
  it("should name what is missing with a heading, body and action", async () => {
    const { container } = await render(EmptyState);
    await expect
      .element(page.getByRole("heading", { level: 2, name: "No workouts yet" }))
      .toBeVisible();
    await expect
      .element(page.getByText("Start your first session and it appears here."))
      .toBeVisible();
    await expectNoAxeViolations(container);
  });

  it("should hide the decorative icon from assistive technology", async () => {
    const { container } = await render(EmptyState);
    expect(
      container
        .querySelector(".ui-empty-state-icon")
        ?.getAttribute("aria-hidden"),
    ).toBe("true");
  });

  it("should leave the action operable", async () => {
    await render(EmptyState);
    await page.getByRole("button", { name: "Start workout" }).click();
    await expect.element(page.getByTestId("created")).toHaveTextContent("1");
  });

  describe("when compact with a custom heading level", () => {
    it("should render that level without a panel surface", async () => {
      await render(EmptyState);
      const heading = page.getByRole("heading", {
        level: 3,
        name: "No results",
      });
      await expect.element(heading).toBeVisible();
      const compact = find(
        document.body,
        '.ui-empty-state[data-size="compact"]',
      );
      expect(compact.contains(heading.element())).toBe(true);
      expect(getComputedStyle(compact).borderTopWidth).toBe("0px");
    });
  });
});

describe("given an empty state that replaces the whole page", () => {
  it("should render an h1 and let the page move focus to it", async () => {
    await render(EmptyState);
    const heading = page.getByRole("heading", {
      level: 1,
      name: "Page failed",
    });
    await expect.element(heading).toBeVisible();
    await page.getByRole("button", { name: "Focus page title" }).click();
    await expect.element(heading).toHaveFocus();
  });
});
