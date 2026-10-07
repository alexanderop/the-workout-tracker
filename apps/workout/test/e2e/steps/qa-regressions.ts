import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../fixtures";
import { seedWorkoutStorage } from "../seed";
import { createWorkoutFactory } from "../../support/factories";
import { WorkoutPage } from "../pages/WorkoutPage";
import { EditSafetyPage } from "../pages/EditSafetyPage";
import { QaRegressionsPage } from "../pages/qa-regressions";

const { Given, When, Then } = createBdd(test);
Given("a fresh journal for concurrent editing", async ({ workout }) => {
  await workout.open();
});
Given("an unlogged Bench press workout", async ({ page }) => {
  const f = createWorkoutFactory("qa-concurrency");
  const active = f.activeSession({
    exercises: [f.sessionExercise({ sets: [f.set({ completed: false })] })],
  });
  await seedWorkoutStorage(page, f.snapshot({ active }));
  await page
    .getByRole("button", { name: "Continue workout", exact: true })
    .click();
  await expect(new WorkoutPage(page).weight()).toBeVisible();
});
Given("a logged Bench press workout", async ({ page }) => {
  const f = createWorkoutFactory("qa-finish");
  const active = f.activeSession({
    exercises: [f.sessionExercise({ sets: [f.set({ completed: true })] })],
  });
  await seedWorkoutStorage(page, f.snapshot({ active }));
  await page
    .getByRole("button", { name: "Continue workout", exact: true })
    .click();
  await expect(new WorkoutPage(page).weight()).toBeVisible();
});
When(
  "two tabs enter 60 and 70 kilograms and the first tab tries to log",
  async ({ page }) => {
    await new WorkoutPage(page).confirmWeight("60");
    const other = await new QaRegressionsPage(page).otherTab();
    await new WorkoutPage(other).confirmWeight("70");
    await page
      .getByRole("button", { name: "Log set 1 of Bench press", exact: true })
      .click();
  },
);
Then("the first tab must review the other input", async ({ page }) => {
  await expect(
    page.getByRole("button", { name: "Keep my input", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Review 70 kg × 8 reps", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Log set 1 of Bench press", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
});
Then(
  "reloading the second tab retains its 70 kilogram input",
  async ({ page }) => {
    const other = page
      .context()
      .pages()
      .find((candidate) => candidate !== page);
    if (!other) throw new Error("The second workout tab is missing");
    await other.reload();
    await expect(new WorkoutPage(other).weight()).toHaveText("70");
    await other.close();
  },
);
When(
  "I open finish and another tab finishes and starts a replacement workout",
  async ({ page }) => {
    const qa = new QaRegressionsPage(page);
    await qa.openFinish();
    await qa.finishAndReplace();
  },
);
When(
  "another tab finishes and starts a replacement workout",
  async ({ page }) => {
    await new QaRegressionsPage(page).finishAndReplace();
  },
);
Then(
  "the old finish confirmation is closed and the replacement remains active",
  async ({ page }) => {
    await expect(new QaRegressionsPage(page).finishDialog()).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Replacement workout", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: "Undo set 1 of Bench press",
        exact: true,
      }),
    ).toBeVisible();
  },
);
Then(
  "I can save the preserved name to the original completed workout",
  async ({ page }) => {
    await page
      .getByRole("button", { name: "Review unsaved names", exact: true })
      .click();
    const recovery = page.getByRole("dialog", {
      name: "Unsaved workout names",
      exact: true,
    });
    await expect(
      recovery.getByRole("textbox", { name: "Your unsaved name", exact: true }),
    ).toHaveValue("Name worth keeping");
    await recovery
      .getByRole("button", { name: "Save name", exact: true })
      .click();
    await expect(recovery).toHaveCount(0);
    await page
      .getByRole("link", { name: "Back to workouts", exact: true })
      .click();
    await page
      .getByRole("button", { name: "View history", exact: true })
      .click();
    await expect(page.getByRole("article")).toContainText("Name worth keeping");
  },
);
Then("the replacement workout keeps its own name", async ({ page }) => {
  await page
    .getByRole("button", { name: "Back to workouts", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Continue workout", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Replacement workout", exact: true }),
  ).toBeVisible();
});
Given("I edit the description of an existing template", async ({ page }) => {
  const f = createWorkoutFactory("qa-template");
  await seedWorkoutStorage(
    page,
    f.snapshot({
      active: f.activeSession(),
      routines: {
        "qa-template": {
          id: "qa-template",
          name: "QA template",
          description: "Original",
          exercises: [
            { exerciseId: "bench-press", sets: [{ weightKg: 40, reps: 8 }] },
          ],
        },
      },
    }),
  );
  const qa = new QaRegressionsPage(page);
  await qa.editTemplate();
  await qa.description().fill("My local description");
});
When("another tab renames the active workout", async ({ page }) => {
  const other = await page.context().newPage();
  await other.goto("/#/session");
  await new EditSafetyPage(other).editName("Unrelated name");
  await new EditSafetyPage(other).saveName();
  await other.close();
});
Then("saving the template retains my description", async ({ page }) => {
  const qa = new QaRegressionsPage(page);
  await qa
    .template()
    .getByRole("button", { name: "Save template", exact: true })
    .click();
  await qa.expectTemplateSaved();
});
When("another tab edits the same template description", async ({ page }) => {
  const other = await page.context().newPage();
  await other.goto("/");
  const qa = new QaRegressionsPage(other);
  await qa.editTemplate();
  await qa.description().fill("Other tab description");
  await qa
    .template()
    .getByRole("button", { name: "Save template", exact: true })
    .click();
  await expect(
    other.getByRole("dialog", { name: "Templates", exact: true }),
  ).toBeVisible();
  await other.close();
});
Then(
  "my template input remains until I explicitly keep my changes",
  async ({ page }) => {
    const qa = new QaRegressionsPage(page);
    await qa
      .template()
      .getByRole("button", { name: "Save template", exact: true })
      .click();
    await expect(qa.description()).toHaveValue("My local description");
    await qa
      .template()
      .getByRole("button", { name: "Keep my changes", exact: true })
      .click();
    await qa.expectTemplateSaved();
  },
);
Then("cancelling browser reload retains the note", async ({ page }) => {
  const dialogPromise = page.waitForEvent("dialog");
  await page.evaluate(() => window.setTimeout(() => location.reload(), 0));
  const dialog = await dialogPromise;
  expect(dialog.type()).toBe("beforeunload");
  await dialog.dismiss();
  await expect(
    page.getByRole("textbox", { name: "Workout note", exact: true }),
  ).toHaveValue("Keep shoulders down");
});
Then("saving the note allows reload without a warning", async ({ page }) => {
  await page.getByRole("button", { name: "Save note", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Workout note", exact: true }),
  ).toHaveCount(0);
  const dialogs: string[] = [];
  page.on("dialog", async (dialog) => {
    dialogs.push(dialog.type());
    await dialog.accept();
  });
  await page.reload();
  await expect(new WorkoutPage(page).weight()).toBeVisible();
  expect(dialogs).toEqual([]);
  await page
    .getByRole("button", { name: "Options for Bench press", exact: true })
    .click();
  await page.getByRole("button", { name: "Edit note", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Workout note", exact: true }),
  ).toHaveValue("Keep shoulders down");
});
