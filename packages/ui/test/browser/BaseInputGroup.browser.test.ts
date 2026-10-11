import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import Group from "../fixtures/_BaseInputGroup.vue";
import { expectNoAxeViolations } from "../support/axe";
import { find } from "../support/dom";

const field = () => page.getByRole("searchbox", { name: "Search exercises" });

describe("given an input group", () => {
  it("should keep the input named and show the decorative icon", async () => {
    const { container } = await render(Group);
    await expect.element(field()).toBeVisible();
    expect(
      container.querySelector(".ui-input-group-leading svg"),
    ).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it("should draw one border around icon and input, not on the input", async () => {
    const { container } = await render(Group);
    const group = getComputedStyle(find(container, ".ui-input-group"));
    expect(group.borderTopWidth).toBe("1px");
    expect(getComputedStyle(field().element()).borderTopWidth).toBe("0px");
  });

  describe("when typing", () => {
    it("should update the model and offer the trailing clear button", async () => {
      await render(Group);
      await userEvent.type(field(), "squat");
      await expect
        .element(page.getByTestId("query"))
        .toHaveTextContent("squat");
      await page.getByRole("button", { name: "Clear search" }).click();
      await expect.element(page.getByTestId("query")).toHaveTextContent("");
      await expect.element(field()).toHaveValue("");
    });
  });

  describe("when the input is focused with the keyboard", () => {
    it("should draw the focus ring on the group", async () => {
      const { container } = await render(Group);
      await userEvent.tab();
      await expect.element(field()).toHaveFocus();
      const group = find(container, ".ui-input-group");
      expect(getComputedStyle(group).outlineStyle).toBe("solid");
      expect(getComputedStyle(field().element()).outlineColor).toBe(
        "rgba(0, 0, 0, 0)",
      );
    });
  });
});
