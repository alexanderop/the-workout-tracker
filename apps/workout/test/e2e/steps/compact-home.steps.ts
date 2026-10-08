import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../fixtures";
import { seedWorkoutStorage } from "../seed";
import { createWorkoutFactory } from "../../support/factories";

const { Given, When, Then } = createBdd(test);
Given(
  "my compact home is {string} on a short phone",
  async ({ page, workout }, state: string) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await workout.open();
    if (state === "fresh") return;
    const factory = createWorkoutFactory("compact");
    const now = Date.now();
    const older = factory.completedSession({
      name: "Morning strength",
      startedAt: now - 90000000,
      finishedAt: now - 86400000,
    });
    const latest = factory.completedSession({
      name: "Evening strength",
      startedAt: now - 7200000,
      finishedAt: now - 3600000,
    });
    await seedWorkoutStorage(
      page,
      factory.snapshot({
        completed: { [older.id]: older, [latest.id]: latest },
        active:
          state === "active"
            ? factory.activeSession({ name: "Today's workout" })
            : null,
      }),
    );
    await expect(
      page.getByRole("heading", { name: "Workouts", exact: true }),
    ).toBeVisible();
  },
);
Then(
  "the home actions fit above navigation without scrolling",
  async ({ page, $testInfo }) => {
    const navigation = page.getByRole("navigation", {
      name: "Mobile navigation",
    });
    await expect(navigation).toBeVisible();
    for (const control of [
      page.getByRole("button", { name: "Open training calendar" }),
      page.getByRole("button", {
        name: /^(Start your first workout|Start workout|Continue workout)$/,
      }),
      page.getByRole("button", { name: "View history", exact: true }),
      page.getByRole("button", { name: /^Templates/ }),
    ]) {
      await expect(control).toBeVisible();
      await expect(async () => {
        const [box, boundary] = await Promise.all([
          control.boundingBox(),
          navigation.boundingBox(),
        ]);
        if (!box || !boundary)
          throw new Error("Home controls and navigation must have bounds");
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.y + box.height).toBeLessThanOrEqual(boundary.y);
      }).toPass();
    }
    const size = await page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      width: document.documentElement.scrollWidth,
      viewportHeight: innerHeight,
      viewportWidth: innerWidth,
    }));
    expect(size.height).toBeLessThanOrEqual(size.viewportHeight);
    expect(size.width).toBeLessThanOrEqual(size.viewportWidth);
    await page.screenshot({
      path: $testInfo.outputPath("compact-home.png"),
      fullPage: true,
    });
  },
);
When("I open and search the full workout history", async ({ page }) => {
  await page.getByRole("button", { name: "View history", exact: true }).click();
  await expect(page).toHaveURL(/view=history/);
  await expect(
    page.getByRole("heading", { name: "History", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(2);
  await page
    .getByRole("textbox", { name: "Search workout history" })
    .fill("Morning");
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("Morning strength");
  await page.getByRole("button", { name: "Back to workouts" }).click();
});
Then(
  "returning home restores the latest workout and calendar",
  async ({ page }) => {
    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(page.getByRole("article")).toContainText("Evening strength");
    await expect(
      page.getByRole("group", { name: "Past 7 days" }).getByRole("button"),
    ).toHaveCount(7);
    await page.goto("/#/workouts?view=invalid");
    await expect(
      page.getByRole("button", { name: "View history" }),
    ).toBeVisible();
  },
);
When("I create a template draft and use browser Back", async ({ page }) => {
  await page.getByRole("button", { name: /^Templates/ }).click();
  await page
    .getByRole("button", { name: "Create template", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Template name", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("textbox", { name: "Template name", exact: true })
    .fill("Keep this draft");
  await page.goBack();
});
Then("I can keep editing the same template draft", async ({ page }) => {
  await page
    .getByRole("dialog", { name: "Discard template changes?", exact: true })
    .getByRole("button", { name: "Keep editing" })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Template name", exact: true }),
  ).toHaveValue("Keep this draft");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page
    .getByRole("button", { name: "Discard changes", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Templates/ })).toBeVisible();
});
When("I enlarge the home text", async ({ page }) => {
  await page.evaluate(() => {
    const sizes = Array.from(
      document.querySelectorAll<HTMLElement>("main *"),
      (element) => ({
        element,
        size: Number.parseFloat(getComputedStyle(element).fontSize),
      }),
    );
    for (const { element, size } of sizes)
      element.style.fontSize = `${size * 2}px`;
  });
});
Then("the home remains vertically scrollable", async ({ page }) => {
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight),
  ).toBeGreaterThan(667);
  const templates = page.getByRole("button", { name: /^Templates/ });
  await templates.scrollIntoViewIfNeeded();
  await expect(templates).toBeInViewport();
});
When(
  "I save and rename a template from the template browser",
  async ({ page }) => {
    await page.getByRole("button", { name: /^Templates/ }).click();
    await page
      .getByRole("button", { name: "Create template", exact: true })
      .click();
    await page
      .getByRole("textbox", { name: "Template name", exact: true })
      .fill("Strength");
    await page
      .getByRole("button", { name: "Add exercises", exact: true })
      .click();
    await page
      .getByRole("textbox", { name: "Search exercises" })
      .fill("Bench press");
    await page.getByRole("button", { name: /^Bench press Chest/ }).click();
    await page
      .getByRole("button", { name: "Add 1 exercises", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Save template", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(1);
    await expect(
      page.getByRole("dialog", { name: "Templates", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Edit Strength", exact: true })
      .click();
    await page
      .getByRole("textbox", { name: "Template name", exact: true })
      .fill("Evening strength");
    await page
      .getByRole("button", { name: "Save template", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Edit Evening strength", exact: true }),
    ).toBeFocused();
  },
);
Then(
  "I can start the saved template and return to compact home",
  async ({ page }) => {
    await page
      .getByRole("button", { name: "Start Evening strength", exact: true })
      .click();
    await expect(page).toHaveURL(/#\/session$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page.getByRole("button", {
        name: /^Set 1 weight for Bench press: /,
      }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: "Back to workouts", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Continue workout", exact: true }),
    ).toBeVisible();
    // The link leaves with the workout page, so focus moves to the new content.
    await expect(page.getByRole("main")).toBeFocused();
    await expect(
      page.getByRole("button", { name: "View history", exact: true }),
    ).toBeVisible();
  },
);
When("I save a history workout as a template", async ({ page }) => {
  await page.getByRole("button", { name: "View history", exact: true }).click();
  await page
    .getByRole("article")
    .filter({ hasText: "Evening strength" })
    .getByRole("button")
    .click();
  await page
    .getByRole("button", { name: "Save as template", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save template", exact: true })
    .click();
});
Then(
  "the template browser retains focus and closes back to home",
  async ({ page }) => {
    const browser = page.getByRole("dialog", {
      name: "Templates",
      exact: true,
    });
    await expect(browser).toBeVisible();
    await expect(
      browser.getByRole("button", { name: "New template", exact: true }),
    ).toBeFocused();
    await browser
      .getByRole("button", { name: "Close dialog", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "View history", exact: true }),
    ).toBeVisible();
  },
);

When("I save the latest home workout as a template", async ({ page }) => {
  await page.getByRole("article").getByRole("button").click();
  await page
    .getByRole("button", { name: "Save as template", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Template name", exact: true })
    .fill("Home conversion check");
  await page
    .getByRole("button", { name: "Save template", exact: true })
    .click();
});
Then("focus returns to the Home Templates action", async ({ page }) => {
  await expect(page.getByRole("button", { name: /^Templates/ })).toBeFocused();
  await expect(page.getByRole("status")).toHaveText("Template saved");
});
