import { createBdd } from "playwright-bdd";
import { test } from "../fixtures";
import { seedWorkoutStorage } from "../seed";
import { createWorkoutFactory } from "../../support/factories";

const { Given, When, Then } = createBdd(test);
Given("I have a fresh workout journal", async ({ workout }) => {
  await workout.open();
});
Given("my journal contains a previous workout at {int} kilograms", async ({ workout, page }, weight: number) => {
  await workout.open();
  const factory = createWorkoutFactory("repeat");
  const previous = factory.completedSession({ exercises: [factory.sessionExercise({ sets: [factory.set({ completed: true, weightKg: weight })] })] });
  await seedWorkoutStorage(page, factory.snapshot({ completed: { [previous.id]: previous } }));
});
When("I start a workout with Bench press", async ({ workout }) => {
  await workout.startWithBenchPress();
});
When("I confirm a weight of {int} kilograms", async ({ workout }, weight: number) => {
  await workout.confirmWeight(String(weight));
});
Then("the {int} kilogram input is an unlogged draft", async ({ workout }, weight: number) => {
  await workout.expectUnloggedDraft(String(weight));
});
When("I reload the workout", async ({ workout }) => {
  await workout.reload();
});
When("I log the first set and finish my workout", async ({ workout }) => {
  await workout.logAndFinish();
});
Then("my history contains one logged set with {int} kilograms of volume", async ({ workout }, volume: number) => {
  await workout.expectHistory(volume);
});
When("I repeat the previous workout", async ({ workout }) => {
  await workout.repeatHistory();
});
Then("the first set starts at {int} kilograms without being logged", async ({ workout }, weight: number) => {
  await workout.expectUnloggedSet(String(weight));
});
When("I create the custom exercise {string}", async ({ workout }, name: string) => {
  await workout.createCustomExercise(name);
});
When("I create the template {string} with {string}", async ({ workout }, name: string, exercise: string) => {
  await workout.createTemplate(name, exercise);
});
When("I rename the template {string} to {string}", async ({ workout }, from: string, to: string) => {
  await workout.renameTemplate(from, to);
});
Then("my only template is {string} with {string}", async ({ workout }, name: string, exercise: string) => {
  await workout.expectSingleTemplate(name, exercise);
});

When("I select an exercise then cancel before starting", async ({ workout }) => {
  await workout.cancelSelection();
});

Then("I capture the started workout", async ({ page, $testInfo }) => {
  const path = $testInfo.outputPath("started-workout.png");
  await page.screenshot({ path, fullPage: true });
  await $testInfo.attach("Started workout", { path, contentType: "image/png" });
});
