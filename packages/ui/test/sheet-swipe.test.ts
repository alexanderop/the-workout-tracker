import { describe, expect, it } from "vitest";
import {
  releaseVelocity,
  sheetDragOffset,
  sheetFlickWindow,
  shouldDismissSheet,
} from "../src/sheet-swipe";

describe("sheet swipe dismissal", () => {
  it("keeps the sheet open for small or upward movement", () => {
    expect(shouldDismissSheet(4, 2, 600)).toBe(false);
    expect(shouldDismissSheet(-200, 2, 600)).toBe(false);
    expect(shouldDismissSheet(60, 0.2, 600)).toBe(false);
  });

  it("dismisses after a long pull or a quick flick", () => {
    expect(shouldDismissSheet(150, 0.1, 600)).toBe(true);
    expect(shouldDismissSheet(40, 0.9, 600)).toBe(true);
  });

  it("scales the pull distance for short sheets", () => {
    expect(shouldDismissSheet(80, 0.1, 240)).toBe(true);
  });

  it("follows the finger downward and resists upward", () => {
    expect(sheetDragOffset(90)).toBe(90);
    expect(sheetDragOffset(-100)).toBe(-20);
  });
});

describe("given a fast pull", () => {
  describe("when the finger lifts while still moving", () => {
    it("should keep the flick velocity", () => {
      expect(releaseVelocity(0.9, 1000, 1016)).toBe(0.9);
      expect(releaseVelocity(0.9, 1000, 1000 + sheetFlickWindow)).toBe(0.9);
    });

    it("should dismiss a short pull", () => {
      const velocity = releaseVelocity(0.9, 1000, 1016);
      expect(shouldDismissSheet(40, velocity, 600)).toBe(true);
    });
  });

  describe("when the finger holds still before lifting", () => {
    it("should treat the release as stationary", () => {
      expect(releaseVelocity(0.9, 1000, 1000 + sheetFlickWindow + 1)).toBe(0);
      expect(releaseVelocity(0.9, 1000, 1300)).toBe(0);
    });

    it("should keep a short pull open", () => {
      const velocity = releaseVelocity(0.9, 1000, 1300);
      expect(shouldDismissSheet(40, velocity, 600)).toBe(false);
    });

    it("should still dismiss a long pull", () => {
      const velocity = releaseVelocity(0.9, 1000, 1300);
      expect(shouldDismissSheet(150, velocity, 600)).toBe(true);
    });
  });
});
