import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ControlsHarness from "./fixtures/ControlsHarness.vue";
import VisualHarness from "./fixtures/VisualHarness.vue";
import DialogHarness from "./fixtures/DialogHarness.vue";
import SheetHarness from "./fixtures/SheetHarness.vue";

it("preserves the accessible catalog of button and field variants", async () => {
  await render(VisualHarness);
  await expect.element(document.documentElement).toMatchAriaSnapshot();
});

it("preserves form semantics when validation appears and clears", async () => {
  await render(ControlsHarness);
  await expect.element(document.documentElement).toMatchAriaSnapshot();
  await page.getByRole("button", { name: "Toggle error" }).click();
  const input = page.getByRole("textbox", { name: "Workout name" });
  await expect
    .element(input)
    .toHaveAccessibleDescription(
      "Shown in your list. Choose a different name.",
    );
  const references =
    input.element().getAttribute("aria-describedby")?.split(/\s+/) ?? [];
  expect(references).toHaveLength(2);
  for (const id of references)
    await expect.element(document.getElementById(id)).toBeVisible();
  await expect.element(document.documentElement).toMatchAriaSnapshot();
  await page.getByRole("button", { name: "Toggle error" }).click();
  await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
  await expect
    .element(input)
    .toHaveAccessibleDescription("Shown in your list.");
  await expect.element(input).toHaveAttribute("aria-invalid", "false");
  await expect.element(document.documentElement).toMatchAriaSnapshot();
});

it("preserves the dialog accessibility tree through keyboard open and close", async () => {
  await render(DialogHarness);
  const trigger = page.getByRole("button", { name: "Edit workout" });
  await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
  await expect.element(document.documentElement).toMatchAriaSnapshot();
  trigger.element().focus();
  await expect.element(trigger).toHaveFocus();
  const triggerElement = trigger.element();
  await userEvent.keyboard("{Enter}");
  const dialog = page.getByRole("dialog", { name: "Edit workout" });
  await expect.element(dialog).toBeVisible();
  const controlId = triggerElement.getAttribute("aria-controls");
  expect(controlId).toBeTruthy();
  expect(document.getElementById(controlId!)).toBe(dialog.element());
  for (const attribute of ["aria-labelledby", "aria-describedby"]) {
    const id = dialog.element().getAttribute(attribute);
    expect(id).toBeTruthy();
    await expect.element(document.getElementById(id!)).toBeVisible();
  }
  await expect.element(triggerElement).toHaveAttribute("aria-expanded", "true");
  await expect.element(document.documentElement).toMatchAriaSnapshot();
  await userEvent.keyboard("{Escape}");
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
  await expect.element(document.documentElement).toMatchAriaSnapshot();
});

it("preserves the Sheet accessibility tree through open and close", async () => {
  await render(SheetHarness);
  await expect.element(document.documentElement).toMatchAriaSnapshot();
  const trigger = page.getByRole("button", { name: "Open preferences" });
  trigger.element().focus();
  await userEvent.keyboard("{Enter}");
  await expect
    .element(page.getByRole("dialog", { name: "Preferences" }))
    .toBeVisible();
  await expect.element(document.documentElement).toMatchAriaSnapshot();
  await userEvent.keyboard("{Escape}");
  await expect.element(trigger).toHaveFocus();
  await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  await expect.element(document.documentElement).toMatchAriaSnapshot();
});
