import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import Confirm from "../fixtures/_BaseConfirmSheet.vue";
import { expectNoAxeViolations } from "../support/axe";

const opener = () => page.getByRole("button", { name: "Delete data" });
const sheet = () => page.getByRole("dialog", { name: "Delete all data?" });
const cancel = () => page.getByRole("button", { name: "Keep data" });
const confirm = () => page.getByRole("button", { name: "Delete everything" });
const confirms = () => page.getByTestId("confirms");
const cancels = () => page.getByTestId("cancels");

async function openSheet(props: Record<string, unknown> = {}) {
  await render(Confirm, { props });
  await opener().click();
  await expect.element(sheet()).toBeVisible();
}

describe("given a closed confirm sheet", () => {
  it("should render nothing but its opener", async () => {
    await render(Confirm);
    await expect.element(sheet()).not.toBeInTheDocument();
  });
});

describe("given an open destructive confirm sheet", () => {
  it("should describe the consequence and show the rich body", async () => {
    await openSheet();
    await expect
      .element(sheet())
      .toHaveAccessibleDescription(
        "History, drafts and templates are removed from this device.",
      );
    await expect
      .element(
        page.getByText("Backups you already downloaded stay on your device."),
      )
      .toBeVisible();
  });

  it("should put Cancel before Confirm and use the destructive variant", async () => {
    await openSheet();
    const labels = sheet()
      .element()
      .querySelectorAll<HTMLElement>(".ui-actions button");
    expect([...labels].map((button) => button.textContent.trim())).toEqual([
      "Keep data",
      "Delete everything",
    ]);
    expect(labels[0]?.dataset.variant).toBe("secondary");
    expect(labels[1]?.dataset.variant).toBe("destructive");
  });

  it("should focus Cancel, the safe control, first", async () => {
    await openSheet();
    await expect.element(cancel()).toHaveFocus();
  });

  it("should have no axe violations", async () => {
    await openSheet();
    await expectNoAxeViolations(sheet().element());
  });

  describe("when pressing Cancel", () => {
    it("should emit cancel, close and restore focus to the opener", async () => {
      await openSheet();
      await cancel().click();
      await expect.element(sheet()).not.toBeInTheDocument();
      await expect.element(cancels()).toHaveTextContent("1");
      await expect.element(confirms()).toHaveTextContent("0");
      await expect.element(opener()).toHaveFocus();
    });
  });

  describe("when pressing Escape", () => {
    it("should cancel like the Cancel button", async () => {
      await openSheet();
      await userEvent.keyboard("{Escape}");
      await expect.element(sheet()).not.toBeInTheDocument();
      await expect.element(cancels()).toHaveTextContent("1");
      await expect.element(opener()).toHaveFocus();
    });
  });

  describe("when pressing the close button", () => {
    it("should cancel", async () => {
      await openSheet();
      await page.getByRole("button", { name: "Close dialog" }).click();
      await expect.element(cancels()).toHaveTextContent("1");
      await expect.element(sheet()).not.toBeInTheDocument();
    });
  });

  describe("when pressing Confirm", () => {
    it("should emit confirm and leave the sheet open for the consumer", async () => {
      await openSheet();
      await confirm().click();
      await expect.element(confirms()).toHaveTextContent("1");
      await expect.element(sheet()).toBeVisible();
    });
  });
});

describe("given a neutral confirm sheet", () => {
  it("should use the default button variant for Confirm", async () => {
    await openSheet({ intent: "neutral" });
    expect(confirm().element().dataset.variant).toBe("default");
  });
});

describe("given a busy confirm sheet", () => {
  it("should disable both buttons", async () => {
    await openSheet({ busy: true });
    await expect.element(confirm()).toBeDisabled();
    await expect.element(cancel()).toBeDisabled();
  });

  it("should ignore Escape", async () => {
    await openSheet({ busy: true });
    await userEvent.keyboard("{Escape}");
    await expect.element(sheet()).toBeVisible();
    await expect.element(cancels()).toHaveTextContent("0");
  });
});

describe("given a confirm sheet with Confirm disabled", () => {
  it("should keep Cancel usable", async () => {
    await openSheet({ confirmDisabled: true });
    await expect.element(confirm()).toBeDisabled();
    await expect.element(cancel()).toBeEnabled();
  });
});

describe("given a failed action", () => {
  it("should announce the error as an alert and stay open", async () => {
    await openSheet({ error: "Could not delete. Try again." });
    await expect
      .element(page.getByRole("alert"))
      .toHaveTextContent("Could not delete. Try again.");
    await expectNoAxeViolations(sheet().element());
  });
});
