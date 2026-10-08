import { describe, expect, it } from "vitest";
import {
  beginEditing,
  editNumber,
  exceedsPrecision,
  numericHint,
  numericPresets,
  pasteHint,
  replaceNumber,
  validNumber,
  type NumericLimits,
} from "../src/numeric-input/editing";

const weight: NumericLimits = {
  min: 0,
  max: 1000,
  decimals: 2,
  presetStep: 2.5,
};
const reps: NumericLimits = { min: 1, max: 999, decimals: 0, presetStep: 1 };

function type(keys: readonly string[], limits: NumericLimits, start = "70") {
  return keys.reduce(
    (draft, key) => editNumber(draft, key, limits),
    beginEditing(start),
  );
}

describe("given an opening value", () => {
  it("should start a fresh draft and normalise a decimal comma", () => {
    expect(beginEditing(70.25)).toEqual({ text: "70.25", fresh: true });
    expect(beginEditing("70,5")).toEqual({ text: "70.5", fresh: true });
    expect(beginEditing("")).toEqual({ text: "", fresh: true });
  });
});

describe("given a fresh draft", () => {
  describe("when typing a digit", () => {
    it("should replace the value", () => {
      expect(type(["5"], weight)).toEqual({ text: "5", fresh: false });
    });
  });

  describe("when typing a decimal point", () => {
    it("should start from zero", () => {
      expect(type(["."], weight)).toEqual({ text: "0.", fresh: false });
      expect(type([","], weight)).toEqual({ text: "0.", fresh: false });
    });
  });

  describe("when pressing Backspace", () => {
    it("should edit the existing value", () => {
      expect(type(["Backspace"], weight)).toEqual({ text: "7", fresh: false });
      expect(type(["Delete"], weight)).toEqual({ text: "7", fresh: false });
    });
  });
});

describe("given an edited draft", () => {
  it("should append digits", () => {
    expect(type(["5", "5"], weight).text).toBe("55");
  });

  it("should replace a lone zero", () => {
    expect(type(["0", "7"], weight).text).toBe("7");
  });

  it("should add one decimal point at most", () => {
    expect(type(["5", ".", "."], weight).text).toBe("5.");
    expect(type(["5", ".", "2", ","], weight).text).toBe("5.2");
  });

  it("should ignore keys that are not digits", () => {
    const draft = type(["5"], weight);
    expect(editNumber(draft, "a", weight)).toBe(draft);
    expect(editNumber(draft, "-", weight)).toBe(draft);
  });

  it("should refuse digits beyond the maximum", () => {
    expect(type(["1", "0", "0", "0", "1"], weight).text).toBe("1000");
  });

  it("should refuse digits beyond the precision", () => {
    expect(type(["5", ".", "2", "5", "1"], weight).text).toBe("5.25");
  });

  it("should refuse a decimal point for whole numbers", () => {
    expect(type(["5", "."], reps).text).toBe("5");
    expect(type(["."], reps, "8")).toEqual({ text: "8", fresh: true });
  });

  it("should refuse drafts longer than 64 characters", () => {
    const limits = { ...weight, max: Number.POSITIVE_INFINITY };
    const long = { text: "1".repeat(64), fresh: false };
    expect(editNumber(long, "1", limits)).toBe(long);
  });
});

describe("exceedsPrecision", () => {
  it.each([
    ["70", 0, false],
    ["70.", 0, true],
    ["70.5", 0, true],
    ["70.", 2, false],
    ["70.25", 2, false],
    ["70.255", 2, true],
    ["", 2, false],
  ] as const)("%s with %d decimals is %s", (text, decimals, expected) => {
    expect(exceedsPrecision(text, decimals)).toBe(expected);
  });
});

describe("validNumber", () => {
  it.each([
    ["70.25", weight, 70.25],
    ["0", weight, 0],
    ["1000", weight, 1000],
    ["5.", weight, 5],
    ["12", reps, 12],
  ] as const)("accepts %s", (text, limits, expected) => {
    expect(validNumber(text, limits)).toBe(expected);
  });

  it.each([
    ["", weight],
    [".5", weight],
    ["-2", weight],
    ["1e2", weight],
    ["1000.01", weight],
    ["70.255", weight],
    ["0", reps],
    ["5.", reps],
    ["2.5", reps],
  ] as const)("rejects %s", (text, limits) => {
    expect(validNumber(text, limits)).toBeNull();
  });
});

