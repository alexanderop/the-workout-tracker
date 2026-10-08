import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import NumberField from "../fixtures/_BaseInput.vue";
import { expectNoAxeViolations } from "../support/axe";

const input = () => page.getByRole("spinbutton", { name: "Target repetitions" });
const modelValue = () => page.getByTestId("model-value");
const modelType = () => page.getByTestId("model-type");

describe("given a controlled number input", () => {
  it("should be labelled and show the model value", async () => {
    const { container } = await render(NumberField);
    await expect.element(input()).toHaveValue(5);
    await expectNoAxeViolations(container);
  });

  describe("when typing a number", () => {
    it("should emit it as a number", async () => {
      await render(NumberField);
      await input().fill("12.5");
      await expect.element(modelValue()).toHaveTextContent("12.5");
      await expect.element(modelType()).toHaveTextContent("number");
    });
  });

  describe("when clearing the input", () => {
    it("should emit an empty string", async () => {
      await render(NumberField);
      await input().clear();
      await expect.element(modelValue()).toHaveTextContent("");
      await expect.element(modelType()).toHaveTextContent("string");
    });
  });

  describe("when the parent changes the model", () => {
    it("should show the new value", async () => {
      await render(NumberField);
      await page.getByRole("button", { name: "Use 12" }).click();
      await expect.element(input()).toHaveValue(12);
    });
  });

  describe("when the form is reset", () => {
    it("should restore and emit the default value", async () => {
      await render(NumberField, { props: { initial: 5, defaultValue: 8 } });
      await input().fill("20");
      await expect.element(modelValue()).toHaveTextContent("20");
      await page.getByRole("button", { name: "Reset" }).click();
      await expect.element(input()).toHaveValue(8);
      await expect.element(modelValue()).toHaveTextContent("8");
    });
  });
});

describe("given an input with keyboard focus", () => {
  describe("when pressing Tab", () => {
    it("should move focus to the next control", async () => {
      await render(NumberField);
      await input().click();
      await expect.element(input()).toHaveFocus();
      await userEvent.tab();
      await expect
        .element(page.getByRole("button", { name: "Reset" }))
        .toHaveFocus();
    });
  });
});
