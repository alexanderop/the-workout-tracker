import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../fixtures";
import { seedWorkoutStorage } from "../seed";
import { createWorkoutFactory } from "../../support/factories";

const { Given, When, Then } = createBdd(test);
Given(
  "my calendar contains two completed workouts today",
  async ({ workout, page }) => {
    const now = new Date(2026, 9, 5, 20).getTime();
    await page.clock.setFixedTime(now);
    await workout.open();
    const factory = createWorkoutFactory("calendar");
    const morning = factory.completedSession({
      name: "Morning strength",
      startedAt: now - 12 * 3_600_000,
      finishedAt: now - 11 * 3_600_000,
    });
    const evening = factory.completedSession({
      name: "Evening strength",
      startedAt: now - 2 * 3_600_000,
      finishedAt: now - 3_600_000,
    });
    await seedWorkoutStorage(
      page,
      factory.snapshot({
        completed: { [morning.id]: morning, [evening.id]: evening },
      }),
    );
    await expect(
      page.getByRole("group", { name: "Past 7 days" }).getByRole("button"),
    ).toHaveCount(7);
  },
);
When("I select today in my training rhythm", async ({ page }) => {
  await page
    .getByRole("group", { name: "Past 7 days" })
    .getByRole("button", {
      name: "Mon 5, Monday, October 5, 2026, 2 completed workouts",
      exact: true,
    })
    .click();
});
Then("the calendar lists both of today's workouts", async ({ page }) => {
  const calendar = page.getByRole("dialog", {
    name: "Training calendar",
    exact: true,
  });
  await expect(
    calendar.getByRole("button", {
      name: "Monday, October 5, 2026, 2 completed workouts",
    }),
  ).toBeFocused();
  await expect(
    calendar.getByRole("button", { name: "Morning strength 60 min · 1 set" }),
  ).toBeVisible();
  await expect(
    calendar.getByRole("button", { name: "Evening strength 60 min · 1 set" }),
  ).toBeVisible();
  await expect(
    calendar.getByRole("button", { name: "Next month" }),
  ).toBeDisabled();
});
When("I open {string} from the calendar", async ({ page }, name: string) => {
  await page
    .getByRole("dialog", { name: "Training calendar", exact: true })
    .getByRole("button", { name: `${name} 60 min · 1 set` })
    .click();
});
Then("its review offers repeating and saving a template", async ({ page }) => {
  await expect(page.getByRole("dialog")).toHaveCount(1);
  const review = page.getByRole("dialog", {
    name: "Evening strength",
    exact: true,
  });
  await expect(
    review.getByRole("button", { name: "Repeat workout", exact: true }),
  ).toBeVisible();
  await expect(
    review.getByRole("button", { name: "Save as template", exact: true }),
  ).toBeVisible();
});
When("I close the calendar workout review", async ({ page }) => {
  await page
    .getByRole("dialog", { name: "Evening strength", exact: true })
    .getByRole("button", { name: "Close dialog" })
    .click();
});
Then("focus returns to the training calendar action", async ({ page }) => {
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Open training calendar" }),
  ).toBeFocused();
});
