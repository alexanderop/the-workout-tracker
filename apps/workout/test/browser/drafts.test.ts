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

  it("keeps a finished workout's drafts for recovery while pruning other obsolete drafts", () => {
    const { factory, first, input } = setup();
    const set = factory.set({ id: "set", completed: true });
    const finished = factory.completedSession({
      id: "session",
      exercises: [factory.sessionExercise({ sets: [set] })],
    });
    const late = first.write(input);
    first.write({ ...input, sessionId: "discarded" });
    const snapshot = factory.snapshot({ revision: 2, completed: { session: finished } });
    expect(first.prune(snapshot)).toEqual([late]);
    expect(first.recover("session", "set")).toEqual([late]);
    expect(first.recover("discarded", "set")).toEqual([]);
  });

  it("keeps one deletion marker, honors legacy markers and tolerates malformed ones", () => {
    const { first, input } = setup();
    localStorage.setItem("form-workout:drafts-deleted-before:abc", "");
    localStorage.setItem("form-workout:drafts-deleted-before", "garbage");
    expect(first.write(input).weight).toBe("45");
    localStorage.setItem("form-workout:drafts-deleted-before:3", "");
    expect(() => first.write(input)).toThrow("This workout was deleted. Reload before editing.");
    first.clearBefore(2);
    first.clearBefore(1);
    const markers = Object.keys(localStorage).filter((name) => name.startsWith("form-workout:drafts-deleted-before"));
    expect(markers).toEqual(["form-workout:drafts-deleted-before"]);
    expect(localStorage.getItem("form-workout:drafts-deleted-before")).toBe("3");
    expect(() => first.write({ ...input, revision: 2 })).toThrow(
      expect.objectContaining({ name: "DraftsDeletedError" }),
    );
    expect(first.write({ ...input, revision: 3 }).revision).toBe(3);
  });

  it("reports a full storage quota without losing the previous draft", () => {
    const { factory, input } = setup();
    let full = false;
    const quotaLimited = {
      get length() {
        return localStorage.length;
      },
      key: (index: number) => localStorage.key(index),
      getItem: (name: string) => localStorage.getItem(name),
      removeItem: (name: string) => localStorage.removeItem(name),
      setItem(name: string, value: string) {
        if (full) throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
        localStorage.setItem(name, value);
      },
    };
    const journal = createDraftJournal({ storage: () => quotaLimited, id: factory.id });
    const saved = journal.write(input);
    full = true;
    expect(() => journal.write({ ...input, weight: "50" })).toThrow(
      expect.objectContaining({ name: "QuotaExceededError" }),
    );
    expect(journal.recover("session", "set")).toEqual([saved]);
  });
});
