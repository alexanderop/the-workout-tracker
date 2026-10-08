import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../fixtures";
import { seedWorkoutStorage } from "../seed";
import { createWorkoutFactory } from "../../support/factories";

const { Given, When, Then } = createBdd(test);
const templateEditor = (page: Page) => page.getByRole("dialog", { name: "Create template", exact: true });
async function openTemplate(page: Page) {
  await page.getByRole("button", { name: /^Templates/ }).click();
  await page.getByRole("button", { name: "Create template", exact: true }).click();
  await expect(templateEditor(page)).toBeVisible();
}
Given("I am editing a new template called {string}", async ({ workout, page }, name: string) => {
  await workout.open();
  await openTemplate(page);
  await templateEditor(page).getByRole("textbox", { name: "Template name", exact: true }).fill(name);
});
Given("I opened a new template without making changes", async ({ workout, page }) => {
  await workout.open();
  await openTemplate(page);
});
When("I dismiss the template using {string}", async ({ page }, method: string) => {
  const editor = templateEditor(page);
  if (method === "Escape") return editor.press("Escape");
  // The topmost backdrop belongs to the template editor; its corner lies outside the sheet.
  if (method === "Outside") return page.locator('[data-slot="dialog-overlay"]').last().click({ position: { x: 5, y: 5 } });
  await editor.getByRole("button", { name: method === "Close" ? "Close dialog" : "Cancel", exact: true }).click();
});
Then("I can keep editing the template {string}", async ({ page }, name: string) => {
  const confirmation = page.getByRole("dialog", { name: "Discard template changes?", exact: true });
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole("button", { name: "Keep editing", exact: true }).click();
  await expect(confirmation).toBeHidden();
  await expect(templateEditor(page).getByRole("textbox", { name: "Template name", exact: true })).toHaveValue(name);
});
When("I discard my template changes", async ({ page }) => {
  await page.getByRole("dialog", { name: "Discard template changes?", exact: true }).getByRole("button", { name: "Discard changes", exact: true }).click();
});
Then("the template editor is closed", async ({ page }) => {
  await expect(templateEditor(page)).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: "Templates", exact: true })).toBeVisible();
});

async function seedActive(page: Page, completed: boolean) {
  const f = createWorkoutFactory("draft-navigation");
  const active = f.activeSession({ exercises: [
    f.sessionExercise({ sets: [f.set({ completed })] }),
    f.sessionExercise({ name: "Back squat", exerciseId: "squat", category: "Legs", sets: [f.set()] }),
  ] });
  await seedWorkoutStorage(page, f.snapshot({ active }));
  await page.getByRole("button", { name: "Continue workout", exact: true }).click();
  await expect(page).toHaveURL(/#\/session$/);
  await expect(page.getByRole("navigation", { name: "Workout exercises", exact: true })).toBeVisible();
}
Given("my active workout contains Bench press and Back squat", async ({ workout, page }) => {
  await workout.open();
  await seedActive(page, false);
});
Given("Bench press is logged and Back squat is unfinished", async ({ workout, page }) => {
  await workout.open();
  await seedActive(page, true);
});
When("I confirm a Back squat weight of 55 kilograms", async ({ page }) => {
  await page.getByRole("navigation", { name: "Workout exercises", exact: true }).getByRole("button", { name: "Back squat", exact: true }).click();
  await page.getByRole("button", { name: /^Set 1 weight for Back squat: / }).click();
  const editor = page.getByRole("dialog", { name: "Weight", exact: true });
  await editor.getByRole("group", { name: "Number editor" }).press("5");
  await editor.getByRole("group", { name: "Number editor" }).press("5");
  await editor.getByRole("button", { name: "Use weight", exact: true }).click();
});
When("I switch to Bench press and review my input drafts", async ({ page }) => {
  await page.getByRole("navigation", { name: "Workout exercises", exact: true }).getByRole("button", { name: "Bench press, all sets logged", exact: true }).click();
  await page.getByRole("button", { name: "Finish", exact: true }).first().click();
  await page.getByRole("dialog", { name: "Finish this workout?", exact: true }).getByRole("button", { name: "Review my sets", exact: true }).click();
});
Then("the Back squat input draft is visible", async ({ page }) => {
  await expect(page.getByRole("button", { name: /^Set 1 weight for Back squat: / })).toHaveText("55");
  await expect(page.getByText("Input retained on this device.", { exact: false })).toBeVisible();
});
Then("the Back squat draft is visible and focused", async ({ page }) => {
  await expect(page.getByRole("button", { name: /^Set 1 weight for Back squat: / })).toHaveText("55");
  await expect(page.getByRole("button", { name: "Options for set 1 of Back squat", exact: true })).toBeFocused();
});
Then("Back squat is selected", async ({ page }) => {
  await expect(page.getByRole("button", { name: /^Set 1 weight for Back squat: / })).toBeVisible();
});
When("I log my final Back squat set", async ({ page }) => {
  await page.getByRole("button", { name: "Log set 1 of Back squat", exact: true }).click();
  await expect(page.getByRole("button", { name: "Logged set 1 of Back squat", exact: true })).toHaveAttribute("aria-disabled", "true");
});
