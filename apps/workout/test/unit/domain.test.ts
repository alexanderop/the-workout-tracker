import { describe, expect, it } from "vitest";
import {
  reduceWorkout,
  remainingRestSeconds,
  sessionTotals,
  type Command,
  type Snapshot,
} from "../../src/features/workouts/domain";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";

function workout() {
  const factory = createWorkoutFactory();
  const set = factory.set();
  const exercise = factory.sessionExercise({ sets: [set] });
  const active = factory.activeSession({ exercises: [exercise] });
  const snapshot = factory.snapshot({ active });
  const target = {
    sessionId: active.id,
    exerciseId: exercise.id,
    setId: set.id,
  };
  const apply = (
    state: Snapshot,
    command: Command,
    at = FIXED_NOW,
  ): Snapshot => {
    const result = reduceWorkout(state, command, { at, id: factory.id });
    if (result.kind === "rejected") throw new Error(result.message);
    return result.snapshot;
  };
  return { snapshot, active, set, target, apply, factory };
}

describe("workout transitions", () => {
  it("counts a set only after logging, not after saving its numeric values", () => {
    const { snapshot, target, apply } = workout();
    const edited = apply(snapshot, {
      type: "set-values",
      ...target,
      weightKg: 50,
      reps: 6,
    });
    expect(edited.active?.exercises[0]?.sets[0]).toMatchObject({
      weightKg: 50,
      reps: 6,
      completed: false,
    });
    expect(edited.active && sessionTotals(edited.active)).toEqual({
      completedSets: 0,
      volumeKg: 0,
    });
    const logged = apply(edited, {
      type: "set-completed",
      sessionId: target.sessionId,
      setId: target.setId,
      completed: true,
    });
    expect(logged.active && sessionTotals(logged.active)).toEqual({
      completedSets: 1,
      volumeKg: 300,
    });
  });

  it("records a failed attempt at zero reps and restores the target when undone", () => {
    const { snapshot, target, apply } = workout();
    const logged = apply(snapshot, {
      type: "set-entry",
      ...target,
      weightKg: 60,
      reps: 0,
      completed: true,
    });
    expect(logged.active && sessionTotals(logged.active)).toEqual({
      completedSets: 1,
      volumeKg: 0,
    });
    const undone = apply(logged, {
      type: "set-completed",
      sessionId: target.sessionId,
      setId: target.setId,
      completed: false,
    });
    expect(undone.active?.exercises[0]?.sets[0]).toMatchObject({
      weightKg: 60,
      reps: 8,
      targetReps: 8,
      completed: false,
    });
    expect(undone.active?.rest).toBeNull();
  });

  it("keeps the original rest deadline when correcting a logged set", () => {
    const { snapshot, target, apply } = workout();
    const logged = apply(snapshot, {
      type: "set-entry",
      ...target,
      weightKg: 40,
      reps: 8,
      completed: true,
    });
    const corrected = apply(
      logged,
      { type: "set-entry", ...target, weightKg: 45, reps: 7, completed: true },
      FIXED_NOW + 20_000,
    );
    expect(corrected.active?.rest).toEqual({
      setId: target.setId,
      endsAt: FIXED_NOW + 90_000,
    });
    expect(remainingRestSeconds(corrected.active, FIXED_NOW + 20_001)).toBe(70);
    expect(remainingRestSeconds(corrected.active, FIXED_NOW + 95_000)).toBe(0);
    expect(corrected.active && sessionTotals(corrected.active)).toEqual({
      completedSets: 1,
      volumeKg: 315,
    });
  });

  it("rejects an empty finish and finishes a logged session only once", () => {
    const { snapshot, target, apply, factory } = workout();
    const command = { type: "finish", sessionId: target.sessionId } as const;
    expect(
      reduceWorkout(snapshot, command, { at: FIXED_NOW, id: factory.id }),
    ).toEqual({
      kind: "rejected",
      code: "finishNeedsLoggedSet",
      message: "Complete at least one set before finishing.",
    });
    const logged = apply(snapshot, {
      type: "set-entry",
      ...target,
      weightKg: 40,
      reps: 8,
      completed: true,
    });
    const finished = apply(logged, command, FIXED_NOW + 60_000);
    expect(finished.active).toBeNull();
    expect(finished.completed[target.sessionId]).toMatchObject({
      status: "completed",
      finishedAt: FIXED_NOW + 60_000,
    });
    expect(
      reduceWorkout(finished, command, {
        at: FIXED_NOW + 90_000,
        id: factory.id,
      }),
    ).toEqual({ kind: "unchanged", snapshot: finished });
    expect(Object.keys(finished.completed)).toHaveLength(1);
  });
});
