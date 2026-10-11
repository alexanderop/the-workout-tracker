import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import Swatches from "../fixtures/_BaseColorSwatch.vue";
import { expectNoAxeViolations } from "../support/axe";
import { find } from "../support/dom";

const swatch = (name: string) => page.getByRole("radio", { name });
const checkVisibility = (id: string) =>
  getComputedStyle(
    find(swatch(id).element().closest("label") ?? document.body, "svg"),
  ).visibility;

describe("given color swatches", () => {
  it("should be native radios named by their caption, one checked", async () => {
    const { container } = await render(Swatches);
    await expect.element(swatch("blue")).toBeChecked();
    await expect.element(swatch("teal")).not.toBeChecked();
    await expectNoAxeViolations(container);
  });

  describe("when choosing another swatch", () => {
    it("should update the shared model", async () => {
      await render(Swatches);
      await swatch("teal").click();
      await expect.element(swatch("teal")).toBeChecked();
      await expect
        .element(page.getByTestId("accent"))
        .toHaveTextContent("teal");
    });
  });

  describe("when moving with the arrow keys", () => {
    it("should select the next swatch natively", async () => {
      await render(Swatches);
      await userEvent.tab();
      await expect.element(swatch("blue")).toHaveFocus();
      await userEvent.keyboard("{ArrowRight}");
      await expect.element(swatch("teal")).toBeChecked();
    });
  });

  it("should paint each swatch with its own accent and cover it with the radio", async () => {
    await render(Swatches);
    const fill = (id: string) =>
      getComputedStyle(
        find(
          swatch(id).element().closest("label") ?? document.body,
          ".ui-color-swatch-dot",
        ),
      ).backgroundColor;
    expect(fill("teal")).not.toBe(fill("violet"));
    const box = swatch("blue").element().getBoundingClientRect();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  it("should show the check only on the chosen swatch", async () => {
    await render(Swatches);
    expect(checkVisibility("blue")).toBe("visible");
    expect(checkVisibility("teal")).toBe("hidden");
  });
});
