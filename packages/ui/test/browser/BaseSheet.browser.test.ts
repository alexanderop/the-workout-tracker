import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import Sheet from "../fixtures/_BaseSheet.vue";
import { expectNoAxeViolations } from "../support/axe";

const opener = () => page.getByRole("button", { name: "Template settings" });
const sheet = () => page.getByRole("dialog", { name: "Template settings" });
const closeRequests = () => page.getByTestId("close-requests");

async function openSheet() {
  await render(Sheet);
  await opener().click();
  await expect.element(sheet()).toBeVisible();
}

describe("given a closed sheet", () => {
  it("should render only its opener", async () => {
    await render(Sheet);
    await expect.element(sheet()).not.toBeInTheDocument();
  });

  describe("when opening it", () => {
    it("should be labelled by its title and described by its description", async () => {
      await openSheet();
      await expect
        .element(sheet())
        .toHaveAccessibleDescription("Changes apply to your next session.");
    });

    it("should move focus inside the sheet", async () => {
      await openSheet();
      expect(sheet().element().contains(document.activeElement)).toBe(true);
    });

    it("should have no axe violations", async () => {
      await openSheet();
      await expectNoAxeViolations(sheet().element());
    });
  });
});

describe("given an open sheet", () => {
  describe("when pressing Escape", () => {
    it("should request closing and restore focus to the opener", async () => {
      await openSheet();
      await userEvent.keyboard("{Escape}");
      await expect.element(sheet()).not.toBeInTheDocument();
      await expect.element(closeRequests()).toHaveTextContent("1");
      await expect.element(opener()).toHaveFocus();
    });
  });

  describe("when pressing the close button", () => {
    it("should request closing and restore focus to the opener", async () => {
      await openSheet();
      await page.getByRole("button", { name: "Close dialog" }).click();
      await expect.element(sheet()).not.toBeInTheDocument();
      await expect.element(closeRequests()).toHaveTextContent("1");
      await expect.element(opener()).toHaveFocus();
    });
  });

  describe("when the consumer closes it from its content", () => {
    it("should restore focus to the opener", async () => {
      await openSheet();
      await page.getByRole("button", { name: "Done" }).click();
      await expect.element(sheet()).not.toBeInTheDocument();
      await expect.element(opener()).toHaveFocus();
    });
  });

  describe("when tabbing past the last control", () => {
    it("should keep focus inside the sheet", async () => {
      await openSheet();
      for (let step = 0; step < 4; step += 1) {
        await userEvent.tab();
        expect(sheet().element().contains(document.activeElement)).toBe(true);
      }
    });
  });
});
