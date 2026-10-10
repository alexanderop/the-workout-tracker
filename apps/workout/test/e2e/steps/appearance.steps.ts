import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../fixtures";
import { SettingsPage } from "../pages/SettingsPage";

const { Given, When, Then } = createBdd(test);

Given(
  "my device prefers a {string} color scheme",
  async ({ page }, scheme: string) => {
    await page.emulateMedia({
      colorScheme: scheme === "dark" ? "dark" : "light",
    });
  },
);

Given("I open the appearance settings", async ({ page }) => {
  await page.goto("/#/settings");
  await new SettingsPage(page).openSection("Appearance");
});

When(
  "I choose the {string} theme and the {string} accent",
  async ({ page }, theme: string, accent: string) => {
    await page.getByRole("radio", { name: theme, exact: true }).check();
    await page.getByRole("radio", { name: accent, exact: true }).check();
  },
);

Then(
  "the app uses the {string} theme and the {string} accent",
  async ({ page }, theme: string, accent: string) => {
    const root = page.locator("html");
    await expect(root).toHaveAttribute("data-theme", theme);
    await expect(root).toHaveAttribute("data-accent", accent);
  },
);

Then(
  "after reloading the app still uses the {string} theme and the {string} accent",
  async ({ page }, theme: string, accent: string) => {
    await page.reload({ waitUntil: "commit" });
    const root = page.locator("html");
    await expect(root).toHaveAttribute("data-theme", theme);
    await expect(root).toHaveAttribute("data-accent", accent);
  },
);
