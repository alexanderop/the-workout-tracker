import { createBdd } from "playwright-bdd";
import { test } from "../fixtures";
import { ExerciseCatalogPage } from "../pages/ExerciseCatalogPage";
import { seedWorkoutStorage } from "../seed";
import { createWorkoutFactory } from "../../support/factories";
const { Given, When, Then } = createBdd(test);
Given(
  "my exercise catalog includes a custom barbell press",
  async ({ workout, page }) => {
    await workout.open();
    const factory = createWorkoutFactory("catalog");
    const custom = factory.exercise({ name: "My barbell press" });
    const snapshot = factory.snapshot();
    await seedWorkoutStorage(
      page,
      factory.snapshot({
        exercises: { ...snapshot.exercises, [custom.id]: custom },
      }),
    );
  },
);
When("I select Bench press in the exercise picker", async ({ page }) => {
  await new ExerciseCatalogPage(page).selectBench();
});
When(
  "I browse illustrated equipment and muscle filters",
  async ({ page, $testInfo }) => {
    await new ExerciseCatalogPage(page).browseFilters($testInfo);
  },
);
Then("only matching custom exercises appear", async ({ page }) => {
  await new ExerciseCatalogPage(page).expectCustomOnly();
});
When("I reset catalog filters while searching", async ({ page }) => {
  await new ExerciseCatalogPage(page).resetFilters();
});
Then(
  "the search remains and the selected exercise is preserved",
  async ({ page }) => {
    await new ExerciseCatalogPage(page).expectPreserved();
  },
);
When("I clear a search with no results", async ({ page }) => {
  await new ExerciseCatalogPage(page).clearEmptySearch();
});
Then(
  "the search receives focus and the full catalog returns",
  async ({ page }) => {
    await new ExerciseCatalogPage(page).expectCleared();
  },
);
Then("alphabetical ordering can be reversed", async ({ page }) => {
  await new ExerciseCatalogPage(page).reverseOrder();
});
Then(
  "dismissing nested filters returns focus to the workout picker",
  async ({ page }) => {
    await new ExerciseCatalogPage(page).dismissNestedFilters();
  },
);
Then("the original exercise can start a workout", async ({ page }) => {
  await new ExerciseCatalogPage(page).startSelected();
});
