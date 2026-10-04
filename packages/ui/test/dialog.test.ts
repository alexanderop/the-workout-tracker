import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import axe from "axe-core";
import DialogHarness from "./fixtures/DialogHarness.vue";

it("opens with a name and description, traps focus, and restores it on Escape", async () => {
  await render(DialogHarness);
  const trigger = page.getByRole("button", { name: "Edit workout" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Edit workout" });
  await expect
    .element(dialog)
    .toHaveAccessibleDescription("Change your next session.");
  await expect
    .element(page.getByRole("textbox", { name: "Workout title" }))
    .toHaveFocus();
  for (let index = 0; index < 5; index++) {
    await userEvent.tab();
    expect(
      document
        .querySelector('[role="dialog"]')
        ?.contains(document.activeElement),
    ).toBe(true);
  }
  await Promise.all(
    document.getAnimations().map((animation) => animation.finished),
  );
  const result = await axe.run(document.body, {
    rules: { region: { enabled: false } },
  });
  expect(
    result.violations.map(({ id, nodes }) => ({
      id,
      nodes: nodes.map(({ target, failureSummary }) => ({
        target,
        failureSummary,
      })),
    })),
  ).toEqual([]);
  await userEvent.keyboard("{Escape}");
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  await expect
    .element(page.getByLabelText("Dialog state"))
    .toHaveTextContent("closed");
});

it("forwards content events and supports a custom portal target", async () => {
  await render(DialogHarness, {
    props: { customPortal: true, preventEscape: true },
  });
  await page.getByRole("button", { name: "Edit workout" }).click();
  await expect.element(page.getByRole("dialog")).toBeVisible();
  expect(
    document.querySelector('#dialog-target [role="dialog"]'),
  ).not.toBeNull();
  await userEvent.keyboard("{Escape}");
  await expect.element(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  await expect
    .element(page.getByRole("button", { name: "Edit workout" }))
    .toHaveFocus();
});

it("dismisses through outside pointer interaction", async () => {
  await render(DialogHarness);
  await page.getByRole("button", { name: "Edit workout" }).click();
  await expect.element(page.getByRole("dialog")).toBeVisible();
  const overlay = document.querySelector('[data-slot="dialog-overlay"]');
  if (!(overlay instanceof HTMLElement))
    throw new Error("Dialog overlay missing");
  await page.elementLocator(overlay).click({ position: { x: 5, y: 5 } });
  await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
});
