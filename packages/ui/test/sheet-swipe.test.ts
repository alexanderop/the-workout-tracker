import { describe, expect, it } from "vitest";
import { sheetDragOffset, shouldDismissSheet } from "../src/sheet-swipe";

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
