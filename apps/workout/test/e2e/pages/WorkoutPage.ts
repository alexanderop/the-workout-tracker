import { expect, type Page } from "@playwright/test";

export class WorkoutPage {
  constructor(readonly page: Page) {}

  async open() {
    await this.page.goto("/");
    await expect(
      this.page.getByRole("button", {
        name: "Start your first workout",
        exact: true,
      }),
    ).toBeVisible();
  }

  async startWithBenchPress() {
    await this.page
      .getByRole("button", { name: "Start your first workout", exact: true })
      .click();
    const picker = this.page
      .getByRole("dialog")
      .filter({
        has: this.page.getByRole("heading", {
          name: "Select exercises",
          exact: true,
        }),
      });
    await picker
      .getByRole("textbox", { name: "Search exercises" })
      .fill("Bench press");
    await picker.getByRole("button", { name: /^Bench press Chest/ }).click();
    await picker
      .getByRole("button", { name: "Start (1)", exact: true })
      .click();
    await expect(this.weight()).toBeVisible();
  }

  async cancelSelection() {
    await this.page.getByRole("button", { name: "Start your first workout", exact: true }).click();
    const picker = this.page.getByRole("dialog", { name: "Select exercises", exact: true });
    await picker.getByRole("textbox", { name: "Search exercises" }).fill("Bench press");
    await picker.getByRole("button", { name: /^Bench press Chest/ }).click();
    await expect(picker.getByRole("button", { name: "Start (1)", exact: true })).toBeEnabled();
    await picker.getByRole("button", { name: "Close dialog", exact: true }).click();
    await this.page.reload();
    await expect(this.page.getByRole("button", { name: "Start your first workout", exact: true })).toBeVisible();
    await expect(this.page.getByRole("button", { name: "Continue workout", exact: true })).toHaveCount(0);
  }

  weight() {
    return this.page.getByRole("button", {
      name: "Set 1 weight for Bench press",
      exact: true,
    });
  }

  async confirmWeight(value: string) {
    await this.weight().click();
    const editor = this.page.getByRole("dialog", {
      name: "Weight",
      exact: true,
    });
    for (const digit of value) {
      await editor.getByRole("group", { name: "Number editor" }).press(digit);
    }
    await editor
      .getByRole("button", { name: "Use weight", exact: true })
      .click();
    await expect(this.weight()).toHaveText(value);
  }

  async expectUnloggedSet(value: string) {
    await expect(this.weight()).toHaveText(value);
    await expect(
      this.page.getByRole("button", {
        name: "Log set 1 of Bench press",
        exact: true,
      }),
    ).toHaveAttribute("aria-pressed", "false");
    await expect(
      this.page.getByRole("progressbar", { name: "Logged sets" }),
    ).toHaveCount(0);
  }

  async expectUnloggedDraft(value: string) {
    await this.expectUnloggedSet(value);
    await expect(
      this.page.getByText("Draft saved on this device.", { exact: false }),
    ).toBeVisible();
  }

  async reload() {
    await this.page.reload();
  }

  async logAndFinish() {
    await this.page
      .getByRole("button", { name: "Log set 1 of Bench press", exact: true })
      .click();
    await expect(
      this.page.getByRole("progressbar", { name: "Logged sets" }),
    ).toHaveAttribute("value", "1");
    await this.page
      .getByRole("button", { name: "Finish", exact: true })
      .first()
      .click();
    await this.page
      .getByRole("dialog")
      .filter({
        has: this.page.getByRole("heading", {
          name: "Finish this workout?",
          exact: true,
        }),
      })
      .getByRole("button", { name: "Save workout", exact: true })
      .click();
    const review = this.page
      .getByRole("dialog")
      .filter({
        has: this.page.getByRole("button", {
          name: "Save as template",
          exact: true,
        }),
      });
    await expect(review).toContainText("50 kg × 8 reps");
    await review
      .getByRole("button", { name: "Close dialog", exact: true })
      .click();
  }

  async expectHistory(volume: number) {
    if (!this.page.url().includes("view=history"))
      await this.page
        .getByRole("button", { name: "View history", exact: true })
        .click();
    const record = this.page.getByRole("article");
    await expect(record).toHaveCount(1);
    await expect(record).toContainText("Bench press");
    await expect(record).toContainText("1 sets");
    await expect(record).toContainText(`${volume} kg`);
  }

  async repeatHistory() {
    await this.page.getByRole("article").getByRole("button").click();
    await this.page
      .getByRole("button", { name: "Repeat workout", exact: true })
      .click();
    await expect(this.weight()).toBeVisible();
  }

  async createCustomExercise(name: string) {
    await this.page
      .getByRole("link", { name: "Exercises", exact: true })
      .click();
    await this.page
      .getByRole("button", { name: "Create", exact: true })
      .click();
    const dialog = this.page.getByRole("dialog");
    await dialog
      .getByRole("textbox", { name: "Exercise name", exact: true })
      .fill(name);
    await dialog
      .getByRole("button", { name: "Create exercise", exact: true })
      .click();
    await expect(dialog).toHaveCount(0);
    await this.page
      .getByRole("textbox", { name: "Search exercises" })
      .fill(name);
    await expect(this.page.getByText(name, { exact: false })).toHaveCount(1);
  }

  async createTemplate(name: string, exercise: string) {
    await this.page
      .getByRole("link", { name: "Workouts", exact: true })
      .click();
    await this.page.getByRole("button", { name: /^Templates/ }).click();
    await this.page
      .getByRole("button", { name: "Create template", exact: true })
      .click();
    const dialog = this.page.getByRole("dialog");
    await dialog
      .getByRole("textbox", { name: "Template name", exact: true })
      .fill(name);
    await dialog
      .getByRole("button", { name: "Add exercises", exact: true })
      .click();
    await dialog
      .getByRole("textbox", { name: "Search exercises" })
      .fill(exercise);
    await dialog
      .getByRole("button", {
        name: `${exercise} Other · Other · Custom`,
        exact: true,
      })
      .click();
    await dialog
      .getByRole("button", { name: "Add 1 exercises", exact: true })
      .click();
    await dialog
      .getByRole("button", { name: "Save template", exact: true })
      .click();
    await expect(
      this.page.getByRole("dialog", { name: "Templates", exact: true }),
    ).toBeVisible();
  }

  async renameTemplate(from: string, to: string) {
    await this.page
      .getByRole("button", { name: `Edit ${from}`, exact: true })
      .click();
    const dialog = this.page.getByRole("dialog");
    await dialog
      .getByRole("textbox", { name: "Template name", exact: true })
      .fill(to);
    await dialog
      .getByRole("button", { name: "Save template", exact: true })
      .click();
    await expect(
      this.page.getByRole("dialog", { name: "Templates", exact: true }),
    ).toBeVisible();
  }

  async expectSingleTemplate(name: string, exercise: string) {
    if (
      !(await this.page
        .getByRole("dialog", { name: "Templates", exact: true })
        .isVisible())
    )
      await this.page.getByRole("button", { name: /^Templates/ }).click();
    const card = this.page.getByRole("article");
    await expect(card).toHaveCount(1);
    await expect(
      card.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    await expect(card).toContainText(exercise);
  }
}
