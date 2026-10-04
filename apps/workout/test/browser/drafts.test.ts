import { expect, it } from "vitest";
import { createDraftJournal } from "../../src/features/workouts/adapters/browser-drafts";

it("recovers raw unfinished input and consumes only the acknowledged edit", () => {
  localStorage.clear();
  const first = createDraftJournal({
    storage: () => localStorage,
    id: () => crypto.randomUUID(),
  });
  const input = {
    sessionId: "s",
    setId: "a",
    weight: "82.5",
    reps: "",
    revision: 2,
    base: { weightKg: 0, reps: 8, completed: false },
  };
  const saved = first.write(input);
  const reopened = createDraftJournal({
    storage: () => localStorage,
    id: () => crypto.randomUUID(),
  });
  expect(reopened.recover("s", "a")[0]).toMatchObject({
    weight: "82.5",
    reps: "",
    revision: 2,
  });
  const newer = first.write({ ...input, weight: "85" });
  reopened.consume([saved]);
  expect(reopened.recover("s", "a")).toEqual([newer]);
  reopened.consume([newer]);
  expect(first.recover("s", "a")).toEqual([]);
});
it("preserves both writers and rejects corrupt external records", () => {
  localStorage.clear();
  const journal = () =>
    createDraftJournal({
      storage: () => localStorage,
      id: () => crypto.randomUUID(),
    });
  const input = {
    sessionId: "s",
    setId: "a",
    weight: "60",
    reps: "8",
    revision: 2,
    base: { weightKg: 0, reps: 8, completed: false },
  };
  journal().write(input);
  journal().write({ ...input, weight: "70" });
  localStorage.setItem("form-workout:draft:v1:invalid", "{oops");
  expect(
    journal()
      .recover("s", "a")
      .map((d) => d.weight)
      .sort(),
  ).toEqual(["60", "70"]);
});

it("prunes retired drafts without using an older snapshot to delete a newer session's input", async () => {
  const { initialSnapshot } = await import("../../src/features/workouts");
  localStorage.clear();
  const drafts = createDraftJournal({
    storage: () => localStorage,
    id: () => crypto.randomUUID(),
  });
  const base = { weightKg: 0, reps: 8, completed: false };
  drafts.write({
    sessionId: "retired",
    setId: "a",
    weight: "40",
    reps: "8",
    revision: 1,
    base,
  });
  const newer = drafts.write({
    sessionId: "newer",
    setId: "b",
    weight: "80",
    reps: "5",
    revision: 3,
    base,
  });
  drafts.prune({ ...initialSnapshot(), revision: 2 });
  expect(drafts.recover("retired", "a")).toEqual([]);
  expect(drafts.recover("newer", "b")).toEqual([newer]);
  drafts.prune({ ...initialSnapshot(), revision: 4 });
  expect(drafts.recover("newer", "b")).toEqual([]);
  expect(localStorage.length).toBe(0);
});
