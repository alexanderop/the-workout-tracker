import { createBdd } from "playwright-bdd";
import { test } from "../fixtures";
import { BarbellPlatesPage } from "../pages/BarbellPlatesPage";

const { When, Then } = createBdd(test);
When(
  "I type {string} in the set 1 weight keypad",
  async ({ page }, value: string) => {
    await new BarbellPlatesPage(page).typeWeight(value);
  },
);
Then(
  "the keypad shows the plates {string}",
  async ({ page }, description: string) => {
    await new BarbellPlatesPage(page).expectPlates(description);
  },
);
When(
  "I choose {string} from the keypad values",
  async ({ page }, value: string) => {
    await new BarbellPlatesPage(page).choose(value);
  },
);
Then("the set 1 weight shows {string}", async ({ page }, value: string) => {
  await new BarbellPlatesPage(page).expectWeight(value);
});
When("I turn off the {string}", async ({ page }, name: string) => {
  await new BarbellPlatesPage(page).turnOffPlate(name);
});
When("I return to my workouts", async ({ workout }) => {
  await workout.open();
});
