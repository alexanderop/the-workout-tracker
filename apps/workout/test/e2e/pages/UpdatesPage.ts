import { expect, type APIRequestContext, type Page } from "@playwright/test";

/** Browser prompts each tab showed since its document was marked. */
const prompts = new WeakMap<Page, string[]>();

/**
 * Drives the two-version test server (scripts/serve-e2e.mjs) and observes the
 * service worker the way a user's browser would: through real registrations,
 * the Update app notice and the build version of the loaded document.
 */
export class UpdatesPage {
  readonly page: Page;
  private readonly request: APIRequestContext;
  constructor(page: Page, request: APIRequestContext) {
    this.page = page;
    this.request = request;
  }

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
    const seen: string[] = [];
    prompts.set(this.page, seen);
    this.page.on("dialog", (dialog) => {
      seen.push(`${dialog.type()}: ${dialog.message()}`);
      void dialog.dismiss();
    });
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
   * for any tab or window that activates the new version. This tab must stay
   * as it is until its own user chooses to reload.
   */
  async activateFromAnotherTab() {
    const other = await this.page.context().newPage();
    await other.goto("/");
    // The app loads its catalog after the page's load event; message the
    // worker only once the app runs, as a user's second tab would.
    await expect(other.getByRole("main")).toBeVisible();
    await other.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      registration.waiting?.postMessage({ type: "SKIP_WAITING" });
    });
    await other.waitForFunction(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return registration?.waiting === null;
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

  /** The user accepts the update in another tab. */
  async acceptInAnotherTab(other: Page) {
    await this.expectUpdateOffered(other);
    await this.accept(other);
    await this.expectVersion(other, "2");
  }

  reloadNotice(page: Page = this.page) {
    return page.getByRole("status").filter({
      hasText: "Updated — reload when ready.",
    });
  }

  /**
   * This tab saw the new worker take control. It neither reloaded nor showed a
   * browser prompt.
   */
  async expectTakenOverWithoutReload() {
    await expect
      .poll(() =>
        this.page.evaluate(
          () => document.documentElement.dataset.controllerChanged,
        ),
      )
      .toBe("yes");
    // A reload triggered by the takeover starts a moment after the event.
    // Waiting inside the page fails if the document is replaced meanwhile.
    await this.page.evaluate(
      () => new Promise((settled) => setTimeout(settled, 750)),
    );
    await this.expectSameDocument();
    expect(prompts.get(this.page) ?? []).toEqual([]);
  }

  /** The reload is offered even while a dialog hides the notice. */
  async expectReloadKnown() {
    await expect(
      this.page.getByRole("button", {
        name: "Reload app",
        exact: true,
        includeHidden: true,
      }),
    ).toHaveCount(1);
  }

  async expectReloadOffered() {
    await expect(this.reloadNotice()).toBeVisible();
  }

  async reload() {
    await this.reloadNotice()
      .getByRole("button", { name: "Reload app", exact: true })
      .click();
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
