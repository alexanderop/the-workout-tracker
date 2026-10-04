import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { expectAccessible } from "./helpers/accessibility";
import ControlsHarness from "./fixtures/ControlsHarness.vue";

it("keeps controlled values in sync and submits native successful controls", async () => {
  await render(ControlsHarness);
  const name = page.getByRole("textbox", { name: "Workout name" });
  await name.fill("Strength");
  await expect
    .element(page.getByLabelText("Current name"))
    .toHaveTextContent("Strength");
  await page.getByRole("button", { name: "Set name" }).click();
  await expect.element(name).toHaveValue("Evening");
  await page.getByRole("spinbutton", { name: "Repetitions" }).fill("12");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect
    .element(page.getByLabelText("Submitted values"))
    .toHaveTextContent('{"name":"Evening","repetitions":"12"}');
  await expect
    .element(page.getByRole("button", { name: "Unavailable" }))
    .toBeDisabled();
  await expect
    .element(page.getByRole("link", { name: "Documentation" }))
    .toHaveAttribute("href", "#destination");
});

it("preserves browser-owned values, reset, and required validation", async () => {
  await render(ControlsHarness);
  const repetitions = page.getByRole("spinbutton", { name: "Repetitions" });
  await repetitions.fill("20");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect.element(repetitions).toHaveValue(8);
  await expect
    .element(page.getByRole("textbox", { name: "Workout name" }))
    .toHaveValue("");
  await expect
    .element(page.getByLabelText("Current name"))
    .toBeEmptyDOMElement();
  await repetitions.fill("");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect.element(repetitions).toBeInvalid();
  await expect
    .element(page.getByLabelText("Submitted values"))
    .toBeEmptyDOMElement();
});

it("keeps explicit field descriptions and errors associated without duplicate IDs", async () => {
  await render(ControlsHarness);
  const name = page.getByRole("textbox", { name: "Workout name" });
  await page.getByText("Workout name", { exact: true }).click();
  await expect.element(name).toHaveFocus();
  await userEvent.tab();
  await expect
    .element(page.getByRole("spinbutton", { name: "Repetitions" }))
    .toHaveFocus();
  await page.getByRole("button", { name: "Toggle error" }).click();
  await expect
    .element(name)
    .toHaveAccessibleDescription(
      "Shown in your list. Choose a different name.",
    );
  await expect.element(name).toHaveAttribute("aria-invalid", "true");
  const ids = [...document.querySelectorAll("[id]")].map(
    (element) => element.id,
  );
  expect(new Set(ids).size).toBe(ids.length);
  await expectAccessible("fields with validation errors");
});

it("shows a visible keyboard focus ring on outline buttons", async () => {
  await render(ControlsHarness);
  page.getByRole("button", { name: "Save", exact: true }).element().focus();
  await userEvent.tab();
  const reset = page.getByRole("button", { name: "Reset", exact: true });
  await expect.element(reset).toHaveFocus();
  const focused = document.activeElement;
  if (!(focused instanceof HTMLElement)) throw new Error("No focused element");
  expect(focused.matches(":focus-visible")).toBe(true);
  await expect
    .poll(() => getComputedStyle(focused).boxShadow)
    .toContain("0px 0px 0px 3px");
});

it("preserves an uncontrolled edit when its attributes change", async () => {
  await render(ControlsHarness);
  const repetitions = page.getByRole("spinbutton", { name: "Repetitions" });
  await expect.element(repetitions).toHaveValue(8);
  await repetitions.fill("20");
  await page.getByRole("button", { name: "Toggle error" }).click();
  await expect.element(repetitions).toHaveAttribute("aria-invalid", "true");
  await expect.element(repetitions).toHaveValue(20);
});
it("publishes composed text only after composition finishes", async () => {
  await render(ControlsHarness);
  const input = document.querySelector("#workout-name");
  if (!(input instanceof HTMLInputElement)) throw new Error("Missing input");
  input.dispatchEvent(
    new CompositionEvent("compositionstart", { bubbles: true }),
  );
  input.value = "東京";
  input.dispatchEvent(
    new InputEvent("input", { bubbles: true, isComposing: true }),
  );
  await expect
    .element(page.getByLabelText("Current name"))
    .toHaveTextContent("Morning");
  await page.getByRole("button", { name: "Toggle error" }).click();
  await expect.element(input).toHaveAttribute("aria-invalid", "true");
  await expect.element(input).toHaveValue("東京");
  input.dispatchEvent(
    new CompositionEvent("compositionend", { bubbles: true }),
  );
  await expect
    .element(page.getByLabelText("Current name"))
    .toHaveTextContent("東京");
});

it("lets the browser suppress disabled activation and omit disabled form data", async () => {
  await render(ControlsHarness);
  await page
    .getByRole("button", { name: "Unavailable" })
    .click({ force: true });
  await expect
    .element(page.getByLabelText("Submitted values"))
    .toBeEmptyDOMElement();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect
    .element(page.getByLabelText("Submitted values"))
    .toHaveTextContent('{"name":"Morning","repetitions":"8"}');
});
