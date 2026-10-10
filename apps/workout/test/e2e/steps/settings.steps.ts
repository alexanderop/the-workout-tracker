import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../fixtures";
import { SettingsPage } from "../pages/SettingsPage";

const { When, Then } = createBdd(test);

When("I open the Settings hub", async ({ page }) => {
  await new SettingsPage(page).openHub();
});

When("I open the {string} settings page", async ({ page }, name: string) => {
  const settings = new SettingsPage(page);
  await settings.row(name).click();
  await expect(settings.sectionHeading(name)).toBeVisible();
});

When("I go back to the Settings hub", async ({ page }) => {
  await new SettingsPage(page).backLink().click();
});

When("I press the browser Back button", async ({ page }) => {
  await page.goBack();
});

When("I open the address {string}", async ({ page }, address: string) => {
  await page.goto(address);
});

Then(
  "the hub lists these rows",
  async (
    { page },
    table: { hashes: () => { row: string; value: string }[] },
  ) => {
    const settings = new SettingsPage(page);
    for (const { row, value } of table.hashes()) {
      const link = settings.row(row);
      await expect(link).toBeVisible();
      if (value) await expect(link).toContainText(value);
    }
  },
);

Then("the Settings hub is shown", async ({ page }) => {
  await expect(new SettingsPage(page).hubHeading()).toBeVisible();
});

Then("the heading {string} has focus", async ({ page }, name: string) => {
  await expect(new SettingsPage(page).sectionHeading(name)).toBeFocused();
});

Then("the {string} row has focus", async ({ page }, name: string) => {
  await expect(new SettingsPage(page).row(name)).toBeFocused();
});

Then("the Settings tab is the current page", async ({ page }) => {
  await expect(
    page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Settings", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

Then("I see the Workouts page", async ({ page }) => {
  await expect(page).toHaveURL(/#\/workouts/);
});
