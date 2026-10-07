import { expect, type Page } from "@playwright/test";
import { WorkoutPage } from "./WorkoutPage";

export class MobileControlsPage {
  constructor(private readonly page: Page) {}

  async openShortWorkout() {
    await this.page.setViewportSize({ width: 320, height: 568 });
    const workout = new WorkoutPage(this.page);
    await workout.open();
    await workout.startWithBenchPress();
  }

  async inspectKeypad() {
    await this.page
      .getByRole("button", {
        name: "Set 1 weight for Bench press",
        exact: true,
      })
      .click();
    const dialog = this.page.getByRole("dialog", {
      name: "Weight",
      exact: true,
    });
    const confirm = dialog.getByRole("button", {
      name: "Use weight",
      exact: true,
    });
    await expect(confirm).toBeInViewport({ ratio: 1 });
    const confirmationBox = await confirm.boundingBox();
    const keys = dialog
      .getByRole("group", { name: "Numeric keypad" })
      .getByRole("button");
    for (const key of await keys.all()) {
      await expect(key).toBeInViewport({ ratio: 1 });
      const box = await key.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      if (!box || !confirmationBox)
        throw new Error("Numeric controls must have visible bounds");
      expect(box.y + box.height).toBeLessThanOrEqual(confirmationBox.y - 12);
    }
    await dialog.getByRole("group", { name: "Number editor" }).press("5");
    await confirm.click();
    await expect(
      this.page.getByRole("button", {
        name: "Set 1 weight for Bench press",
        exact: true,
      }),
    ).toHaveText("5");
  }

  async logAndUndoExplicitly() {
    await this.page
      .getByRole("button", { name: "Log set 1 of Bench press", exact: true })
      .click();
    const logged = this.page.getByRole("button", {
      name: "Logged set 1 of Bench press",
      exact: true,
    });
    await expect(logged).toHaveAttribute("aria-disabled", "true");
    await expect(logged).toContainText("Logged");
    await this.page
      .getByRole("button", {
        name: "Options for set 1 of Bench press",
        exact: true,
      })
      .click();
    const editor = this.page.getByRole("dialog", {
      name: "Bench press · Set 1",
      exact: true,
    });
    await editor.getByRole("button", { name: "Undo log", exact: true }).click();
    await expect(
      editor.getByRole("button", {
        name: "Log set 1 of Bench press",
        exact: true,
      }),
    ).toBeEnabled();
    await editor.getByRole("button", { name: "Done", exact: true }).click();
    await expect(
      this.page.getByRole("progressbar", { name: "Logged sets" }),
    ).toHaveCount(0);
  }

  async addAndNavigate() {
    await this.page
      .getByRole("button", { name: "Add set", exact: true })
      .click();
    await expect(
      this.page.getByRole("button", {
        name: "Options for set 2 of Bench press",
        exact: true,
      }),
    ).toBeFocused();
    await this.page
      .getByRole("region", { name: "Training controls" })
      .getByRole("button", { name: /Next: Bench press/ })
      .click();
    await expect(
      this.page.getByRole("button", {
        name: "Options for set 1 of Bench press",
        exact: true,
      }),
    ).toBeFocused();
    await this.page
      .getByRole("button", { name: "Options for Bench press", exact: true })
      .click();
    await this.page
      .getByRole("button", { name: "2 sets", exact: true })
      .click();
    const dialog = this.page.getByRole("dialog", {
      name: "Configure Bench press",
      exact: true,
    });
    await expect(
      dialog.getByText("Number of sets", { exact: true }),
    ).toBeVisible();
    const save = await dialog
      .getByRole("button", { name: "Save exercise settings", exact: true })
      .boundingBox();
    expect(save?.height).toBeGreaterThanOrEqual(44);
  }
}
