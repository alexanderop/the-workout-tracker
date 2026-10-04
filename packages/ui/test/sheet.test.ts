import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import SheetHarness from "./fixtures/SheetHarness.vue";

it("returns keyboard focus to the opener when a dialog closes", async () => {
  await render(SheetHarness);
  const opener = page.getByRole("button", { name: "Open preferences" });
  await opener.click();
  await expect
    .element(page.getByRole("dialog", { name: "Preferences" }))
    .toBeVisible();
  await userEvent.keyboard("{Escape}");
  await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  await expect.element(opener).toHaveFocus();
});

it("ships its own styles and closes through its accessible close button", async () => {
  await render(SheetHarness);
  const opener = page.getByRole("button", { name: "Open preferences" });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Preferences" });
  await expect.element(dialog).toBeVisible();
  const element = document.querySelector('[role="dialog"]');
  if (!(element instanceof HTMLElement)) throw new Error("Dialog is missing");
  expect(getComputedStyle(element).position).toBe("fixed");
  expect(getComputedStyle(element).backgroundColor).toBe("rgb(20, 20, 20)");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(opener).toHaveFocus();
});
