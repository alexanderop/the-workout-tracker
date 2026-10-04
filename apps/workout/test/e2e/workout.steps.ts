import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { readFile } from "node:fs/promises";
const { Given, When, Then, Before } = createBdd();
Before({ tags: "@offline-reload" }, async ({ browserName, $testInfo }) => {
  $testInfo.skip(
    browserName === "webkit",
    "Playwright 1.63 WebKit offline emulation rejects service-worker responses: https://github.com/microsoft/playwright/issues/42775",
  );
});
const nav = (page: Page, name: string) =>
  page.getByRole("link", { name, exact: true }).filter({ visible: true });
async function openJournal(page: Page) {
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: "Today", exact: true }),
  ).toBeVisible();
}
async function log(page: Page, index: number, weight: string, reps: string) {
  await page
    .getByRole("textbox", {
      name: `Set ${index} weight for Bench press`,
      exact: true,
    })
    .fill(weight);
  await page
    .getByRole("textbox", {
      name: `Set ${index} repetitions for Bench press`,
      exact: true,
    })
    .fill(reps);
}
Given("a new training journal", async ({ page, $testInfo: testInfo }) => {
  await openJournal(page);
  await expect(page.getByText("No workouts yet")).toBeVisible();
  await expect(page.locator("body")).not.toHaveJSProperty("scrollWidth", 0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("today.png"),
    fullPage: true,
  });
});
When(
  "I start the upper body workout and log two edited sets",
  async ({ page, $testInfo: testInfo }) => {
    await page
      .getByRole("button", { name: "Start workout", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Upper body", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Finish workout", exact: true }),
    ).toBeDisabled();
    await log(page, 1, "60", "8");
    await log(page, 2, "65", "6");
    await page
      .getByRole("button", { name: "Log set 1 of Bench press", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Undo set 1 of Bench press",
        exact: true,
      }),
    ).toHaveAttribute("aria-pressed", "true");
    await page
      .getByRole("button", { name: "Log set 2 of Bench press", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Undo set 2 of Bench press",
        exact: true,
      }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("alert")).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath("active-workout.png"),
      fullPage: true,
    });
  },
);
Then("my logged sets and rest survive a reload", async ({ page }) => {
  await page.reload();
  await expect(
    page.getByRole("textbox", {
      name: "Set 1 weight for Bench press",
      exact: true,
    }),
  ).toHaveValue("60");
  await expect(
    page.getByRole("textbox", {
      name: "Set 2 repetitions for Bench press",
      exact: true,
    }),
  ).toHaveValue("6");
  await expect(
    page.getByRole("button", {
      name: "Undo set 1 of Bench press",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: /^(Skip|End) rest$/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^(Skip|End) rest$/ }).click();
  await expect(
    page.getByRole("button", { name: /^(Skip|End) rest$/ }),
  ).toHaveCount(0);
});
When("I finish the workout offline", async ({ page, context }) => {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => resolve(),
          { once: true },
        ),
      );
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText("Offline · saved locally")).toBeVisible();
  await page
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await page.getByRole("button", { name: "Save workout", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("870");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your training history" }),
  ).toBeVisible();
});
Then(
  "history and progress show only my logged work",
  async ({ page, $testInfo: testInfo }) => {
    await expect(page.getByText("1 session", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: /Upper body.*870/ }).click();
    await expect(page.getByRole("dialog")).toContainText("60 kg × 8 reps");
    await expect(page.getByRole("dialog")).toContainText("65 kg × 6 reps");
    await expect(
      page.getByRole("dialog").getByText("Not logged", { exact: true }),
    ).toHaveCount(10);
    await page.getByRole("button", { name: "Close dialog" }).click();
    await nav(page, "Progress").click();
    await expect(
      page.getByRole("heading", { name: "Progress", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".record-card")).toContainText("65 kg");
    await expect(page.getByLabel("Exercise progress")).toHaveValue(
      "bench-press",
    );
    await page.screenshot({
      path: testInfo.outputPath("progress.png"),
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  },
);
When("I create and edit my own routine", async ({ page }) => {
  await nav(page, "Workouts").click();
  await page
    .getByRole("button", { name: "Create routine", exact: true })
    .click();
  await page.getByRole("textbox", { name: "Routine name" }).fill("Lunch break");
  await page
    .getByLabel("Description (optional)")
    .fill("A short focused session");
  await page
    .getByRole("combobox", { name: "Add an exercise" })
    .selectOption("bench-press");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page
    .getByRole("spinbutton", { name: "Bench press sets", exact: true })
    .fill("2");
  await page
    .getByRole("spinbutton", { name: "Bench press weight in kg", exact: true })
    .fill("40");
  await page.getByRole("button", { name: "Save routine", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Edit Lunch break", exact: true })
    .click();
  await page
    .getByRole("spinbutton", { name: "Bench press reps", exact: true })
    .fill("10");
  await page.getByRole("button", { name: "Save routine", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Lunch break", exact: true }),
  ).toBeVisible();
});
When(
  "I export a backup and import it in a fresh browser",
  async ({ page, browser, baseURL, $testInfo: testInfo }) => {
    await page.getByRole("button", { name: "Open settings" }).click();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export backup" }).click();
    const download = await downloadPromise;
    const file = testInfo.outputPath("backup.json");
    await download.saveAs(file);
    const data: unknown = JSON.parse(await readFile(file, "utf8"));
    expect(data).toMatchObject({ format: "form-workout", version: 1 });
    const fresh = await browser.newContext({ baseURL });
    try {
      const restored = await fresh.newPage();
      await openJournal(restored);
      await restored.getByRole("button", { name: "Open settings" }).click();
      await restored.getByLabel("Choose backup file").setInputFiles(file);
      await restored
        .getByRole("button", { name: "Import this backup" })
        .click();
      await expect(
        restored.getByText(
          "Backup imported. Your existing workouts are preserved.",
        ),
      ).toBeVisible();
      await restored.getByRole("button", { name: "Close dialog" }).click();
      await nav(restored, "Workouts").click();
      await restored.reload();
      await restored
        .getByRole("button", { name: "Start Lunch break", exact: true })
        .click();
      await expect(
        restored.getByRole("textbox", {
          name: "Set 1 weight for Bench press",
          exact: true,
        }),
      ).toHaveValue("40");
      await expect(
        restored.getByRole("textbox", {
          name: "Set 1 repetitions for Bench press",
          exact: true,
        }),
      ).toHaveValue("10");
    } finally {
      await fresh.close();
    }
    await page.getByRole("button", { name: "Close dialog" }).click();
  },
);
Then("my routine is restored with its edited targets", async ({ page }) => {
  await page
    .getByRole("button", { name: "Start Lunch break", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", {
      name: "Set 1 weight for Bench press",
      exact: true,
    }),
  ).toHaveValue("40");
  await expect(
    page.getByRole("textbox", {
      name: "Set 1 repetitions for Bench press",
      exact: true,
    }),
  ).toHaveValue("10");
  await expect(
    page.getByRole("button", { name: /^Log set \d of Bench press$/ }),
  ).toHaveCount(2);
});
When("I discard an empty free workout", async ({ page }) => {
  await page.getByRole("button", { name: "Free workout", exact: true }).click();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page
    .getByRole("button", { name: "Discard workout", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Discard workout", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your workouts" }),
  ).toBeVisible();
});
Then("I can start a different routine with empty history", async ({ page }) => {
  await nav(page, "History").click();
  await expect(
    page.getByRole("heading", { name: "No workouts yet", exact: true }),
  ).toBeVisible();
  await nav(page, "Workouts").click();
  await page
    .getByRole("button", { name: "Start Lower body", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Lower body", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Finish workout", exact: true }),
  ).toBeDisabled();
});
When("two tabs edit the same set", async ({ page, context }) => {
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await log(page, 1, "70", "5");
  const other = await context.newPage();
  await other.goto("./#/session");
  await log(other, 1, "60", "8");
  await other
    .getByRole("button", { name: "Log set 1 of Bench press", exact: true })
    .click();
  await expect(
    other.getByRole("button", {
      name: "Undo set 1 of Bench press",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Save set 1 of Bench press",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Save set 1 of Bench press", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("changed in another tab");
  await other.close();
});
Then(
  "the stale draft is preserved and the saved set is not overwritten",
  async ({ page }) => {
    await expect(
      page.getByRole("textbox", {
        name: "Set 1 weight for Bench press",
        exact: true,
      }),
    ).toHaveValue("70");
    await page
      .getByRole("button", {
        name: "Discard drafts and use saved values",
        exact: true,
      })
      .click();
    await page.reload();
    await expect(
      page.getByRole("textbox", {
        name: "Set 1 weight for Bench press",
        exact: true,
      }),
    ).toHaveValue("60");
    await expect(
      page.getByRole("textbox", {
        name: "Set 1 repetitions for Bench press",
        exact: true,
      }),
    ).toHaveValue("8");
  },
);

When("I start and log a custom exercise offline", async ({ page, context }) => {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => resolve(),
          { once: true },
        ),
      );
  });
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "Free workout", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Exercise name", exact: true })
    .fill("Cable fly");
  await page
    .getByRole("combobox", { name: "Muscle group", exact: true })
    .selectOption("Chest");
  await page
    .getByRole("button", { name: "Create and add exercise", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("textbox", {
      name: "Set 1 weight for Cable fly",
      exact: true,
    })
    .fill("12.5");
  await page
    .getByRole("textbox", {
      name: "Set 1 repetitions for Cable fly",
      exact: true,
    })
    .fill("12");
  await page
    .getByRole("button", { name: "Log set 1 of Cable fly", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Undo set 1 of Cable fly" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add set", exact: true }).click();
  await expect(
    page.getByRole("textbox", {
      name: "Set 2 weight for Cable fly",
      exact: true,
    }),
  ).toHaveValue("12.5");
  await page
    .getByRole("button", {
      name: "Options for set 2 of Cable fly",
      exact: true,
    })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remove set", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remove", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", {
      name: "Set 2 weight for Cable fly",
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await page.getByRole("button", { name: "Save workout", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("150");
  await page.getByRole("button", { name: "Close dialog" }).click();
});
Then("that custom workout survives an offline reload", async ({ page }) => {
  await page.reload();
  await page.getByRole("button", { name: /Free workout.*150/ }).click();
  await expect(page.getByRole("dialog")).toContainText("Cable fly");
  await expect(page.getByRole("dialog")).toContainText("12.5 kg × 12 reps");
  await expect(
    page.getByRole("dialog").getByText("Logged", { exact: true }),
  ).toHaveCount(1);
});

Then(
  "the app has its published name and installable assets",
  async ({ page, baseURL }) => {
    await expect(page).toHaveTitle("The Workout Tracker");
    const href = await page
      .locator('link[rel="manifest"]')
      .getAttribute("href");
    expect(href).toBeTruthy();
    const manifestURL = new URL(href!, page.url());
    const response = await page.request.get(manifestURL.href);
    expect(response.ok()).toBe(true);
    const manifest: {
      name: string;
      short_name: string;
      id: string;
      start_url: string;
      scope: string;
      display: string;
      icons: { src: string; sizes: string; type: string; purpose?: string }[];
    } = await response.json();
    expect(manifest).toMatchObject({
      name: "The Workout Tracker",
      short_name: "Workout Tracker",
      display: "standalone",
    });
    for (const path of [manifest.id, manifest.start_url, manifest.scope]) {
      expect(new URL(path, manifestURL).href).toBe(baseURL);
    }
    expect(manifest.icons.map((icon) => icon.sizes)).toEqual([
      "192x192",
      "512x512",
      "512x512",
    ]);
    expect(manifest.icons.some((icon) => icon.purpose === "maskable")).toBe(
      true,
    );
    for (const icon of manifest.icons) {
      const url = new URL(icon.src, manifestURL);
      expect(url.href.startsWith(baseURL!)).toBe(true);
      const size = await page.evaluate(async (source) => {
        const image = new Image();
        image.src = source;
        await image.decode();
        return `${image.naturalWidth}x${image.naturalHeight}`;
      }, url.href);
      expect(size).toBe(icon.sizes);
    }
    const scope = await page.evaluate(
      async () => (await navigator.serviceWorker.ready).scope,
    );
    expect(scope).toBe(baseURL);
  },
);

When("I leave an unfinished draft and return to training", async ({ page }) => {
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Set 1 weight for Bench press", exact: true })
    .fill("82.5");
  await page
    .getByRole("textbox", {
      name: "Set 1 repetitions for Bench press",
      exact: true,
    })
    .fill("");
  await page
    .getByRole("link", { name: "Back to workouts", exact: true })
    .filter({ visible: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: /Resume/ })
    .filter({ visible: true })
    .first()
    .click();
  await expect(
    page.getByRole("textbox", {
      name: "Set 1 weight for Bench press",
      exact: true,
    }),
  ).toHaveValue("82.5");
});
Then(
  "my draft survives reload and reopening without counting as logged",
  async ({ page, context }) => {
    await page.reload();
    const weight = (target: Page) =>
      target.getByRole("textbox", {
        name: "Set 1 weight for Bench press",
        exact: true,
      });
    await expect(weight(page)).toHaveValue("82.5");
    await expect(
      page.getByRole("textbox", {
        name: "Set 1 repetitions for Bench press",
        exact: true,
      }),
    ).toHaveValue("");
    await expect(
      page.getByRole("button", { name: "Finish workout", exact: true }),
    ).toBeDisabled();
    await page
      .getByRole("textbox", {
        name: "Set 1 repetitions for Bench press",
        exact: true,
      })
      .fill("7");
    const reopened = await context.newPage();
    await reopened.goto("./#/session");
    await expect(weight(reopened)).toHaveValue("82.5");
    await expect(
      reopened.getByRole("button", {
        name: "Log set 1 of Bench press",
        exact: true,
      }),
    ).toHaveAttribute("aria-pressed", "false");
    await expect(
      reopened.getByRole("textbox", {
        name: "Set 1 repetitions for Bench press",
        exact: true,
      }),
    ).toHaveValue("7");
    await reopened
      .getByRole("button", { name: "Log set 1 of Bench press", exact: true })
      .click();
    await expect(
      reopened.getByRole("button", {
        name: "Undo set 1 of Bench press",
        exact: true,
      }),
    ).toHaveAttribute("aria-pressed", "true");
    await reopened.close();
  },
);
When(
  "I use the compact training controls and set options",
  async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 520 });
    await page
      .getByRole("button", { name: "Start workout", exact: true })
      .click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toHaveCount(0);
    await page
      .getByRole("button", {
        name: "Options for set 1 of Bench press",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Increase repetitions", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toContainText("9 reps");
    await page
      .getByRole("button", { name: "Close dialog", exact: true })
      .click();
    await page
      .getByRole("textbox", {
        name: "Set 1 weight for Bench press",
        exact: true,
      })
      .fill("82.5");
    await page
      .getByRole("button", { name: "Complete set", exact: true })
      .click();
    await expect(
      page.getByRole("region", { name: "Training controls" }),
    ).toContainText("rest");
    await expect(
      page.getByRole("button", { name: "Undo last log", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  },
);
Then(
  "undo and reload keep the set open without resurrecting a draft",
  async ({ page }) => {
    await page
      .getByRole("button", { name: "Undo last log", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Log set 1 of Bench press",
        exact: true,
      }),
    ).toHaveAttribute("aria-pressed", "false");
    await page.reload();
    await expect(
      page.getByRole("textbox", {
        name: "Set 1 weight for Bench press",
        exact: true,
      }),
    ).toHaveValue("82.5");
    await expect(
      page.getByRole("button", {
        name: "Log set 1 of Bench press",
        exact: true,
      }),
    ).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByText(/Draft saved on this device/)).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "End rest", exact: true }),
    ).toHaveCount(0);
  },
);
When(
  "an older draft is reopened after a completion and undo",
  async ({ page, context }) => {
    await page
      .getByRole("button", { name: "Start workout", exact: true })
      .click();
    await page
      .getByRole("textbox", {
        name: "Set 1 weight for Bench press",
        exact: true,
      })
      .fill("70");
    const other = await context.newPage();
    await other.goto("./#/session");
    await other
      .getByRole("button", {
        name: "Discard drafts and use saved values",
        exact: true,
      })
      .count();
    // Keep this tab's unrelated draft while another set is completed and undone.
    await other
      .getByRole("button", { name: "Log set 2 of Bench press", exact: true })
      .click();
    await other
      .getByRole("button", { name: "Undo set 2 of Bench press", exact: true })
      .click();
    await other.close();
    await page.reload();
  },
);
Then(
  "I must explicitly discard the stale draft before logging",
  async ({ page }) => {
    await expect(
      page.getByRole("textbox", {
        name: "Set 1 weight for Bench press",
        exact: true,
      }),
    ).toHaveValue("70");
    await page
      .getByRole("button", { name: "Log set 1 of Bench press", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "changed in another tab",
    );
    await page
      .getByRole("button", {
        name: "Discard drafts and use saved values",
        exact: true,
      })
      .click();
    await page.reload();
    await expect(
      page.getByRole("textbox", {
        name: "Set 1 weight for Bench press",
        exact: true,
      }),
    ).toHaveValue("0");
    await expect(page.getByText(/Draft saved on this device/)).toHaveCount(0);
  },
);

When("I build and complete a one-set free workout", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 520 });
  await page.getByRole("button", { name: "Free workout", exact: true }).click();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  const controls = page.getByRole("region", { name: "Training controls" });
  await expect(controls).toContainText("Choose your first exercise");
  await expect(
    page.getByRole("button", { name: "Finish workout", exact: true }),
  ).toBeDisabled();
  await controls
    .getByRole("button", { name: "Choose exercise", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Exercise name", exact: true })
    .fill("Single lift");
  await page
    .getByRole("button", { name: "Create and add exercise", exact: true })
    .click();
  await page.getByRole("button", { name: "Complete set", exact: true }).click();
  await page.getByRole("button", { name: "End rest", exact: true }).click();
  await expect(controls).toContainText("All sets logged");
  await expect(
    controls.getByRole("button", { name: "Finish training", exact: true }),
  ).toBeEnabled();
});
Then(
  "training controls offer to finish and normal navigation returns",
  async ({ page }) => {
    await page
      .getByRole("button", { name: "Finish training", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Save workout", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Close dialog", exact: true })
      .click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Training controls" }),
    ).toHaveCount(0);
  },
);
