import { expect, type Page } from "@playwright/test";

/** The weight keypad of the first set and the plate settings behind it. */
export class BarbellPlatesPage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  weight() {
    return this.page.getByRole("button", {
      name: /^Set 1 weight for Bench press: /,
    });
  }

  keypad() {
    return this.page.getByRole("dialog", { name: "Weight", exact: true });
  }

  async typeWeight(value: string) {
    await this.weight().click();
    await expect(this.keypad()).toBeVisible();
    await this.keypad()
      .getByRole("group", { name: "Number editor" })
      .pressSequentially(value);
  }

  async expectPlates(description: string) {
    await expect(this.keypad().getByRole("img")).toHaveAccessibleName(
      description,
    );
  }

  async choose(value: string) {
    await this.keypad()
      .getByRole("region", { name: "Suggested values" })
      .getByRole("button", { name: value, exact: true })
      .click();
    await expect(this.keypad()).toHaveCount(0);
  }

  async expectWeight(value: string) {
    await expect(this.weight()).toHaveText(value);
  }

  async turnOffPlate(name: string) {
    const plate = this.page.getByRole("button", { name, exact: true });
    await expect(plate).toHaveAttribute("aria-pressed", "true");
    await plate.click();
    await expect(plate).toHaveAttribute("aria-pressed", "false");
  }
}
