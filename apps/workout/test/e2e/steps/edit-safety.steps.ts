import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../fixtures";
import { EditSafetyPage } from "../pages/EditSafetyPage";
const { When, Then } = createBdd(test);
When("I type the workout name {string}", async ({ page }, name: string) => {
  await new EditSafetyPage(page).editName(name);
});
When("I log a set while the name is unsaved", async ({ page }) => {
  await new EditSafetyPage(page).logSet();
});
Then("the workout name remains {string}", async ({ page }, name: string) => {
  await new EditSafetyPage(page).expectName(name);
});
When("I save the workout name", async ({ page }) => {
  await new EditSafetyPage(page).saveName();
});
Then(
  "reloading shows the saved workout name {string}",
  async ({ page }, name: string) => {
    await new EditSafetyPage(page).expectSavedAfterReload(name);
  },
);
When(
  "another tab saves the workout name {string}",
  async ({ page }, name: string) => {
    await new EditSafetyPage(page).renameInOtherTab(name);
  },
);
Then("I can choose which workout name to keep", async ({ page }) => {
  await new EditSafetyPage(page).expectConflict();
});
When("I keep my workout name", async ({ page }) => {
  await page.getByRole("button", { name: "Keep my name", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Keep my name", exact: true }),
  ).toHaveCount(0);
});
When("I use the saved workout name", async ({ page }) => {
  await page
    .getByRole("button", { name: "Use saved name", exact: true })
    .click();
});
When(
  "I write the unsaved exercise note {string}",
  async ({ page }, text: string) => {
    await new EditSafetyPage(page).openNote(text);
  },
);
When("I press browser Back from the workout", async ({ page }) => {
  await new EditSafetyPage(page).goBack();
});
Then("keeping the note retains {string}", async ({ page }, text: string) => {
  await new EditSafetyPage(page).keepNote(text);
});
When("I discard the unsaved exercise note", async ({ page }) => {
  await new EditSafetyPage(page).discardNote();
});
When("I follow the workout back link", async ({ page }) => {
  await new EditSafetyPage(page).leaveByLink();
});
Then("I can keep editing my workout name", async ({ page }) => {
  await page.getByRole("button", { name: "Keep editing", exact: true }).click();
  await new EditSafetyPage(page).expectName("My local name");
});
When("I discard the unsaved workout name", async ({ page }) => {
  await new EditSafetyPage(page).discardName();
});
Then("I have left the workout editor", async ({ page }) => {
  await expect(
    page.getByRole("textbox", { name: "Workout name", exact: true }),
  ).toHaveCount(0);
});
