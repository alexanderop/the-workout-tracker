import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import Dialog from "../fixtures/_BaseDialog.vue";
import { expectNoAxeViolations } from "../support/axe";

const trigger = () => page.getByRole("button", { name: "Edit workout" });
const dialog = () => page.getByRole("dialog", { name: "Edit workout" });
const nameInput = () => page.getByRole("textbox", { name: "Workout name" });
const openState = () => page.getByTestId("open-state");

async function openDialog() {
  await render(Dialog);
  await trigger().click();
  await expect.element(dialog()).toBeVisible();
}

describe("given a closed dialog", () => {
  it("should expose an accessible trigger", async () => {
    const { container } = await render(Dialog);
    await expect.element(trigger()).toHaveAttribute("aria-expanded", "false");
    await expectNoAxeViolations(container);
  });

  describe("when activating the trigger", () => {
    it("should be labelled by its title and described by its description", async () => {
      await openDialog();
      await expect.element(openState()).toHaveTextContent("true");
      await expect
        .element(dialog())
        .toHaveAccessibleDescription("Changes apply to your next session.");
      await expect.element(dialog()).toMatchAriaInlineSnapshot(`
        - dialog "Edit workout":
          - heading "Edit workout" [level=2]
          - paragraph: Changes apply to your next session.
          - textbox "Workout name": Push day
          - button "Done"
          - button "Close"
      `);
    });

    it("should move focus to the first control", async () => {
      await openDialog();
      await expect.element(nameInput()).toHaveFocus();
    });

    it("should have no axe violations", async () => {
      await openDialog();
      await expectNoAxeViolations(dialog().element());
    });
  });
});

describe("given an open dialog", () => {
  describe("when tabbing through its controls", () => {
    it("should trap focus and wrap around", async () => {
      await openDialog();
      await userEvent.tab();
      await expect
        .element(page.getByRole("button", { name: "Done" }))
        .toHaveFocus();
      await userEvent.tab();
      await expect
        .element(page.getByRole("button", { name: "Close", exact: true }))
        .toHaveFocus();
      await userEvent.tab();
      await expect.element(nameInput()).toHaveFocus();
      await userEvent.tab({ shift: true });
      await expect
        .element(page.getByRole("button", { name: "Close", exact: true }))
        .toHaveFocus();
    });
  });

  describe("when pressing Escape", () => {
    it("should close and restore focus to the trigger", async () => {
      await openDialog();
      await userEvent.keyboard("{Escape}");
      await expect.element(dialog()).not.toBeInTheDocument();
      await expect.element(openState()).toHaveTextContent("false");
      await expect.element(trigger()).toHaveFocus();
    });
  });

  describe("when pressing a close part", () => {
    it.each(["Done", "Close"])(
      "should close from %s and restore focus to the trigger",
      async (name) => {
        await openDialog();
        await page.getByRole("button", { name, exact: true }).click();
        await expect.element(dialog()).not.toBeInTheDocument();
        await expect.element(trigger()).toHaveFocus();
      },
    );
  });
});
