import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import Segmented from "../fixtures/_BaseSegmentedControl.vue";
import { expectNoAxeViolations } from "../support/axe";

const choice = () => page.getByTestId("choice");

describe("given a segmented control", () => {
  it("should be a labelled radio group with the model selected", async () => {
    const { container } = await render(Segmented);
    await expect
      .element(page.getByRole("group", { name: "Theme" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("radio", { name: "System" }))
      .toBeChecked();
    await expectNoAxeViolations(container);
  });

  describe("when choosing a segment with the pointer", () => {
    it("should select it and update the model", async () => {
      await render(Segmented);
      await page.getByText("Dark", { exact: true }).click();
      await expect
        .element(page.getByRole("radio", { name: "Dark" }))
        .toBeChecked();
      await expect.element(choice()).toHaveTextContent("dark");
    });
  });

  describe("when using the arrow keys", () => {
    it("should move the choice like a native radio group", async () => {
      await render(Segmented);
      await userEvent.tab();
      await expect
        .element(page.getByRole("radio", { name: "System" }))
        .toHaveFocus();
      await userEvent.keyboard("{ArrowRight}");
      await expect.element(choice()).toHaveTextContent("light");
    });
  });
});
