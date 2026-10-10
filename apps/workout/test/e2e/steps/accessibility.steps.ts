import { createBdd } from "playwright-bdd";
import { test } from "../fixtures";
import { AccessibilityPage } from "../pages/AccessibilityPage";

const { When, Then } = createBdd(test);

When("I open the {string} page", async ({ page }, name: string) => {
  await new AccessibilityPage(page).openPage(name);
});
Then("the page has no accessibility violations", async ({ page }) => {
  await new AccessibilityPage(page).expectNoViolations();
});
Then(
  "the page has no accessibility violations except {string}",
  async ({ page }, rule: string) => {
    await new AccessibilityPage(page).expectNoViolations([rule]);
  },
);