describe("replaceNumber", () => {
  it("should accept a pasted value as an edited draft", () => {
    expect(replaceNumber(" 55,25 ", weight)).toEqual({
      text: "55.25",
      fresh: false,
    });
  });

  it("should reject a trailing decimal point in whole-number mode", () => {
    expect(replaceNumber("5.", reps)).toBeNull();
    expect(replaceNumber("5,", reps)).toBeNull();
  });

  it("should reject text longer than 64 characters", () => {
    const limits = { ...weight, max: Number.POSITIVE_INFINITY };
    expect(replaceNumber("1".repeat(65), limits)).toBeNull();
  });
});

describe("numericHint", () => {
  it("should invite replacing a valid opening value", () => {
    expect(numericHint(beginEditing("70"), weight, "kg")).toBe(
      "Type a new value to replace this one.",
    );
    expect(numericHint(type(["5"], weight), weight, "kg")).toBe(
      "Ready when you are.",
    );
  });

  it("should explain the range for an out-of-range value", () => {
    expect(numericHint(beginEditing("1200"), weight, "kg")).toBe(
      "Enter a value from 0 to 1000 kg.",
    );
    expect(numericHint(beginEditing("0"), reps, "")).toBe(
      "Enter a whole number from 1 to 999.",
    );
  });

  it("should explain the precision for a too precise value", () => {
    expect(numericHint(beginEditing("2.345"), weight, "kg")).toBe(
      "Enter a value with up to 2 decimal places from 0 to 1000 kg.",
    );
    expect(
      numericHint(beginEditing("2.35"), { ...weight, decimals: 1 }, ""),
    ).toBe("Enter a value with up to 1 decimal place from 0 to 1000.");
  });

  it("should describe what a paste may contain", () => {
    expect(pasteHint(weight)).toBe(
      "Paste a number with up to 2 decimal places from 0 to 1000.",
    );
    expect(pasteHint(reps)).toBe("Paste a whole number from 1 to 999.");
  });
});

describe("numericPresets", () => {
  const limits = (overrides: Partial<NumericLimits>): NumericLimits => ({
    ...weight,
    ...overrides,
  });

  it.each([
    {
      name: "the step grid around the value",
      value: 70.25,
      limits: weight,
      expected: [62.5, 65, 67.5, 70, 72.5, 75, 77.5, 80],
    },
    {
      name: "a widened grid when the step needs more decimals than allowed",
      value: 70,
      limits: limits({ decimals: 0 }),
      expected: [55, 60, 65, 70, 75, 80, 85, 90],
    },
    {
      name: "whole numbers for a half step without decimals",
      value: 10,
      limits: limits({ decimals: 0, presetStep: 0.5 }),
      expected: [7, 8, 9, 10, 11, 12, 13, 14],
    },
    {
      name: "a step finer than the precision of a decimal grid",
      value: 70,
      limits: limits({ decimals: 1 }),
      expected: [62.5, 65, 67.5, 70, 72.5, 75, 77.5, 80],
    },
    {
      name: "exact tenths",
      value: 0.3,
      limits: limits({ max: 1, decimals: 1, presetStep: 0.1 }),
      expected: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
    },
    {
      name: "a window that starts at the minimum",
      value: 0,
      limits: weight,
      expected: [0, 2.5, 5, 7.5, 10, 12.5, 15, 17.5],
    },
    {
      name: "a window that ends at the maximum",
      value: 20,
      limits: limits({ max: 20 }),
      expected: [2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20],
    },
    {
      name: "multiples of the step above a minimum off the grid",
      value: 1,
      limits: limits({ min: 1, decimals: 0, presetStep: 5 }),
      expected: [5, 10, 15, 20, 25, 30, 35, 40],
    },
    {
      name: "every value of a narrow range",
      value: 2,
      limits: limits({ min: 1, max: 3, decimals: 0, presetStep: 1 }),
      expected: [1, 2, 3],
    },
    {
      name: "the minimum's neighbourhood for an invalid value",
      value: "abc",
      limits: reps,
      expected: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
      name: "nothing for a step that is not positive",
      value: 10,
      limits: limits({ presetStep: 0 }),
      expected: [],
    },
  ])("should offer $name", ({ value, limits, expected }) => {
    expect(numericPresets(value, limits)).toEqual(expected);
  });

  it.each([
    [2.5, 0],
    [0.5, 0],
    [1.25, 1],
    [0.1, 2],
    [2.5, 2],
  ])(
    "with step %d and %d decimals should offer unique, confirmable values on the step grid",
    (presetStep, decimals) => {
      const config = limits({ decimals, presetStep });
      for (const value of [0, 0.4, 13, 70, 999.9]) {
        const presets = numericPresets(value, config);
        expect(new Set(presets).size).toBe(presets.length);
        for (const preset of presets) {
          expect(validNumber(String(preset), config)).toBe(preset);
          const steps = preset / presetStep;
          expect(Math.abs(steps - Math.round(steps))).toBeLessThan(1e-9);
        }
      }
    },
  );
});
