import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDraftJournal } from "../../src/features/workouts/adapters/browser-drafts";
import type { DraftInput } from "../../src/features/workouts/domain/drafts";
import { createWorkoutFactory } from "../support/factories";
import { errorTag, failure, success } from "../support/results";

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

describe("browser draft journal", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  describe("real browser draft journal", () => {
    it("acknowledges only observed drafts while another writer's later input survives", () => {
      const { first, second, input } = setup();
      success(first.write(input));
      const observed = success(first.recover("session", "set"));
      expect(observed.map((draft) => draft.weight)).toEqual(["45"]);
      const later = success(second.write({ ...input, weight: "50" }));
      success(first.consume(observed));
      expect(success(first.recover("session", "set"))).toEqual([later]);
      expect(
        success(second.recover("session", "set")).map((draft) => draft.weight),
      ).toEqual(["50"]);
    });

    it("blocks stale writers after deletion while retaining newer drafts and unrelated keys", () => {
      const { first, second, input } = setup();
      localStorage.setItem("other-app", "keep");
      success(first.write(input));
      const newer = success(second.write({ ...input, revision: 3, weight: "55" }));
      success(first.clearBefore(2));
      expect(success(first.recover("session", "set"))).toEqual([newer]);
      expect(errorTag(second.write({ ...input, weight: "60" }))).toBe(
        "DraftsDeleted",
      );
      expect(
        success(first.recover("session", "set")).map((draft) => draft.weight),
      ).toEqual(["55"]);
      expect(localStorage.getItem("other-app")).toBe("keep");
    });

    it("does not prune newer drafts using an older snapshot", () => {
      const { factory, first, input } = setup();
      const newer = success(first.write({ ...input, revision: 3 }));
      success(first.prune(factory.snapshot({ revision: 2 })));
      expect(success(first.recover("session", "set"))).toEqual([newer]);
      success(first.prune(factory.snapshot({ revision: 4 })));
      expect(success(first.recover("session", "set"))).toEqual([]);
    });

    it("keeps a finished workout's drafts for recovery while pruning other obsolete drafts", () => {
      const { factory, first, input } = setup();
      const set = factory.set({ id: "set", completed: true });
      const finished = factory.completedSession({
        id: "session",
        exercises: [factory.sessionExercise({ sets: [set] })],
      });
      const late = success(first.write(input));
      success(first.write({ ...input, sessionId: "discarded" }));
      const snapshot = factory.snapshot({ revision: 2, completed: { session: finished } });
      expect(success(first.prune(snapshot))).toEqual([late]);
      expect(success(first.recover("session", "set"))).toEqual([late]);
      expect(success(first.recover("discarded", "set"))).toEqual([]);
    });

    it("keeps one deletion marker, honors legacy markers and tolerates malformed ones", () => {
      const { first, input } = setup();
      localStorage.setItem("form-workout:drafts-deleted-before:abc", "");
      localStorage.setItem("form-workout:drafts-deleted-before", "garbage");
      expect(success(first.write(input)).weight).toBe("45");
      localStorage.setItem("form-workout:drafts-deleted-before:3", "");
      expect(errorTag(first.write(input))).toBe("DraftsDeleted");
      success(first.clearBefore(2));
      success(first.clearBefore(1));
      const markers = Object.keys(localStorage).filter((name) => name.startsWith("form-workout:drafts-deleted-before"));
      expect(markers).toEqual(["form-workout:drafts-deleted-before"]);
      expect(localStorage.getItem("form-workout:drafts-deleted-before")).toBe("3");
      expect(errorTag(first.write({ ...input, revision: 2 }))).toBe(
        "DraftsDeleted",
      );
      expect(success(first.write({ ...input, revision: 3 })).revision).toBe(3);
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
      const saved = success(journal.write(input));
      full = true;
      const refused = failure(journal.write({ ...input, weight: "50" }));
      expect(refused.name).toBe("DraftStorageFailed");
      expect(refused.cause).toMatchObject({ name: "QuotaExceededError" });
      expect(success(journal.recover("session", "set"))).toEqual([saved]);
    });
  });
});
