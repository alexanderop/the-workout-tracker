import { expect, type Locator, type Page } from "@playwright/test";

export class ExerciseCreatePage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }
  sheet(name: string) {
    return this.page.getByRole("dialog", { name, exact: true });
  }
  /** Visible and not covered by the sheet's sticky header or footer. */
  async expectUnobscured(control: Locator) {
    await expect(control).toBeInViewport({ ratio: 1 });
    const onTop = await control.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const hit = document.elementFromPoint(
        box.left + box.width / 2,
        box.top + box.height / 2,
      );
      return hit !== null && element.contains(hit);
    });
    expect(onTop).toBe(true);
  }
  async open() {
    await this.page.setViewportSize({ width: 320, height: 568 });
    await this.page
      .getByRole("link", { name: "Exercises", exact: true })
      .click();
    await this.page
      .getByRole("button", { name: "Create", exact: true })
      .click();
    await expect(this.sheet("Create exercise")).toBeVisible();
  }
  async chooseSecondaryFromScrolledOverview() {
    const overview = this.sheet("Create exercise");
    await overview.evaluate((sheet) => {
      sheet.scrollTop = sheet.scrollHeight;
    });
    await overview.getByRole("button", { name: /^Secondary muscles/ }).click();
    const secondary = this.sheet("Secondary muscles");
    // The "Back" muscle card shares the link's name, so find the link itself.
    await this.expectUnobscured(secondary.locator("[data-slot=back-link]"));
    for (const group of ["Shoulders", "Arms", "Core"])
      await secondary.getByRole("button", { name: group, exact: true }).click();
    const done = secondary.getByRole("button", { name: "Done", exact: true });
    await this.expectUnobscured(done);
    await done.click();
  }
  async expectSummaryAndCreate(name: string) {
    const overview = this.sheet("Create exercise");
    const row = overview.getByRole("button", {
      name: "Secondary muscles Shoulders, Arms, Core",
      exact: true,
    });
    await expect(row).toBeFocused();
    await expect(row).toContainText("Shoulders +2");
    await this.expectUnobscured(row);
    await overview
      .getByRole("textbox", { name: "Exercise name", exact: true })
      .fill(name);
    const create = overview.getByRole("button", {
      name: "Create exercise",
      exact: true,
    });
    await this.expectUnobscured(create);
    await create.click();
    await expect(overview).toHaveCount(0);
  }
}
