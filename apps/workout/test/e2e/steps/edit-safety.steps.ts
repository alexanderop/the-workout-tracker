import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../fixtures";
import { EditSafetyPage } from "../pages/EditSafetyPage";
import { createWorkoutFactory } from "../../support/factories";
import { seedWorkoutStorage } from "../seed";
const { Given, When, Then } = createBdd(test);
When("I type the workout name {string}", async ({ page }, name: string) => {
  await new EditSafetyPage(page).editName(name);
});
When("I dismiss rename and choose to keep editing", async ({ page }) => {
  await page.getByRole("dialog", { name: "Rename workout", exact: true }).getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.getByRole("button", { name: "Keep editing", exact: true }).click();
});
Then("the workout name remains {string}", async ({ page }, name: string) => {
  await new EditSafetyPage(page).expectDraftName(name);
});
Then("the workout is named {string}", async ({ page }, name: string) => {
  await new EditSafetyPage(page).expectSavedName(name);
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
    page.getByRole("button", { name: "Save name", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Rename workout", exact: true })).toBeVisible();
});
When("I use the saved workout name", async ({ page }) => {
  await page
    .getByRole("button", { name: "Use saved name", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Rename workout", exact: true }),
  ).toHaveCount(0);
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
Then("I can keep editing my workout name", async ({ page }) => {
  await page.getByRole("button", { name: "Keep editing", exact: true }).click();
  await new EditSafetyPage(page).expectDraftName("My local name");
});
When("I discard the unsaved workout name", async ({ page }) => {
  await new EditSafetyPage(page).discardName();
});
Then("I have left the workout editor", async ({ page }) => {
  await expect(
    page.getByRole("textbox", { name: "Workout name", exact: true }),
  ).toHaveCount(0);
});

Given("all workout sets are logged without an active rest", async ({ page }) => {
  const f = createWorkoutFactory("name-finish");
  const active = f.activeSession({ exercises: [f.sessionExercise({ sets: [f.set({ completed: true })] })] });
  await seedWorkoutStorage(page, f.snapshot({ active }));
  await expect(page.getByRole("button", { name: "Rename workout", exact: true })).toBeVisible();
});
Then("mobile Finish is disabled while the name is unsaved", async ({ page }) => {
  await expect(page.getByRole("region", { name: "Training controls", includeHidden: true }).getByRole("button", { name: "Finish", exact: true, includeHidden: true })).toBeDisabled();
});
Then("mobile Finish is enabled", async ({ page }) => {
  await expect(page.getByRole("region", { name: "Training controls", includeHidden: true }).getByRole("button", { name: "Finish", exact: true })).toBeEnabled();
});

Then("the narrow workout actions have full touch targets", async ({ page }) => {
  for (const button of [page.getByRole("button", { name: "Finish", exact: true }).first(), page.getByRole("button", { name: "Discard workout", exact: true })]) {
    await expect(button).toBeVisible();
    await expect(async () => {
      const box = await button.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    }).toPass();
  }
});
