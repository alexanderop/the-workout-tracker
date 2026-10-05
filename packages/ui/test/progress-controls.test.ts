import { describe, expect, it } from "vitest";
import { replaceNumber, validNumber } from "../src/numeric-input/editing";

const weightLimits = { min: 0, max: 1000, decimals: 2, presetStep: 2.5 };

describe("numeric clipboard replacement", () => {
  it.each(["55.25", "55,25", " 55.25 "])(
    "accepts a complete weight %s",
    (text) => {
      expect(replaceNumber(text, weightLimits)).toEqual({
        text: "55.25",
        fresh: false,
      });
    },
  );

  it.each([
    "",
    " ",
    "55kg",
    "55.25 junk",
    "1e2",
    "-2",
    "1,2,3",
    "55.251",
    "1000.01",
    "5 5",
  ])("rejects invalid clipboard text %s", (text) => {
    expect(replaceNumber(text, weightLimits)).toBeNull();
  });

  it("applies bounds and repetition precision", () => {
    const repetitions = { min: 1, max: 999, decimals: 0, presetStep: 1 };
    expect(replaceNumber("0", repetitions)).toBeNull();
    expect(replaceNumber("2.5", repetitions)).toBeNull();
    expect(replaceNumber("12", repetitions)).toEqual({
      text: "12",
      fresh: false,
    });
    expect(replaceNumber("1000", weightLimits)).toEqual({
      text: "1000",
      fresh: false,
    });
  });

  it("rejects confirmation with unsupported precision", () => {
    expect(validNumber("55.251", weightLimits)).toBeNull();
    expect(validNumber("55.25", weightLimits)).toBe(55.25);
  });
});
