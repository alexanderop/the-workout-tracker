import { describe, expect, it } from "vitest";
import {
  commandSchema,
  initialSnapshot,
  reduceWorkout,
  remainingRestSeconds,
  sessionTotals,
  snapshotSchema,
  type ActiveSession,
  type Command,
  type Snapshot,
} from "../../src/features/workouts";

function scenario() {
  let number = 0;
  let snapshot = initialSnapshot();
  const apply = (command: Command, at = 1000) => {
    const result = reduceWorkout(snapshot, command, {
      at,
      id: () => `id-${++number}`,
    });
    if (result.kind !== "rejected") snapshot = result.snapshot;
    return result;
  };
  const current = (): ActiveSession => {
    if (!snapshot.active) throw new Error("Expected active workout");
    return snapshot.active;
  };
  return { apply, current, snapshot: () => snapshot };
}

function firstRow(active: ActiveSession) {
  const exercise = active.exercises[0];
  const set = exercise?.sets[0];
  if (!exercise || !set) throw new Error("Expected exercise and set");
  return { exercise, set };
}

describe("workout transitions", () => {
  it("provides a valid catalog and starter routines without fabricated history", () => {
    const snapshot = initialSnapshot();
    expect(snapshotSchema.safeParse(snapshot).success).toBe(true);
    expect(Object.keys(snapshot.completed)).toHaveLength(0);
    expect(
      Object.values(snapshot.routines).map((routine) => routine.name),
    ).toEqual(["Upper body", "Lower body", "Full body"]);
  });

  it("atomically logs entered values and counts only completed sets", () => {
    const state = scenario();
    state.apply({ type: "start", routineId: "upper-body" });
    const active = state.current();
    const { exercise, set } = firstRow(active);
    state.apply(
      {
        type: "set-entry",
        sessionId: active.id,
        exerciseId: exercise.id,
        setId: set.id,
        weightKg: 42.5,
        reps: 8,
        completed: true,
      },
      2000,
    );
    expect(sessionTotals(state.current())).toEqual({
      completedSets: 1,
      volumeKg: 340,
    });
    expect(state.current().rest).toEqual({ setId: set.id, endsAt: 92000 });
    expect(remainingRestSeconds(state.current(), 2501)).toBe(90);
    expect(remainingRestSeconds(state.current(), 95000)).toBe(0);
  });

  it("keeps rest owned by the latest completed set when another set is undone", () => {
    const state = scenario();
    state.apply({ type: "start", routineId: "upper-body" });
    const active = state.current();
    const { exercise, set } = firstRow(active);
    const second = exercise.sets[1]!;
    state.apply(
      {
        type: "set-completed",
        sessionId: active.id,
        setId: set.id,
        completed: true,
      },
      2000,
    );
    state.apply(
      {
        type: "set-completed",
        sessionId: active.id,
        setId: second.id,
        completed: true,
      },
      3000,
    );
    state.apply(
      {
        type: "set-completed",
        sessionId: active.id,
        setId: set.id,
        completed: false,
      },
      4000,
    );
    expect(state.current().rest).toEqual({ setId: second.id, endsAt: 93000 });
    state.apply(
      {
        type: "set-completed",
        sessionId: active.id,
        setId: second.id,
        completed: true,
      },
      7000,
    );
    expect(state.current().rest?.endsAt).toBe(93000);
    state.apply({
      type: "set-completed",
      sessionId: active.id,
      setId: second.id,
      completed: false,
    });
    expect(state.current().rest).toBeNull();
  });

  it("removes rest when its exercise or source set is removed", () => {
    const state = scenario();
    state.apply({ type: "start", routineId: "upper-body" });
    const active = state.current();
    const { exercise, set } = firstRow(active);
    state.apply({
      type: "set-completed",
      sessionId: active.id,
      setId: set.id,
      completed: true,
    });
    state.apply({
      type: "remove-set",
      sessionId: active.id,
      exerciseId: exercise.id,
      setId: set.id,
    });
    expect(state.current().rest).toBeNull();
    const nextSet = state.current().exercises[0]!.sets[0]!;
    state.apply({
      type: "set-completed",
      sessionId: active.id,
      setId: nextSet.id,
      completed: true,
    });
    state.apply({
      type: "remove-exercise",
      sessionId: active.id,
      exerciseId: exercise.id,
    });
    expect(state.current().rest).toBeNull();
  });

  it("refuses an empty finish and finishes completed work exactly once", () => {
    const state = scenario();
    state.apply({ type: "start", routineId: "upper-body" });
    const active = state.current();
    expect(state.apply({ type: "finish", sessionId: active.id }).kind).toBe(
      "rejected",
    );
    const { set } = firstRow(active);
    state.apply({
      type: "set-completed",
      sessionId: active.id,
      setId: set.id,
      completed: true,
    });
    state.apply({ type: "finish", sessionId: active.id }, 10000);
    expect(state.snapshot().active).toBeNull();
    expect(state.snapshot().completed[active.id]?.exercises).toHaveLength(4);
    expect(state.snapshot().completed[active.id]?.finishedAt).toBe(10000);
    expect(
      state.apply({ type: "finish", sessionId: active.id }, 20000).kind,
    ).toBe("unchanged");
    expect(Object.keys(state.snapshot().completed)).toHaveLength(1);
  });

  it("discards only the matching active workout and its rest without creating history", () => {
    const state = scenario();
    state.apply({ type: "start", routineId: "upper-body" });
    const active = state.current();
    const { set } = firstRow(active);
    state.apply({
      type: "set-completed",
      sessionId: active.id,
      setId: set.id,
      completed: true,
    });
    expect(state.current().rest).not.toBeNull();
    expect(
      state.apply({ type: "discard", sessionId: "stale-session" }).kind,
    ).toBe("rejected");
    expect(state.current().id).toBe(active.id);
    expect(state.apply({ type: "discard", sessionId: active.id }).kind).toBe(
      "changed",
    );
    expect(state.snapshot().active).toBeNull();
    expect(state.snapshot().completed).toEqual({});
    state.apply({ type: "start", routineId: null });
    const replacementId = state.current().id;
    expect(state.apply({ type: "discard", sessionId: active.id }).kind).toBe(
      "rejected",
    );
    expect(state.current().id).toBe(replacementId);
    state.apply({ type: "discard", sessionId: replacementId });
    expect(state.snapshot().active).toBeNull();
    expect(state.snapshot().completed).toEqual({});
  });

  it("prefills routine weights from completed records without changing history", () => {
    const state = scenario();
    state.apply({ type: "start", routineId: "upper-body" });
    const active = state.current();
    const { exercise, set } = firstRow(active);
    state.apply({
      type: "set-entry",
      sessionId: active.id,
      exerciseId: exercise.id,
      setId: set.id,
      weightKg: 60,
      reps: 10,
      completed: true,
    });
    state.apply({ type: "finish", sessionId: active.id });
    state.apply({ type: "start", routineId: "upper-body" });
    expect(firstRow(state.current()).set).toMatchObject({
      weightKg: 60,
      reps: 10,
      completed: false,
    });
    expect(
      state.snapshot().completed[active.id]?.exercises[0]?.sets[0]?.completed,
    ).toBe(true);
  });

  it("supports custom exercises, routines, free workouts and settings", () => {
    const state = scenario();
    state.apply({
      type: "save-exercise",
      exercise: {
        id: "custom",
        name: "Cable row",
        category: "Back",
        custom: true,
      },
    });
    state.apply({
      type: "save-routine",
      routine: {
        id: "my-routine",
        name: "Mine",
        description: "",
        exercises: [{ exerciseId: "custom", sets: 2, reps: 12, weightKg: 30 }],
      },
    });
    state.apply({
      type: "settings",
      settings: { autoRest: false, restSeconds: 120 },
    });
    state.apply({ type: "start", routineId: null });
    expect(state.current().name).toBe("Free workout");
    state.apply({
      type: "add-exercise",
      sessionId: state.current().id,
      exerciseId: "custom",
    });
    const { exercise, set } = firstRow(state.current());
    expect(
      state.apply({
        type: "remove-set",
        sessionId: state.current().id,
        exerciseId: exercise.id,
        setId: set.id,
      }).kind,
    ).toBe("rejected");
    state.apply({
      type: "add-set",
      sessionId: state.current().id,
      exerciseId: exercise.id,
    });
    expect(firstRow(state.current()).exercise.sets).toHaveLength(2);
    state.apply({
      type: "set-completed",
      sessionId: state.current().id,
      setId: set.id,
      completed: true,
    });
    expect(state.current().rest).toBeNull();
  });

  it.each([-1, NaN, Infinity, 1001])(
    "rejects invalid weight %s without changing state",
    (weightKg) => {
      const state = scenario();
      state.apply({ type: "start", routineId: "upper-body" });
      const { exercise, set } = firstRow(state.current());
      const before = state.snapshot();
      expect(
        state.apply({
          type: "set-values",
          sessionId: state.current().id,
          exerciseId: exercise.id,
          setId: set.id,
          weightKg,
          reps: 8,
        }).kind,
      ).toBe("rejected");
      expect(state.snapshot()).toBe(before);
    },
  );

  it("rejects invalid references and duplicated generated IDs", () => {
    const state = scenario();
    expect(
      state.apply({
        type: "save-routine",
        routine: {
          id: "bad",
          name: "Invalid",
          description: "",
          exercises: [{ exerciseId: "missing", reps: 8, sets: 3, weightKg: 0 }],
        },
      }).kind,
    ).toBe("rejected");
    expect(
      reduceWorkout(
        initialSnapshot(),
        { type: "start", routineId: "upper-body" },
        { at: 1000, id: () => "duplicate" },
      ).kind,
    ).toBe("rejected");
    expect(
      commandSchema.safeParse({
        type: "save-exercise",
        exercise: {
          id: "__proto__",
          name: "Invalid",
          category: "Back",
          custom: true,
        },
      }).success,
    ).toBe(false);
  });

  it("rejects a corrupt snapshot with dangling rest or mismatched record IDs", () => {
    const state = scenario();
    state.apply({ type: "start", routineId: "upper-body" });
    const invalid: Snapshot = {
      ...state.snapshot(),
      active: { ...state.current(), rest: { setId: "missing", endsAt: 10000 } },
    };
    expect(snapshotSchema.safeParse(invalid).success).toBe(false);
    expect(
      snapshotSchema.safeParse({
        ...initialSnapshot(),
        exercises: {
          x: { id: "y", name: "X", custom: true, category: "Back" },
        },
      }).success,
    ).toBe(false);
  });
});
