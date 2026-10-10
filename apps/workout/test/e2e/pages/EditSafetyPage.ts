import { expect, type Page } from "@playwright/test";

export class EditSafetyPage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }
  name() {
    return this.page.getByRole("textbox", {
      name: "Workout name",
      exact: true,
    });
  }
  async editName(name: string) {
    // Rename starts closed on every page load; each caller opens it once.
    await expect(this.name()).toHaveCount(0);
    await this.page.getByRole("button", { name: "Rename workout", exact: true }).click();
    await this.name().fill(name);
  }
  async saveName() {
    await this.page
      .getByRole("button", { name: "Save name", exact: true })
      .click();
    await expect(this.page.getByRole("button", { name: "Save name", exact: true })).toHaveCount(0);
    await expect(this.page.getByRole("button", { name: "Rename workout", exact: true })).toBeVisible();
  }
  async logSet() {
    await this.page
      .getByRole("button", { name: "Log set 1 of Bench press", exact: true })
      .click();
    await expect(
      this.page.getByRole("progressbar", { name: "Logged sets" }),
    ).toHaveAttribute("value", "1");
  }
  /** The rename sheet is still open with this unsaved input. */
  async expectDraftName(name: string) {
    await expect(this.name()).toHaveValue(name);
  }
  /** The rename sheet is closed and the workout shows this saved name. */
  async expectSavedName(name: string) {
    await expect(this.name()).toHaveCount(0);
    await expect(
      this.page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  }
  async expectConflict() {
    await expect(
      this.page.getByRole("button", { name: "Keep my name", exact: true }),
    ).toBeVisible();
  }
  async renameInOtherTab(name: string) {
    const other = await this.page.context().newPage();
    await other.goto(this.page.url());
    const editor = new EditSafetyPage(other);
    await editor.editName(name);
    await editor.saveName();
    await expect(
      other.getByRole("button", { name: "Save name", exact: true }),
    ).toHaveCount(0);
    await other.close();
  }
  async expectSavedAfterReload(name: string) {
    await this.page.reload();
    await this.expectSavedName(name);
  }
  async openNote(text: string) {
    await this.page
      .getByRole("button", { name: "Options for Bench press", exact: true })
      .click();
    await this.page
      .getByRole("button", { name: "Add note", exact: true })
      .click();
    await this.page
      .getByRole("textbox", { name: "Workout note", exact: true })
      .fill(text);
  }
  async goBack() {
    await this.page.evaluate(() => history.back());
  }
  async keepNote(text: string) {
    await this.page
      .getByRole("button", { name: "Keep editing", exact: true })
      .click();
    await expect(
      this.page.getByRole("textbox", { name: "Workout note", exact: true }),
    ).toHaveValue(text);
    await expect(this.page).toHaveURL(/#\/session/);
  }
  async discardNote() {
    await this.page
      .getByRole("button", { name: "Discard changes", exact: true })
      .click();
    await expect(this.page).not.toHaveURL(/#\/session/);
  }
  async discardName() {
    await this.page
      .getByRole("button", { name: "Discard name change", exact: true })
      .click();
    await expect(this.page).not.toHaveURL(/#\/session/);
  }
}
