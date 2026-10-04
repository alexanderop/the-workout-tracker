import { afterEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import VisualHarness from "./fixtures/VisualHarness.vue";
import DialogHarness from "./fixtures/DialogHarness.vue";
import SheetHarness from "./fixtures/SheetHarness.vue";
import { expectAccessible } from "./helpers/accessibility";

const variants = [
  "default",
  "destructive",
  "outline",
  "secondary",
  "ghost",
  "link",
];

afterEach(() => {
  document.documentElement.classList.remove("dark");
});

for (const theme of ["light", "dark"]) {
  it(`has accessible ${theme} button variants and valid, invalid, and disabled fields`, async () => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    await render(VisualHarness);
    await expectAccessible(`${theme} controls`);
    await page.getByRole("textbox", { name: "Workout name" }).click();
    await userEvent.tab({ shift: true });
    await expect
      .element(page.getByRole("button", { name: "Focused outline" }))
      .toHaveFocus();
    await expectAccessible(`${theme} keyboard focus`);
  });

  for (const variant of variants) {
    it(`has accessible ${theme} ${variant} button hover and keyboard focus`, async () => {
      document.documentElement.classList.toggle("dark", theme === "dark");
      await render(VisualHarness);
      const button = page
        .getByRole("button", { name: variant, exact: true })
        .nth(0);
      await button.hover();
      expect(button.element().matches(":hover")).toBe(true);
      await expectAccessible(`${theme} ${variant} hover`);
      button.element().focus();
      await page.getByRole("heading", { name: "Form UI", exact: true }).hover();
      await userEvent.tab();
      await userEvent.tab({ shift: true });
      await expect.element(button).toHaveFocus();
      expect(button.element().matches(":focus-visible")).toBe(true);
      await expectAccessible(`${theme} ${variant} keyboard focus`);
    });
  }

  it(`has an accessible ${theme} open dialog including its portal`, async () => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    await render(DialogHarness);
    await page.getByRole("button", { name: "Edit workout" }).click();
    await expect
      .element(page.getByRole("dialog", { name: "Edit workout" }))
      .toBeVisible();
    await expectAccessible(`${theme} open dialog`);
  });
}

it("has an accessible open Sheet", async () => {
  await render(SheetHarness);
  await page.getByRole("button", { name: "Open preferences" }).click();
  await expect
    .element(page.getByRole("dialog", { name: "Preferences" }))
    .toBeVisible();
  await expectAccessible("open Sheet");
});
