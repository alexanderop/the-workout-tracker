import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import Checkboxes from "../fixtures/_BaseCheckbox.vue";
import { expectNoAxeViolations } from "../support/axe";

const box = (name: string) => page.getByRole("checkbox", { name });

describe("given a checkbox", () => {
  it("should be a native checkbox named by its label, 44px high", async () => {
    const { container } = await render(Checkboxes);
    await expect.element(box("Replace targets")).not.toBeChecked();
    const row = box("Replace targets").element().closest("label");
    expect(row?.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await expectNoAxeViolations(container);
  });

  describe("when toggling it", () => {
    it("should update the boolean model from a click on the label text", async () => {
      await render(Checkboxes);
      await page.getByText("Replace targets").click();
      await expect.element(box("Replace targets")).toBeChecked();
      await expect
        .element(page.getByTestId("replace"))
        .toHaveTextContent("true");
    });

    it("should toggle with Space", async () => {
      await render(Checkboxes);
      await userEvent.tab();
      await userEvent.keyboard(" ");
      await expect.element(box("Replace targets")).toBeChecked();
    });
  });

  it("should not toggle while disabled", async () => {
    await render(Checkboxes);
    await expect.element(box("Locked option")).toBeDisabled();
  });
});
