import { afterEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import VisualHarness from "./fixtures/VisualHarness.vue";
import DialogHarness from "./fixtures/DialogHarness.vue";
afterEach(() => {
  document.documentElement.classList.remove("dark");
});
for (const theme of ["light", "dark"]) {
  it(`preserves ${theme} component variants and focused input`, async () => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    await page.viewport(960, 900);
    await render(VisualHarness);
    await document.fonts.ready;
    await page.getByRole("textbox", { name: "Workout name" }).click();
    await expect(page.getByRole("main")).toMatchScreenshot(
      `${theme}-components`,
    );
  });
  it(`preserves ${theme} dialog portal styling`, async () => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    await page.viewport(960, 720);
    await render(DialogHarness);
    await document.fonts.ready;
    await page.getByRole("button", { name: "Edit workout" }).click();
    await expect(page.getByRole("dialog")).toMatchScreenshot(`${theme}-dialog`);
  });
}
it("preserves narrow layouts and long labels", async () => {
  await page.viewport(375, 1000);
  await render(VisualHarness);
  await document.fonts.ready;
  await expect(page.getByRole("main")).toMatchScreenshot("narrow-components");
});

it("preserves keyboard focus on outline buttons", async () => {
  await page.viewport(960, 900);
  await render(VisualHarness);
  await document.fonts.ready;
  await page.getByRole("textbox", { name: "Workout name" }).click();
  await userEvent.tab({ shift: true });
  await expect
    .element(page.getByRole("button", { name: "Focused outline" }))
    .toHaveFocus();
  await expect(page.getByRole("main")).toMatchScreenshot(
    "outline-keyboard-focus",
  );
});

it("preserves the narrow dialog layout", async () => {
  await page.viewport(375, 720);
  await render(DialogHarness);
  await document.fonts.ready;
  await page.getByRole("button", { name: "Edit workout" }).click();
  await expect(page.getByRole("dialog")).toMatchScreenshot("narrow-dialog");
});
