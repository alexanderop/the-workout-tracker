import { test as base } from "playwright-bdd";
import { WorkoutPage } from "./pages/WorkoutPage";

export const test = base.extend<{ workout: WorkoutPage }>({
  workout: async ({ page }, use) => {
    await use(new WorkoutPage(page));
  },
});
