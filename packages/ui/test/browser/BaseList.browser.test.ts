import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import List from "../fixtures/_BaseList.vue";
import { expectNoAxeViolations } from "../support/axe";

describe("given a group of list rows", () => {
  it("should name the group and show titles, values and descriptions", async () => {
    const { container } = await render(List);
    await expect
      .element(page.getByRole("heading", { name: "Preferences" }))
      .toBeVisible();
    await expect
      .element(page.getByRole("link", { name: "Appearance System · Blue" }))
      .toBeVisible();
    await expect.element(page.getByText("Installed build")).toBeVisible();
    await expectNoAxeViolations(container);
  });

  describe("when a link row is chosen", () => {
    it("should activate the row element itself", async () => {
      await render(List);
      await page.getByRole("link", { name: /^Language/ }).click();
      await expect
        .element(page.getByTestId("opened"))
        .toHaveTextContent("language");
    });

    it("should be reachable and operable by keyboard", async () => {
      await render(List);
      await userEvent.tab();
      await expect
        .element(page.getByRole("link", { name: /^Appearance/ }))
        .toHaveFocus();
      await userEvent.keyboard("{Enter}");
      await expect
        .element(page.getByTestId("opened"))
        .toHaveTextContent("appearance");
    });
  });

  describe("given a row without a link", () => {
    it("should not be a link", async () => {
      await render(List);
      await expect
        .element(page.getByRole("link", { name: /^Version/ }))
        .not.toBeInTheDocument();
    });
  });
});
