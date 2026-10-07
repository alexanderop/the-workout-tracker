import { createBdd } from "playwright-bdd";
import { test } from "../fixtures";
import { MobileControlsPage } from "../pages/MobileControlsPage";

const { Given, Then } = createBdd(test);
Given("I have a workout on a short phone", async ({ page }) => {
  await new MobileControlsPage(page).openShortWorkout();
});
Then(
  "I can confirm a number with full-sized keypad controls",
  async ({ page }) => {
    await new MobileControlsPage(page).inspectKeypad();
  },
);
Then(
  "logging a set offers an explicit undo in its options",
  async ({ page }) => {
    await new MobileControlsPage(page).logAndUndoExplicitly();
  },
);
Then(
  "I can add a set and return to the next unfinished set",
  async ({ page }) => {
    await new MobileControlsPage(page).addAndNavigate();
  },
);
