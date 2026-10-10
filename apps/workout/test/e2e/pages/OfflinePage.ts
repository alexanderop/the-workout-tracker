import { expect, type Page } from "@playwright/test";

/** Connectivity of the scenario's browser context, as a user would lose it. */
export class OfflinePage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  /** Opens the app online, waits for the worker to cache it, and reloads. */
  async openReadyForOffline() {
    await this.page.goto("/");
    await expect(
      this.page.getByRole("button", {
        name: "Start your first workout",
        exact: true,
      }),
    ).toBeVisible();
    await this.expectControlled();
    // A returning visit, as the offline reload in a scenario will be.
    await this.page.reload();
    await this.expectControlled();
  }

  private async expectControlled() {
    await this.page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await this.page.waitForFunction(
      () => navigator.serviceWorker.controller !== null,
    );
  }

  async goOffline() {
    await this.page.context().setOffline(true);
  }

  async goOnline() {
    await this.page.context().setOffline(false);
  }

  async expectOfflineNotice() {
    await expect(
      this.page.getByText("Offline · saved locally", { exact: false }),
    ).toBeVisible();
  }

  async expectLoggedSets(count: number) {
    await expect(
      this.page.getByRole("progressbar", { name: "Logged sets" }),
    ).toHaveAttribute("value", String(count));
  }
}
