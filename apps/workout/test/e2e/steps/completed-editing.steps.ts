import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../fixtures";
import { seedWorkoutStorage } from "../seed";
import { createWorkoutFactory } from "../../support/factories";
import { CompletedWorkoutPage } from "../pages/CompletedWorkoutPage";

const { Given, When, Then } = createBdd(test);
Given(
  "I have a completed workout and an independent active workout",
  async ({ page, workout }) => {
    await workout.open();
    const factory = createWorkoutFactory("completed-edit");
    const completed = factory.completedSession({
      exercises: [
        factory.sessionExercise({
          sets: [factory.set({ completed: true }), factory.set()],
        }),
      ],
    });
    const active = factory.activeSession({
      name: "Independent active workout",
    });
    await seedWorkoutStorage(
      page,
      factory.snapshot({ active, completed: { [completed.id]: completed } }),
    );
  },
);
When("I edit the completed workout", async ({ page }) => {
  await new CompletedWorkoutPage(page).open();
  await expect(
    page.getByText("40 kg × 8 reps · Not logged, read-only", { exact: true }),
  ).toBeVisible();
});
When(
  "I correct the completed name to {string} and weight to {string}",
  async ({ page }, name: string, weight: string) => {
    const history = new CompletedWorkoutPage(page);
    await history.rename(name);
    await history.weight(weight);
  },
);
When("I save the completed corrections", async ({ page }) => {
  await new CompletedWorkoutPage(page).save();
});
Then(
  "the corrected workout survives reload and the active workout stays unchanged",
  async ({ page }) => {
    await page.reload();
    await new CompletedWorkoutPage(page).open("Corrected workout");
    const editor = new CompletedWorkoutPage(page).editor();
    await expect(
      editor.getByRole("textbox", { name: "Workout name", exact: true }),
    ).toHaveValue("Corrected workout");
    await expect(
      editor.getByRole("button", {
        name: /^Bench press set 1 weight: /,
      }),
    ).toHaveText("55");
    await editor.getByRole("button", { name: "Cancel", exact: true }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Close dialog", exact: true })
      .click();
    await page.goto("/#/session");
    await expect(
      page.getByRole("heading", {
        name: "Independent active workout",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: /^Set 1 weight for Bench press: /,
      }),
    ).toHaveText("40");
    await expect(
      page.getByRole("button", {
        name: "Log set 1 of Bench press",
        exact: true,
      }),
    ).toBeVisible();
  },
);
When(
  "another tab renames the completed workout to {string}",
  async ({ page }, name: string) => {
    const other = await page.context().newPage();
    const history = new CompletedWorkoutPage(other);
    await history.open();
    await history.rename(name);
    await history.save();
    await other.close();
  },
);
Then(
  "my completed corrections remain visible with a conflict",
  async ({ page }) => {
    const editor = new CompletedWorkoutPage(page).editor();
    await expect(
      editor.getByRole("textbox", { name: "Workout name", exact: true }),
    ).toHaveValue("Local correction");
    await expect(
      editor.getByRole("button", {
        name: /^Bench press set 1 weight: /,
      }),
    ).toHaveText("55");
    await expect(editor.getByRole("alert")).toContainText("Saved data changed");
    await expect(
      editor.getByRole("button", { name: "Save changes", exact: true }),
    ).toBeDisabled();
  },
);
When(
  "I reload saved completed values and confirm discarding my corrections",
  async ({ page }) => {
    await page
      .getByRole("button", { name: "Reload saved values", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Discard and reload", exact: true })
      .click();
  },
);
Then(
  "the completed editor shows {string} and weight {string}",
  async ({ page }, name: string, weight: string) => {
    const editor = new CompletedWorkoutPage(page).editor();
    await expect(
      editor.getByRole("textbox", { name: "Workout name", exact: true }),
    ).toHaveValue(name);
    await expect(
      editor.getByRole("button", {
        name: /^Bench press set 1 weight: /,
      }),
    ).toHaveText(weight);
  },
);
When(
  "I dismiss the completed editor with Escape and keep editing",
  async ({ page }) => {
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Keep editing", exact: true })
      .click();
  },
);
When("I press browser Back from the completed editor", async ({ page }) => {
  await page.evaluate(() => history.back());
});
When("I keep the completed corrections", async ({ page }) => {
  await page.getByRole("button", { name: "Keep editing", exact: true }).click();
});
When("I discard the completed corrections", async ({ page }) => {
  await page
    .getByRole("button", { name: "Discard changes", exact: true })
    .click();
});
Then("the completed editor and review are closed", async ({ page }) => {
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).not.toHaveURL(/view=history/);
});
When(
  "I type {string} in the completed weight keypad without confirming",
  async ({ page }, value: string) => {
    await new CompletedWorkoutPage(page)
      .editor()
      .getByRole("button", { name: /^Bench press set 1 weight: / })
      .click();
    const keypad = page.getByRole("dialog", { name: "Weight", exact: true });
    for (const digit of value)
      await keypad.getByRole("group", { name: "Number editor" }).press(digit);
  },
);
Then(
  "the completed weight keypad still contains {string}",
  async ({ page }, value: string) => {
    await expect(page).toHaveURL(/view=history/);
    const keypad = page.getByRole("dialog", { name: "Weight", exact: true });
    await expect(keypad).toBeVisible();
    await expect(
      keypad.getByRole("group", { name: "Number editor" }),
    ).toContainText(value);
  },
);
When("I cancel the completed weight keypad", async ({ page }) => {
  const keypad = page.getByRole("dialog", { name: "Weight", exact: true });
  await keypad.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(keypad).toHaveCount(0);
});
When("I confirm the completed weight keypad", async ({ page }) => {
  const keypad = page.getByRole("dialog", { name: "Weight", exact: true });
  await keypad.getByRole("button", { name: "Use weight", exact: true }).click();
  await expect(keypad).toHaveCount(0);
});
