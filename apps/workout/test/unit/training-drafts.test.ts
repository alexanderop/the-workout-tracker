import { describe, expect, it } from "vitest";
import {
  canUndoSet,
  decideSetCommit,
  hasDraftConflict,
  restoreTrainingDraft,
  type TrainingDraftState,
} from "../../src/features/workouts/domain/trainingDrafts";
import { createWorkoutFactory } from "../support/factories";

function draftState(
  overrides: Partial<TrainingDraftState> = {},
): TrainingDraftState {
  const set = createWorkoutFactory().set();
  return {
    set,
    base: set,
    weight: "40",
    reps: "8",
    touched: false,
    recoveredStale: false,
    revision: 2,
    records: [],
    alternatives: [],
    ...overrides,
  };
}

describe("training draft decisions", () => {
  it("retains recovered input but requires review when its saved revision is stale", () => {
    const factory = createWorkoutFactory();
    const recovered = factory.draft({ revision: 1 });
    const restored = restoreTrainingDraft(draftState({ records: [recovered] }));
    expect(restored).toMatchObject({
      weight: "45",
      reps: "8",
      revision: 1,
      touched: true,
      recoveredStale: true,
    });
    expect(hasDraftConflict(restored)).toBe(true);
    expect(decideSetCommit(restored).kind).toBe("blocked");
  });

  it("keeps a live draft usable after unrelated saves when its set baseline is unchanged", () => {
    const live = draftState({ weight: "45", touched: true, revision: 1 });
    expect(hasDraftConflict(live)).toBe(false);
    expect(decideSetCommit(live)).toEqual({
      kind: "ready",
      values: { weightKg: 45, reps: 8 },
      completed: true,
    });
  });

  it("requires review if saved values changed or recovered drafts disagree", () => {
    const factory = createWorkoutFactory();
    const first = factory.draft({ revision: 2 });
    const second = factory.draft({ revision: 2, weight: "50" });
    const alternatives = restoreTrainingDraft(
      draftState({ records: [first, second] }),
    );
    expect(alternatives.alternatives).toEqual([first, second]);
    expect(hasDraftConflict(alternatives)).toBe(true);
    expect(decideSetCommit(alternatives).kind).toBe("blocked");
    const changed = restoreTrainingDraft(
      draftState({ set: factory.set({ weightKg: 55 }), records: [first] }),
    );
    expect(changed).toMatchObject({ weight: "45", recoveredStale: true });
    expect(decideSetCommit(changed).kind).toBe("blocked");
  });

  it("collapses equivalent recovered inputs without losing their acknowledgement records", () => {
    const factory = createWorkoutFactory();
    const records = [
      factory.draft({ revision: 2 }),
      factory.draft({ revision: 2 }),
    ];
    const restored = restoreTrainingDraft(draftState({ records }));
    expect(restored.records).toEqual(records);
    expect(restored.alternatives).toEqual([]);
    expect(decideSetCommit(restored)).toEqual({
      kind: "ready",
      values: { weightKg: 45, reps: 8 },
      completed: true,
    });
  });

  it("distinguishes logging, correcting, unchanged activation and saving only values", () => {
    const factory = createWorkoutFactory();
    const unlogged = draftState();
    expect(decideSetCommit(unlogged)).toEqual({
      kind: "ready",
      values: { weightKg: 40, reps: 8 },
      completed: true,
    });
    expect(decideSetCommit(unlogged, true)).toEqual({
      kind: "ready",
      values: { weightKg: 40, reps: 8 },
      completed: false,
    });
    const set = factory.set({ completed: true });
    const logged = draftState({ set, base: set });
    expect(decideSetCommit(logged)).toEqual({ kind: "unchanged" });
    expect(decideSetCommit({ ...logged, weight: "45", touched: true })).toEqual(
      { kind: "ready", values: { weightKg: 45, reps: 8 }, completed: true },
    );
    expect(decideSetCommit(logged, true)).toEqual({
      kind: "ready",
      values: { weightKg: 40, reps: 8 },
      completed: true,
    });
    expect(decideSetCommit({ ...unlogged, reps: "" }).kind).toBe("blocked");
  });

  it("invalidates undo after the logged set changes or the active session changes", () => {
    const factory = createWorkoutFactory();
    const set = factory.set({ completed: true, reps: 0 });
    const last = { sessionId: "session-a", base: set };
    expect(canUndoSet(last, "session-a", set)).toBe(true);
    expect(canUndoSet(last, "session-b", set)).toBe(false);
    expect(canUndoSet(last, "session-a", { ...set, weightKg: 50 })).toBe(false);
    expect(canUndoSet(last, "session-a", undefined)).toBe(false);
  });
});
