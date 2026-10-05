import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDraftJournal } from "../../src/features/workouts/adapters/browser-drafts";
import type { DraftInput } from "../../src/features/workouts/domain/drafts";
import { createWorkoutFactory } from "../support/factories";

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

function setup() {
  const factory = createWorkoutFactory("draft-browser");
  const input: DraftInput = {
    sessionId: "session",
    setId: "set",
    revision: 1,
    weight: "45",
    reps: "8",
    base: { weightKg: 40, reps: 8, targetReps: 8, completed: false },
  };
  const first = createDraftJournal({
    storage: () => localStorage,
    id: factory.id,
  });
  const second = createDraftJournal({
    storage: () => localStorage,
    id: factory.id,
  });
  return { factory, input, first, second };
}

describe("real browser draft journal", () => {
  it("acknowledges only observed drafts while another writer's later input survives", () => {
    const { first, second, input } = setup();
    first.write(input);
    const observed = first.recover("session", "set");
    expect(observed.map((draft) => draft.weight)).toEqual(["45"]);
    const later = second.write({ ...input, weight: "50" });
    first.consume(observed);
    expect(first.recover("session", "set")).toEqual([later]);
    expect(
      second.recover("session", "set").map((draft) => draft.weight),
    ).toEqual(["50"]);
  });

  it("blocks stale writers after deletion while retaining newer drafts and unrelated keys", () => {
    const { first, second, input } = setup();
    localStorage.setItem("other-app", "keep");
    first.write(input);
    const newer = second.write({ ...input, revision: 3, weight: "55" });
    first.clearBefore(2);
    expect(first.recover("session", "set")).toEqual([newer]);
    expect(() => second.write({ ...input, weight: "60" })).toThrow(
      "This workout was deleted. Reload before editing.",
    );
    expect(
      first.recover("session", "set").map((draft) => draft.weight),
    ).toEqual(["55"]);
    expect(localStorage.getItem("other-app")).toBe("keep");
  });

  it("does not prune newer drafts using an older snapshot", () => {
    const { factory, first, input } = setup();
    const newer = first.write({ ...input, revision: 3 });
    first.prune(factory.snapshot({ revision: 2 }));
    expect(first.recover("session", "set")).toEqual([newer]);
    first.prune(factory.snapshot({ revision: 4 }));
    expect(first.recover("session", "set")).toEqual([]);
  });
});
