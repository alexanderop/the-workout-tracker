import { expect, type Page } from "@playwright/test";
import { WorkoutPage } from "./WorkoutPage";
import { EditSafetyPage } from "./EditSafetyPage";

export class QaRegressionsPage {
  constructor(readonly page: Page) {}

  async otherTab() {
    const other = await this.page.context().newPage();
    await other.goto(this.page.url());
    await expect(new WorkoutPage(other).weight()).toBeVisible();
    return other;
  }

  finishDialog() {
    return this.page.getByRole("dialog", {
      name: "Finish this workout?",
      exact: true,
    });
  }

  async openFinish() {
    await this.page
      .getByRole("button", { name: "Finish", exact: true })
      .first()
      .click();
    await expect(this.finishDialog()).toBeVisible();
  }

  async finishAndReplace() {
    const other = await this.otherTab();
    const editor = new QaRegressionsPage(other);
    await editor.openFinish();
    await editor
      .finishDialog()
      .getByRole("button", { name: "Save workout", exact: true })
      .click();
    await other
      .getByRole("button", { name: "Repeat workout", exact: true })
      .click();
    const name = new EditSafetyPage(other);
    await name.editName("Replacement workout");
    await name.saveName();
    await name.logSet();
    await other.close();
  }

  async editTemplate() {
    await this.page
      .getByRole("link", { name: "Workouts", exact: true })
      .click();
    await this.page.getByRole("button", { name: /^Templates/ }).click();
    await this.page
      .getByRole("button", { name: "Edit QA template", exact: true })
      .click();
    await expect(this.template()).toBeVisible();
  }

  template() {
    return this.page.getByRole("dialog", {
      name: "Edit template",
      exact: true,
    });
  }

  description() {
    return this.template().getByRole("textbox", {
      name: "Description (optional)",
      exact: true,
    });
  }

  async expectTemplateSaved() {
    await expect(
      this.page.getByRole("dialog", { name: "Templates", exact: true }),
    ).toBeVisible();
    await this.page
      .getByRole("button", { name: "Edit QA template", exact: true })
      .click();
    await expect(this.description()).toHaveValue("My local description");
  }
}
