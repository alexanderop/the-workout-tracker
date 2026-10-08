import type { BrowserContext, Page } from "@playwright/test";
import { test as base } from "playwright-bdd";
import { WorkoutPage } from "./pages/WorkoutPage";

/** Keeps the handle of a second tab a scenario opens for later steps. */
export class ScenarioTabs {
  #second: Page | undefined;
  constructor(readonly context: BrowserContext) {}

  remember(page: Page) {
    if (page.context() !== this.context)
      throw new Error("A scenario tab must share the scenario context");
    this.#second = page;
    return page;
  }

  second() {
    if (!this.#second) throw new Error("The second workout tab is missing");
    return this.#second;
  }
}

export const test = base.extend<{ workout: WorkoutPage; tabs: ScenarioTabs }>({
  workout: async ({ page }, use) => {
    await use(new WorkoutPage(page));
  },
  tabs: async ({ context }, use) => {
    await use(new ScenarioTabs(context));
  },
});
