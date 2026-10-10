import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { t, translator } from "../../../src/i18n/testing";
import { languageStorageKey } from "../../../src/app/language";
import { test } from "../fixtures";
import { readFirstLoggedWeight, seedWorkoutStorage } from "../seed";
import { createWorkoutFactory } from "../../support/factories";

const { Given, When, Then } = createBdd(test);
const { t: de } = translator("de");

async function expectGerman(page: Page) {
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(
    page.getByRole("heading", {
      name: de("shell.language.title"),
      exact: true,
    }),
  ).toBeVisible();
  const navigation = page.getByRole("navigation", {
    name: de("shell.nav.mobile"),
  });
  await expect(
    navigation.getByRole("link", { name: de("shell.nav.workouts") }),
  ).toBeVisible();
  await expect(
    navigation.getByRole("link", { name: de("shell.nav.exercises") }),
  ).toBeVisible();
}

Given("I open the language settings", async ({ page }) => {
  await page.goto("/#/settings");
  await expect(
    page.getByRole("heading", { name: t("shell.language.title"), exact: true }),
  ).toBeVisible();
});

When("I switch the language to German", async ({ page }) => {
  await page.getByRole("radio", { name: "Deutsch", exact: true }).check();
});

Then("the app is shown in German without reloading", async ({ page }) => {
  await expectGerman(page);
});

Then(
  "after reloading the app is still shown in German",
  async ({ page }) => {
    await page.reload({ waitUntil: "commit" });
    await expectGerman(page);
  },
);

Then(
  "a German browser shows the app in German without a stored choice",
  async ({ browser, baseURL }) => {
    if (!baseURL) throw new Error("The e2e config sets no baseURL");
    const context = await browser.newContext({ locale: "de-DE", baseURL });
    const page = await context.newPage();
    await page.goto("/#/settings");
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    expect(
      await page.evaluate(
        (key) => localStorage.getItem(key),
        languageStorageKey,
      ),
    ).toBeNull();
    await expectGerman(page);
    await context.close();
  },
);

Then(
  "a German browser that chose English sees the app in English",
  async ({ browser, baseURL }) => {
    if (!baseURL) throw new Error("The e2e config sets no baseURL");
    const context = await browser.newContext({ locale: "de-DE", baseURL });
    const page = await context.newPage();
    await page.goto("/#/settings");
    await page.getByRole("radio", { name: "English", exact: true }).check();
    await page.reload({ waitUntil: "commit" });
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.getByRole("heading", {
        name: t("shell.language.title"),
        exact: true,
      }),
    ).toBeVisible();
    await context.close();
  },
);

const weightEditor = (page: Page) =>
  page.getByRole("dialog", { name: de("training.setRow.weight"), exact: true });
const weightButton = (page: Page) =>
  page.getByRole("button", {
    name: de("training.setRow.weightLabel", { n: 1, exercise: "Bench press" }),
  });

Given(
  "my active workout is open in German",
  async ({ workout, page }) => {
    await workout.open();
    await page.goto("/#/settings");
    await page.getByRole("radio", { name: "Deutsch", exact: true }).check();
    const factory = createWorkoutFactory("german-decimal");
    await seedWorkoutStorage(
      page,
      factory.snapshot({ active: factory.activeSession() }),
    );
    await page.goto("/#/");
    await page
      .getByRole("button", {
        name: de("workouts.home.continueWorkout"),
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/#\/session$/);
    await expect(weightButton(page)).toBeVisible();
  },
);

When(
  "I type the weight {string} in the number editor",
  async ({ page }, text: string) => {
    await weightButton(page).click();
    const editor = page
      .getByRole("dialog", { name: de("training.setRow.weight"), exact: true })
      .getByRole("group", { name: de("common.ui.numeric.editor") });
    for (const key of text) await editor.press(key);
  },
);

Then("the number editor shows {string}", async ({ page }, text: string) => {
  await expect(
    weightEditor(page).getByRole("group", {
      name: de("common.ui.numeric.editor"),
    }),
  ).toContainText(text);
});

When("I confirm the weight", async ({ page }) => {
  await weightEditor(page)
    .getByRole("button", {
      name: de("common.ui.numeric.confirm", {
        title: de("training.setRow.weight"),
      }),
      exact: true,
    })
    .click();
});

Then("the weight reads {string}", async ({ page }, text: string) => {
  await expect(weightButton(page)).toHaveText(text);
});

When("I log the German first set", async ({ page }) => {
  await page
    .getByRole("button", {
      name: de("training.setRow.logSet", { n: 1, exercise: "Bench press" }),
      exact: true,
    })
    .click();
});

Then(
  "the journal stores a weight of {float} kilograms",
  async ({ page }, kilograms: number) => {
    await expect
      .poll(() => readFirstLoggedWeight(page))
      .toBe(kilograms);
  },
);
