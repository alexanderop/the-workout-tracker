import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import BackLink from "../fixtures/_BaseBackLink.vue";
import { expectNoAxeViolations } from "../support/axe";

const visited = () => page.getByTestId("visited");

describe("given back links", () => {
  it("should render an anchor named after its destination, with a 44px target", async () => {
    const { container } = await render(BackLink);
    const link = page.getByRole("link", { name: "Settings" });
    await expect.element(link).toHaveAttribute("href", "#plain");
    expect(
      link.element().getBoundingClientRect().height,
    ).toBeGreaterThanOrEqual(44);
    await expectNoAxeViolations(container);
  });

  it("should hide the chevron from assistive technology", async () => {
    await render(BackLink);
    const icon = page
      .getByRole("link", { name: "Settings" })
      .element()
      .querySelector("svg");
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
  });

  describe("when rendered as another component", () => {
    it("should forward its props and listeners to it", async () => {
      await render(BackLink);
      const link = page.getByRole("link", { name: "Workouts" });
      await expect.element(link).toHaveAttribute("href", "#/workouts");
      await link.click();
      await expect.element(visited()).toHaveTextContent("/workouts");
    });
  });

  describe("when rendered as a button", () => {
    it("should be a native button that does not submit forms", async () => {
      await render(BackLink);
      const button = page.getByRole("button", { name: "Exercises" });
      await expect.element(button).toHaveAttribute("type", "button");
      await button.click();
      await expect.element(visited()).toHaveTextContent("button");
    });
  });

  describe("when focused with the keyboard", () => {
    it("should show the focus ring", async () => {
      await render(BackLink);
      await userEvent.tab();
      const link = page.getByRole("link", { name: "Settings" });
      await expect.element(link).toHaveFocus();
      expect(getComputedStyle(link.element()).outlineStyle).toBe("solid");
    });
  });
});
