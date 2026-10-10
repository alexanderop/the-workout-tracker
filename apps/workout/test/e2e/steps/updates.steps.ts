import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../fixtures";
import { UpdatesPage } from "../pages/UpdatesPage";

const { Given, When, Then } = createBdd(test);

Given(
  "version 1 of the app is installed",
  async ({ page, request, workout }) => {
    const updates = new UpdatesPage(page, request);
    await updates.serve("1");
    await workout.open();
    await updates.expectControlled();
    // A returning visit: the worker already controls the page at load.
    await page.reload();
    await updates.expectControlled();
    await updates.expectVersion(page, "1");
  },
);

When("version 2 is deployed", async ({ page, request }) => {
  const updates = new UpdatesPage(page, request);
  await updates.markDocument();
  await updates.deploy("2");
});

Then("no update is offered", async ({ page, request }) => {
  await new UpdatesPage(page, request).expectNoUpdateOffered();
});

Then("the update is offered", async ({ page, request }) => {
  await new UpdatesPage(page, request).expectUpdateOffered();
});

Then("the page has not reloaded", async ({ page, request }) => {
  await new UpdatesPage(page, request).expectSameDocument();
});

Then(
  "the app runs version {int}",
  async ({ page, request }, version: number) => {
    await new UpdatesPage(page, request).expectVersion(page, String(version));
  },
);

When("I discard the workout", async ({ page, request }) => {
  await new UpdatesPage(page, request).discardWorkout();
});

When("I accept the update", async ({ page, request }) => {
  await new UpdatesPage(page, request).accept();
});

When(
  "another tab activates version 2",
  async ({ page, request, tabs }) => {
    const other = await new UpdatesPage(page, request).activateFromAnotherTab();
    tabs.remember(other);
  },
);

Given(
  "a second tab shows the workouts without an active workout",
  async ({ page, request, tabs }) => {
    const other = await page.context().newPage();
    await other.goto("/");
    await expect(
      other.getByRole("button", {
        name: "Start your first workout",
        exact: true,
      }),
    ).toBeVisible();
    await new UpdatesPage(other, request).expectControlled();
    tabs.remember(other);
  },
);

Then("this tab knows an update is waiting", async ({ page, request }) => {
  await new UpdatesPage(page, request).expectUpdateKnown();
});

When(
  "I accept the update in the second tab",
  async ({ page, request, tabs }) => {
    await new UpdatesPage(page, request).acceptInAnotherTab(tabs.second());
  },
);

Then(
  "this tab was taken over by version 2 without reloading or a prompt",
  async ({ page, request }) => {
    const updates = new UpdatesPage(page, request);
    await updates.expectTakenOverWithoutReload();
    await updates.expectReloadKnown();
  },
);

Then(
  "this tab was taken over by version 2 without reloading",
  async ({ page, request }) => {
    await new UpdatesPage(page, request).expectTakenOverWithoutReload();
  },
);

Then(
  "the template {string} is still open",
  async ({ page }, name: string) => {
    await expect(
      page
        .getByRole("dialog", { name: "Create template", exact: true })
        .getByRole("textbox", { name: "Template name", exact: true }),
    ).toHaveValue(name);
  },
);

When("I close the templates", async ({ page }) => {
  await page
    .getByRole("dialog", { name: "Templates", exact: true })
    .getByRole("button", { name: "Close dialog", exact: true })
    .click();
});

Then("this tab offers a reload",async ({ page, request }) => {
  await new UpdatesPage(page, request).expectReloadOffered();
});

When("I reload from the update notice", async ({ page, request }) => {
  await new UpdatesPage(page, request).reload();
});
