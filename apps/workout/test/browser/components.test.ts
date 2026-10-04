import { expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import Harness from "./fixtures/TrainingHarness.vue";
import { createWorkouts } from "../../src/features/workouts";
import { createDraftJournal } from "../../src/features/workouts/adapters/browser-drafts";
import { memoryDatabase } from "../support/memory-storage";
async function setup(failDrafts = false) {
  localStorage.clear();
  const workouts = createWorkouts({
    storage: memoryDatabase().open(),
    now: () => 1000,
    id: () => crypto.randomUUID(),
  });
  await workouts.execute({ type: "start", routineId: "upper-body" }, 0);
  const drafts = createDraftJournal({
    storage: () => {
      if (failDrafts) throw new Error("Unavailable");
      return localStorage;
    },
    id: () => crypto.randomUUID(),
  });
  const view = await render(Harness, { props: { workouts, drafts } });
  return { workouts, view };
}
it("validates unfinished input, then saves one atomic completed set", async () => {
  const { workouts } = await setup();
  try {
    const weight = page.getByRole("textbox", {
      name: "Set 1 weight for Bench press",
      exact: true,
    });
    await weight.fill("");
    await page
      .getByRole("button", { name: "Log set 1 of Bench press", exact: true })
      .click();
    await expect
      .element(page.getByRole("alert"))
      .toHaveTextContent("Enter 0–1000 kg and 1–1000 whole repetitions.");
    await weight.fill("62,5");
    await page
      .getByRole("textbox", {
        name: "Set 1 repetitions for Bench press",
        exact: true,
      })
      .fill("7");
    await page
      .getByRole("button", { name: "Log set 1 of Bench press", exact: true })
      .click();
    await expect
      .element(
        page.getByRole("button", {
          name: "Undo set 1 of Bench press",
          exact: true,
        }),
      )
      .toHaveAttribute("aria-pressed", "true");
    expect(
      JSON.parse(await workouts.exportBackup()).snapshot.active.exercises[0]
        .sets[0],
    ).toMatchObject({ weightKg: 62.5, reps: 7, completed: true });
  } finally {
    workouts.close();
  }
});
it("keeps raw input visible when draft storage is unavailable", async () => {
  const { workouts } = await setup(true);
  try {
    const weight = page.getByRole("textbox", {
      name: "Set 1 weight for Bench press",
      exact: true,
    });
    await weight.fill("82.5");
    await expect.element(weight).toHaveValue("82.5");
    await expect
      .element(
        page.getByText(
          "Draft not saved on this device. Keep this page open and try again.",
        ),
      )
      .toBeVisible();
    expect(
      JSON.parse(await workouts.exportBackup()).snapshot.active.exercises[0]
        .sets[0].completed,
    ).toBe(false);
  } finally {
    workouts.close();
  }
});
