import { expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import SetRow from "../../src/components/SetRow.vue";
import type { WorkoutSet } from "../../src/domain";

it("validates number inputs and emits one atomic set entry", async () => {
  const commits: unknown[] = [];
  await render(SetRow, {
    props: {
      set: { id: "set-a", weightKg: 0, reps: 8, completed: false },
      index: 0,
      exerciseName: "Press",
      revision: 1,
      busy: false,
      removable: false,
      onCommit: (value) => commits.push(value),
    },
  });
  const weight = page.getByRole("spinbutton", {
    name: "Set 1 weight for Press",
  });
  await weight.fill("");
  await page.getByRole("button", { name: "Log set 1 of Press" }).click();
  await expect
    .element(page.getByRole("alert"))
    .toHaveTextContent("Enter 0–1000 kg and 1–1000 whole repetitions.");
  expect(commits).toHaveLength(0);
  await weight.fill("62.5");
  await page
    .getByRole("spinbutton", { name: "Set 1 repetitions for Press" })
    .fill("7");
  await page.getByRole("button", { name: "Log set 1 of Press" }).click();
  expect(commits).toEqual([
    { weightKg: 62.5, reps: 7, completed: true, revision: 1 },
  ]);
});

it("keeps a conflicted draft stale after unrelated saves", async () => {
  const commits: unknown[] = [];
  const original: WorkoutSet = {
    id: "set-a",
    weightKg: 0,
    reps: 8,
    completed: false,
  };
  const view = await render(SetRow, {
    props: {
      set: original,
      index: 0,
      exerciseName: "Press",
      revision: 1,
      busy: false,
      removable: true,
      onCommit: (value) => commits.push(value),
    },
  });
  await page
    .getByRole("spinbutton", { name: "Set 1 weight for Press" })
    .fill("70");
  await view.rerender({
    set: { ...original, weightKg: 60, completed: true },
    revision: 2,
  });
  await view.rerender({
    set: { ...original, weightKg: 60, completed: true },
    revision: 3,
  });
  await page.getByRole("button", { name: "Save set 1 of Press" }).click();
  expect(commits).toEqual([
    { weightKg: 70, reps: 8, completed: true, revision: 1 },
  ]);
  await expect
    .element(page.getByRole("spinbutton", { name: "Set 1 weight for Press" }))
    .toHaveValue(70);
});
