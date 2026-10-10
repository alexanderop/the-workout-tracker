import { expect, type Locator, type Page } from "@playwright/test";

/** The Settings hub and the detail page behind each of its rows. */
export class SettingsPage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  /** Opens the hub with the Settings tab of the mobile navigation. */
  async openHub() {
    await this.page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Settings", exact: true })
      .click();
    await expect(this.hubHeading()).toBeVisible();
  }

  /** Opens the hub, then the row for one section. */
  async openSection(name: string) {
    if (!(await this.hubHeading().isVisible())) await this.openHub();
    await this.row(name).click();
    await expect(this.sectionHeading(name)).toBeVisible();
  }

  hubHeading() {
    return this.page.getByRole("heading", {
      name: "Settings",
      exact: true,
      level: 1,
    });
  }

  sectionHeading(name: string) {
    return this.page.getByRole("heading", { name, exact: true, level: 1 });
  }

  /** A row is a link named by its title and its current value. */
  row(name: string): Locator {
    return this.page
      .locator(".settings-hub")
      .getByRole("link", { name, exact: false });
  }

  backLink() {
    return this.page.locator(".settings-screen").getByRole("link", {
      name: "Settings",
      exact: true,
    });
  }
}
