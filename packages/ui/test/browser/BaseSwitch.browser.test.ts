import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import Switch from "../fixtures/_BaseSwitch.vue";
import { expectNoAxeViolations } from "../support/axe";

const toggle = () => page.getByRole("switch", { name: "Rest timer" });
const modelValue = () => page.getByTestId("model-value");

describe("given an unchecked switch", () => {
  it("should be labelled, unchecked and accessible", async () => {
    const { container } = await render(Switch);
    await expect.element(toggle()).not.toBeChecked();
    await expectNoAxeViolations(container);
  });

  describe("when clicking it", () => {
    it("should check it and update the model", async () => {
      await render(Switch);
      await toggle().click();
      await expect.element(toggle()).toBeChecked();
      await expect.element(modelValue()).toHaveTextContent("true");
    });
  });

  describe("when clicking its label", () => {
    it("should toggle it", async () => {
      await render(Switch);
      await page.getByText("Rest timer").click();
      await expect.element(modelValue()).toHaveTextContent("true");
    });
  });

  describe("when pressing Space with keyboard focus", () => {
    it("should toggle it", async () => {
      await render(Switch);
      await userEvent.tab();
      await expect.element(toggle()).toHaveFocus();
      await userEvent.keyboard(" ");
      await expect.element(toggle()).toBeChecked();
      await userEvent.keyboard(" ");
      await expect.element(toggle()).not.toBeChecked();
      await expect.element(modelValue()).toHaveTextContent("false");
    });
  });
});

describe("given a checked switch", () => {
  it("should reflect the model and remain accessible", async () => {
    const { container } = await render(Switch, { props: { initial: true } });
    await expect.element(toggle()).toBeChecked();
    await expectNoAxeViolations(container);
  });
});

describe("given a disabled switch", () => {
  describe("when clicking it", () => {
    it("should not change the model", async () => {
      await render(Switch, { props: { disabled: true } });
      await expect.element(toggle()).toBeDisabled();
      await toggle().click({ force: true });
      await expect.element(toggle()).not.toBeChecked();
      await expect.element(modelValue()).toHaveTextContent("false");
    });
  });

  describe("when tabbing", () => {
    it("should be skipped", async () => {
      await render(Switch, { props: { disabled: true } });
      await userEvent.tab();
      await expect.element(toggle()).not.toHaveFocus();
    });
  });
});
