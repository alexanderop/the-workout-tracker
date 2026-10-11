import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import Actions from "../fixtures/_BaseActions.vue";

const buttons = () =>
  [...document.querySelectorAll<HTMLElement>(".ui-actions button")].map(
    (button) => button.getBoundingClientRect(),
  );

describe("given an action row on a phone", () => {
  afterEach(() => page.viewport(390, 844));

  it("should stack the buttons full width in source order, primary last", async () => {
    await render(Actions);
    const [cancel, edit, save] = buttons();
    expect(cancel && edit && save).toBeTruthy();
    if (!cancel || !edit || !save) return;
    expect(cancel.bottom).toBeLessThanOrEqual(edit.top);
    expect(edit.bottom).toBeLessThanOrEqual(save.top);
    expect(new Set([cancel.width, edit.width, save.width]).size).toBe(1);
    expect(cancel.width).toBeGreaterThan(300);
  });

  it("should give every button the same 44px height whatever its size", async () => {
    await render(Actions);
    const heights = buttons().map((rect) => rect.height);
    expect(new Set(heights).size).toBe(1);
    expect(heights[0]).toBeGreaterThanOrEqual(44);
  });
});

describe("given an action row on a wide screen", () => {
  afterEach(() => page.viewport(390, 844));

  it("should put the buttons in one right-aligned row, primary rightmost", async () => {
    await page.viewport(900, 700);
    await render(Actions);
    await expect
      .element(page.getByRole("button", { name: "Save workout" }))
      .toBeVisible();
    const [cancel, edit, save] = buttons();
    if (!cancel || !edit || !save) throw new Error("expected three buttons");
    expect(new Set([cancel.top, edit.top, save.top]).size).toBe(1);
    expect(cancel.right).toBeLessThanOrEqual(edit.left);
    expect(edit.right).toBeLessThanOrEqual(save.left);
    const row = document.querySelector(".ui-actions")?.getBoundingClientRect();
    expect(Math.round(row?.right ?? 0)).toBe(Math.round(save.right));
    expect(new Set([cancel.height, edit.height, save.height]).size).toBe(1);
  });
});
