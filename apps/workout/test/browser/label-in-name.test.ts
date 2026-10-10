import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ExerciseCatalog from "../../src/features/workouts/ui/ExerciseCatalog.vue";
import WorkoutCalendar from "../../src/features/workouts/ui/WorkoutCalendar.vue";
import { createAppI18n } from "../../src/i18n/testing";
import type { Locale } from "../../src/i18n";
import { createWorkoutFactory } from "../support/factories";

// WCAG 2.5.3: a control's accessible name contains its visible text.
async function mismatchedControls(container: Element) {
  const results = await axe.run(container, {
    runOnly: ["label-content-name-mismatch"],
  });
  return results.violations.flatMap((violation) =>
    violation.nodes.map((node) => node.html),
  );
}

const factory = createWorkoutFactory("label-in-name");
const now = new Date(2026, 9, 5, 20).getTime();

describe.each<Locale>(["en", "de"])("given the %s interface", (locale) => {
  const global = { plugins: [createAppI18n(locale)] };

  describe("when the training rhythm shows the past week", () => {
    it("should name every day button after its visible weekday and number", async () => {
      const session = factory.completedSession({ finishedAt: now - 3_600_000 });
      const screen = await render(WorkoutCalendar, {
        props: { sessions: [session], now },
        global,
      });
      expect(await mismatchedControls(screen.container)).toEqual([]);
    });
  });

  describe("when the exercise catalog shows its toolbar", () => {
    it("should name the filter and sort buttons after their visible text", async () => {
      const exercises = [
        factory.exercise({ id: "bench", name: "Bench press" }),
        factory.exercise({ id: "curl", name: "Curl", category: "Arms" }),
      ];
      const screen = await render(ExerciseCatalog, {
        props: { exercises },
        global,
      });
      expect(await mismatchedControls(screen.container)).toEqual([]);
      const sort = page.getByRole("button", {
        name: locale === "en" ? /^Sorted A–Z/ : /^Sortiert A–Z/,
      });
      await expect.element(sort).toBeVisible();
      await sort.click();
      expect(await mismatchedControls(screen.container)).toEqual([]);
    });
  });
});
