import { expect, type APIRequestContext, type Page } from "@playwright/test";

/**
 * Drives the two-version test server (scripts/serve-e2e.mjs) and observes the
 * service worker the way a user's browser would: through real registrations,
 * the Update app notice and the build version of the loaded document.
 */
export class UpdatesPage {
  constructor(
    readonly page: Page,
    private readonly request: APIRequestContext,
  ) {}

  /** The server answers with this build until told otherwise. */
  async serve(version: "1" | "2") {
    const response = await this.request.post(
      `/__test/version?value=${version}`,
    );
    expect(response.ok()).toBe(true);
  }

  /** Waits until the service worker controls the page and cached the app. */
  async expectControlled() {
    await this.page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await this.page.waitForFunction(
      () => navigator.serviceWorker.controller !== null,
    );
  }

  /** Deploys a new version and waits for the browser to hold it, waiting. */
  async deploy(version: "2") {
    await this.serve(version);
    await this.page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
    });
    await this.expectWaitingWorker(this.page);
  }

  async expectWaitingWorker(page: Page) {
    await page.waitForFunction(async () =>
      Boolean((await navigator.serviceWorker.getRegistration())?.waiting),
    );
  }

  /** Tags the loaded document so a later check can tell if it was replaced. */
  async markDocument() {
    await this.page.evaluate(() => {
      const root = document.documentElement;
      root.dataset.sameDocument = "yes";
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        root.dataset.controllerChanged = "yes";
      });
    });
  }

  async expectSameDocument() {
    await expect(this.page.locator("html")).toHaveAttribute(
      "data-same-document",
      "yes",
    );
  }

  /** The build version in the loaded document, not the active worker. */
  async expectVersion(page: Page, version: string) {
    await expect(page.locator('meta[name="build-version"]')).toHaveAttribute(
      "content",
      version,
    );
  }

  updateNotice(page: Page = this.page) {
    return page.getByRole("status").filter({
      has: page.getByRole("button", { name: "Update app", exact: true }),
    });
  }

  async expectUpdateOffered(page: Page = this.page) {
    await expect(this.updateNotice(page)).toContainText(
      "A new version of The Workout Tracker is ready.",
    );
  }

  async expectNoUpdateOffered(page: Page = this.page) {
    await expect(
      page.getByRole("button", { name: "Update app", exact: true }),
    ).toHaveCount(0);
  }

  async accept(page: Page = this.page) {
    await page.getByRole("button", { name: "Update app", exact: true }).click();
  }

  /**
   * A second tab asks the waiting worker to take over, as the Update app button
   * does. That button is withheld during an active workout, so this stands in
   * for any tab or window that activates the new version. Whether this tab then
   * reloads depends on when its worker listener was attached, so callers assert
   * only what must hold either way.
   */
  async activateFromAnotherTab() {
    const other = await this.page.context().newPage();
    await other.goto("/");
    await other.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      registration.waiting?.postMessage({ type: "SKIP_WAITING" });
    });
    await other.waitForFunction(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return registration !== undefined && registration.waiting === null;
    });
    return other;
  }

  /** The app knows about the update even while a dialog hides its notice. */
  async expectUpdateKnown() {
    await expect(
      this.page.getByRole("button", {
        name: "Update app",
        exact: true,
        includeHidden: true,
      }),
    ).toHaveCount(1);
  }

  /**
   * The user accepts the update in another tab. This tab's worker listener
   * wants to reload it too, so the browser's "leave this page?" prompt is the
   * only thing between an unsaved editor and its loss. Declining that prompt
   * leaves this tab as it was.
   */
  async acceptInAnotherTab(other: Page) {
    this.page.on("dialog", (dialog) => void dialog.dismiss());
    await this.expectUpdateOffered(other);
    await this.accept(other);
    await this.expectVersion(other, "2");
    await this.expectTakeoverSettled();
  }

  /**
   * This tab saw the new worker take control. The app's own listener ran first,
   * so a reload it wants is either under way or was cancelled at the browser's
   * prompt; what the tab shows afterwards is final.
   */
  private async expectTakeoverSettled() {
    await expect
      .poll(() =>
        this.page
          .evaluate(() => {
            const root = document.documentElement;
            if (root.dataset.sameDocument !== "yes") return "reloaded";
            return root.dataset.controllerChanged === "yes"
              ? "taken over"
              : "pending";
          })
          .catch(() => "reloaded"),
      )
      .not.toBe("pending");
  }

  async discardWorkout() {
    await this.page
      .getByRole("button", { name: "Discard workout", exact: true })
      .click();
    await this.page
      .getByRole("dialog", { name: "Discard this workout?", exact: true })
      .getByRole("button", { name: "Discard workout", exact: true })
      .click();
  }
}
