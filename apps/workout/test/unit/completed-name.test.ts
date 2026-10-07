import { describe, expect, it } from "vitest";
import { reduceWorkout } from "../../src/features/workouts/domain";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";

describe("completed workout name recovery", () => {
  it("renames only the requested completed workout and treats repeating it as unchanged", () => {
    const factory = createWorkoutFactory();
    const active = factory.activeSession();
    const completed = factory.completedSession();
    const snapshot = factory.snapshot({
      active,
      completed: { [completed.id]: completed },
    });
    const command = {
      type: "rename-completed",
      sessionId: completed.id,
      name: "  Recovered name  ",
    } as const;
    const inputs = { at: FIXED_NOW, id: factory.id };
    const result = reduceWorkout(snapshot, command, inputs);
    expect(result.kind).toBe("changed");
    if (result.kind !== "changed") throw new Error("Expected completed rename");
    expect(result.snapshot.completed[completed.id]?.name).toBe(
      "Recovered name",
    );
    expect(result.snapshot.active?.name).toBe("Morning workout");
    expect(reduceWorkout(result.snapshot, command, inputs).kind).toBe(
      "unchanged",
    );
  });
  it("rejects an active or missing target without creating a completed record", () => {
    const factory = createWorkoutFactory();
    const active = factory.activeSession();
    const snapshot = factory.snapshot({ active });
    for (const sessionId of [active.id, "missing"]) {
      expect(
        reduceWorkout(
          snapshot,
          { type: "rename-completed", sessionId, name: "Recovered" },
          { at: FIXED_NOW, id: factory.id },
        ),
      ).toEqual({
        kind: "rejected",
        message: "This completed workout was not found.",
      });
    }
  });
  it("rejects a blank recovered name", () => {
    const factory = createWorkoutFactory();
    const completed = factory.completedSession();
    const snapshot = factory.snapshot({
      completed: { [completed.id]: completed },
    });
    expect(
      reduceWorkout(
        snapshot,
        { type: "rename-completed", sessionId: completed.id, name: "  " },
        { at: FIXED_NOW, id: factory.id },
      ),
    ).toEqual({
      kind: "rejected",
      message: "Please check the entered values.",
    });
  });
});
