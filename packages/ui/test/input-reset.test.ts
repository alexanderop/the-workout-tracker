import { expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import FormOwnerHarness from "./fixtures/FormOwnerHarness.vue";

it("resets only with its current form owner", async () => {
  await render(FormOwnerHarness);
  await page.getByRole("button", { name: "Move to second" }).click();
  await page.getByRole("button", { name: "Reset first" }).click();
  await expect
    .element(page.getByLabelText("Model value"))
    .toHaveTextContent("Edited");
  await page.getByRole("button", { name: "Reset second" }).click();
  await expect
    .element(page.getByRole("textbox", { name: "External value" }))
    .toHaveValue("Default");
  await expect
    .element(page.getByLabelText("Model value"))
    .toHaveTextContent("Default");
});

it("preserves the value when the current owner cancels reset", async () => {
  await render(FormOwnerHarness);
  await page.getByRole("button", { name: "Move to second" }).click();
  await page.getByRole("button", { name: "Cancel resets" }).click();
  await page.getByRole("button", { name: "Reset second" }).click();
  await expect
    .element(page.getByRole("textbox", { name: "External value" }))
    .toHaveValue("Edited");
  await expect
    .element(page.getByLabelText("Model value"))
    .toHaveTextContent("Edited");
});
