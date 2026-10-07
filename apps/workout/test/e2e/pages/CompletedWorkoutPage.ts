import { expect, type Page } from "@playwright/test";

export class CompletedWorkoutPage {
  constructor(readonly page: Page) {}
  editor() {
    return this.page.getByRole("dialog", { name: "Edit workout", exact: true });
  }
  async open(name = "Previous workout") {
    await this.page.goto("/#/workouts?view=home");
    await this.page
      .getByRole("button", { name: "View history", exact: true })
      .click();
    await this.page
      .getByRole("article")
      .getByRole("button", { name: new RegExp(name) })
      .click();
    await this.page
      .getByRole("button", { name: "Edit workout", exact: true })
      .click();
    await expect(this.editor()).toBeVisible();
  }
  async rename(name: string) {
    await this.editor()
      .getByRole("textbox", { name: "Workout name", exact: true })
      .fill(name);
  }
  async weight(value: string) {
    await this.editor()
      .getByRole("button", { name: "Bench press set 1 weight", exact: true })
      .click();
    const keypad = this.page.getByRole("dialog", {
      name: "Weight",
      exact: true,
    });
    const keys = keypad.getByRole("group", { name: "Number editor" });
    for (const digit of value) await keys.press(digit);
    await keypad
      .getByRole("button", { name: "Use weight", exact: true })
      .click();
    await expect(keypad).toHaveCount(0);
    await expect(
      this.editor().getByRole("button", {
        name: "Bench press set 1 weight",
        exact: true,
      }),
    ).toBeFocused();
  }
  async save() {
    await this.editor()
      .getByRole("button", { name: "Save changes", exact: true })
      .click();
    await expect(this.editor()).toHaveCount(0);
  }
}
