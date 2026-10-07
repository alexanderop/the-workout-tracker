import { expect, type Page, type TestInfo } from "@playwright/test";

export class ExerciseCatalogPage {
  constructor(readonly page: Page) {}
  picker() {
    return this.page.getByRole("dialog", {
      name: "Select exercises",
      exact: true,
    });
  }
  filterSheet(name = "Filters") {
    return this.page.getByRole("dialog", { name, exact: true });
  }
  rows() {
    return this.picker()
      .getByRole("button", { pressed: undefined })
      .filter({ has: this.page.locator(".catalog-row-name") });
  }
  async capture(info: TestInfo, name: string) {
    const path = info.outputPath(`${name}.png`);
    await this.page.screenshot({ path });
    await info.attach(name, { path, contentType: "image/png" });
  }
  async selectBench() {
    await this.page
      .getByRole("button", { name: "Start your first workout", exact: true })
      .click();
    await this.picker()
      .getByRole("button", { name: /^Bench press Chest/ })
      .click();
  }
  async browseFilters(info: TestInfo) {
    await expect(
      this.picker().getByRole("heading", {
        name: "Select exercises",
        exact: true,
      }),
    ).toBeInViewport();
    await expect(
      this.picker().getByRole("button", { name: "Start (1)", exact: true }),
    ).toBeInViewport();
    await this.capture(info, "exercise-catalog");
    await this.picker()
      .getByRole("button", { name: "Filters", exact: true })
      .click();
    await this.filterSheet()
      .getByRole("button", { name: "Equipment All", exact: true })
      .click();
    await this.capture(info, "equipment-filters");
    await this.filterSheet("Equipment")
      .getByRole("button", { name: "Barbell", exact: true })
      .click();
    await expect(
      this.filterSheet().getByRole("button", {
        name: "Equipment Barbell",
        exact: true,
      }),
    ).toBeFocused();
    await this.filterSheet()
      .getByRole("button", { name: "Muscle group All", exact: true })
      .click();
    await this.capture(info, "muscle-filters");
    await this.filterSheet("Muscle group")
      .getByRole("button", { name: "Chest", exact: true })
      .click();
    await expect(
      this.filterSheet().getByRole("button", {
        name: "Muscle group Chest",
        exact: true,
      }),
    ).toBeFocused();
    await this.filterSheet()
      .getByRole("switch", { name: "Only custom exercises" })
      .check();
    await this.filterSheet()
      .getByRole("button", { name: "Done", exact: true })
      .click();
    await this.picker()
      .getByRole("textbox", { name: "Search exercises" })
      .fill("press");
  }
  async expectCustomOnly() {
    await expect(this.rows()).toHaveCount(1);
    await expect(this.rows()).toHaveText(
      "My barbell pressChest · Barbell · Custom",
    );
    await expect(
      this.picker().getByRole("button", { name: "Start (1)", exact: true }),
    ).toBeEnabled();
  }
  async resetFilters() {
    await this.picker()
      .getByRole("button", { name: "Filters", exact: true })
      .click();
    await this.filterSheet()
      .getByRole("button", { name: "Reset filters", exact: true })
      .click();
    await this.filterSheet()
      .getByRole("button", { name: "Done", exact: true })
      .click();
  }
  async expectPreserved() {
    await expect(
      this.picker().getByRole("textbox", { name: "Search exercises" }),
    ).toHaveValue("press");
    await expect(
      this.picker().getByRole("button", { name: /^Bench press Chest/ }),
    ).toHaveAttribute("aria-pressed", "true");
  }
  async clearEmptySearch() {
    await this.picker()
      .getByRole("textbox", { name: "Search exercises" })
      .fill("no-such-exercise");
    await this.picker()
      .getByRole("button", { name: "Clear search and filters", exact: true })
      .click();
  }
  async expectCleared() {
    await expect(
      this.picker().getByRole("textbox", { name: "Search exercises" }),
    ).toBeFocused();
    await expect(
      this.picker().getByRole("textbox", { name: "Search exercises" }),
    ).toHaveValue("");
    await expect(this.rows()).toHaveCount(90);
  }
  async reverseOrder() {
    await expect(this.rows().first()).toContainText("Ab wheel rollout");
    await this.picker()
      .getByRole("button", { name: "Sort Z to A", exact: true })
      .click();
    await expect(this.rows().first()).toContainText("Walking lunge");
    await this.picker()
      .getByRole("button", { name: "Sort A to Z", exact: true })
      .click();
    await expect(this.rows().first()).toContainText("Ab wheel rollout");
  }
  async dismissNestedFilters() {
    await this.picker()
      .getByRole("button", { name: "Filters", exact: true })
      .click();
    await this.filterSheet()
      .getByRole("button", { name: "Equipment All", exact: true })
      .click();
    await this.page.keyboard.press("Escape");
    await expect(this.filterSheet("Equipment")).toHaveCount(0);
    await expect(this.picker()).toBeVisible();
    await expect(
      this.picker().getByRole("button", { name: "Filters", exact: true }),
    ).toBeFocused();
  }
  async startSelected() {
    await this.picker()
      .getByRole("button", { name: "Start (1)", exact: true })
      .click();
    await expect(
      this.page.getByRole("button", {
        name: "Set 1 weight for Bench press",
        exact: true,
      }),
    ).toBeVisible();
  }
}
