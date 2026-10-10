import { createBdd } from "playwright-bdd";
import { test } from "../fixtures";
import { OfflinePage } from "../pages/OfflinePage";

const { Given, When, Then } = createBdd(test);

Given(
  "I have opened the app and it is ready for offline use",
  async ({ page }) => {
    await new OfflinePage(page).openReadyForOffline();
  },
);
When("I go offline", async ({ page }) => {
  await new OfflinePage(page).goOffline();
});
When("I go online", async ({ page }) => {
  await new OfflinePage(page).goOnline();
});
Then("the app says it is offline", async ({ page }) => {
  await new OfflinePage(page).expectOfflineNotice();
});
Then("{int} set is logged", async ({ page }, count: number) => {
  await new OfflinePage(page).expectLoggedSets(count);
});
