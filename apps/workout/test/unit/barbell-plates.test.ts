import { describe, expect, it } from "vitest";
import {
  barbellSettings,
  initialSnapshot,
  loadBarbell,
  reduceWorkout,
  snapshotSchema,
  type Barbell,
} from "../../src/features/workouts/domain";
import { FIXED_NOW } from "../support/factories";

const standard: Barbell = {
  barKg: 20,
  platesKg: [20, 15, 10, 5, 2.5, 1.25],
};
const withTwentyFives: Barbell = {
  ...standard,
  platesKg: [25, ...standard.platesKg],
};

describe("given a 20 kg bar and the default plates", () => {
  it.each([
    { total: 20, perSide: [] },
    { total: 60, perSide: [20] },
    { total: 80, perSide: [20, 10] },
    { total: 82.5, perSide: [20, 10, 1.25] },
    { total: 100, perSide: [20, 20] },
    { total: 142.5, perSide: [20, 20, 20, 1.25] },
  ])("should load $total kg as $perSide per side", ({ total, perSide }) => {
    expect(loadBarbell(total, standard)).toEqual({ perSide, remainderKg: 0 });
  });

  it("should report weight the plates cannot make up", () => {
    expect(loadBarbell(81, standard)).toEqual({
      perSide: [20, 10],
      remainderKg: 1,
    });
  });

  it("should use 25 kg plates once they are owned", () => {
    expect(loadBarbell(80, withTwentyFives)).toEqual({
      perSide: [25, 5],
      remainderKg: 0,
    });
  });

  it("should return nothing for a weight lighter than the bar", () => {
    expect(loadBarbell(15, standard)).toBeNull();
  });
});

describe("given a lifter who owns only some plates", () => {
  it("should load repeated plates of the sizes they own", () => {
    const plates: Barbell = { barKg: 15, platesKg: [10, 2.5] };
    expect(loadBarbell(60, plates)).toEqual({
      perSide: [10, 10, 2.5],
      remainderKg: 0,
    });
  });

  it("should leave everything above the bar when no plates are owned", () => {
    expect(loadBarbell(30, { barKg: 20, platesKg: [] })).toEqual({
      perSide: [],
      remainderKg: 10,
    });
  });
});

describe("given barbell settings", () => {
  it("should fall back to a 20 kg bar and plates without 25 kg", () => {
    expect(barbellSettings(initialSnapshot().settings)).toEqual(standard);
  });

  it("should load a journal saved before plate settings existed", () => {
    const stored = {
      ...initialSnapshot(),
      settings: { restSeconds: 90, autoRest: true },
    };
    expect(snapshotSchema.safeParse(stored).success).toBe(true);
  });

  it("should save a changed bar and plate selection", () => {
    const snapshot = initialSnapshot();
    const barbell: Barbell = { barKg: 15, platesKg: [20, 10, 5] };
    const result = reduceWorkout(
      snapshot,
      { type: "settings", settings: { ...snapshot.settings, barbell } },
      { at: FIXED_NOW, id: () => "unused" },
    );
    expect(result.kind).toBe("changed");
    if (result.kind === "rejected") return;
    expect(barbellSettings(result.snapshot.settings)).toEqual(barbell);
  });

  it("should reject the same plate size twice", () => {
    const snapshot = initialSnapshot();
    const result = reduceWorkout(
      snapshot,
      {
        type: "settings",
        settings: {
          ...snapshot.settings,
          barbell: { barKg: 20, platesKg: [5, 5] },
        },
      },
      { at: FIXED_NOW, id: () => "unused" },
    );
    expect(result.kind).toBe("rejected");
  });
});
