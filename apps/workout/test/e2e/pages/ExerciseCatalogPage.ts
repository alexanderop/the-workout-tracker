import { expect, type Page, type TestInfo } from "@playwright/test";

// The Filters and Sort buttons are named after their visible text first.
const SORTED_ASCENDING = "Sorted A–Z, switch to Z–A";
const SORTED_DESCENDING = "Sorted Z–A, switch to A–Z";

export class ExerciseCatalogPage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }
  picker() {
    return this.page.getByRole("dialog", {
      name: "Select exercises",
      exact: true,
    });
  }
  filtersButton() {
    return this.picker().getByRole("button", { name: /, Filters$/ });
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
    ).toBeInViewport({ ratio: 1 });
    await expect(
      this.picker().getByRole("button", { name: "Start (1)", exact: true }),
    ).toBeInViewport({ ratio: 1 });
    await this.capture(info, "exercise-catalog");
    await this.filtersButton().click();
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
  async expectSelectionAndFiltersVisible() {
    await this.page.setViewportSize({ width: 320, height: 568 });
    await expect(this.rows().first()).toBeInViewport({ ratio: 1 });
    await expect(
      this.picker().getByRole("button", { name: "Start (1)", exact: true }),
    ).toBeInViewport({ ratio: 1 });
    await expect(
      this.picker().getByRole("button", {
        name: "Remove Bench press from selection",
        exact: true,
      }),
    ).toBeVisible();
    for (const label of ["Barbell", "Chest", "Only custom exercises"]) {
      await expect(
        this.picker().getByRole("button", {
          name: `Remove ${label} filter`,
          exact: true,
        }),
      ).toBeVisible();
    }
  }
  async removeNamedFilters() {
    await this.picker()
      .getByRole("button", { name: SORTED_ASCENDING, exact: true })
      .click();
    for (const label of ["Only custom exercises", "Chest", "Barbell"]) {
      await this.picker()
        .getByRole("button", { name: `Remove ${label} filter`, exact: true })
        .click();
      await expect(this.filtersButton()).toBeFocused();
      await expect(
        this.picker().getByRole("button", {
          name: `Remove ${label} filter`,
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(
        this.picker().getByRole("textbox", { name: "Search exercises" }),
      ).toHaveValue("press");
      await expect(
        this.picker().getByRole("button", {
          name: SORTED_DESCENDING,
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        this.picker().getByRole("button", {
          name: "Remove Bench press from selection",
          exact: true,
        }),
      ).toBeVisible();
    }
    await expect(
      this.picker().getByRole("button", { name: /^Bench press Chest/ }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(this.rows()).not.toHaveCount(1);
  }
  async removeHiddenSelection() {
    await this.page.setViewportSize({ width: 320, height: 568 });
    await this.picker()
      .getByRole("textbox", { name: "Search exercises" })
      .fill("squat");
    await expect(
      this.picker().getByRole("button", { name: /^Bench press Chest/ }),
    ).toHaveCount(0);
    const remove = this.picker().getByRole("button", {
      name: "Remove Bench press from selection",
      exact: true,
    });
    await expect(remove).toBeInViewport({ ratio: 1 });
    await expect(this.rows().first()).toBeInViewport({ ratio: 1 });
    await expect(
      this.picker().getByRole("button", { name: "Start (1)", exact: true }),
    ).toBeInViewport({ ratio: 1 });
    await remove.click();
    await expect(remove).toHaveCount(0);
    await expect(
      this.picker().getByRole("textbox", { name: "Search exercises" }),
    ).toBeFocused();
    await expect(
      this.picker().getByRole("button", { name: "Start (0)", exact: true }),
    ).toBeDisabled();
  }
  async resetFilters() {
    await this.filtersButton().click();
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
      .getByRole("button", { name: SORTED_ASCENDING, exact: true })
      .click();
    await expect(this.rows().first()).toContainText("Walking lunge");
    await this.picker()
      .getByRole("button", { name: SORTED_DESCENDING, exact: true })
      .click();
    await expect(this.rows().first()).toContainText("Ab wheel rollout");
  }
  async dismissNestedFilters() {
    await this.filtersButton().click();
    await this.filterSheet()
      .getByRole("button", { name: "Equipment All", exact: true })
      .click();
    await this.page.keyboard.press("Escape");
    await expect(this.filterSheet("Equipment")).toHaveCount(0);
    await expect(this.picker()).toBeVisible();
    await expect(this.filtersButton()).toBeFocused();
  }
  async startSelected() {
    await this.picker()
      .getByRole("button", { name: "Start (1)", exact: true })
      .click();
    await expect(
      this.page.getByRole("button", {
        name: /^Set 1 weight for Bench press: /,
      }),
    ).toBeVisible();
  }
}
