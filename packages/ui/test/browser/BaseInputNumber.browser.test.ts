import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import NumberInput from "../fixtures/_BaseInputNumber.vue";
import { expectNoAxeViolations } from "../support/axe";

// The dialog is teleported to <body>, so its parts are found through `page`
// rather than the rendered container.
const trigger = () =>
  page.getByRole("button", { name: /^Set 1 weight for Bench press: / });
const dialog = () => page.getByRole("dialog", { name: "Weight" });
const editor = () => page.getByRole("group", { name: "Number editor" });
// While the modal is open, everything outside it is aria-hidden, so the
// fixture's confirmed value is read by test id rather than by role.
const confirmed = () => page.getByTestId("confirmed-value");
const draft = () => editor();
const announcement = () =>
  page.getByRole("status").filter({ hasText: "Weight set to" });
const confirm = () => page.getByRole("button", { name: "Use weight" });

async function openEditor() {
  await render(NumberInput);
  await trigger().click();
  await expect.element(dialog()).toBeVisible();
}

describe("given a weight input", () => {
  it("should include the visible value in the trigger's accessible name", async () => {
    await render(NumberInput);
    // WCAG 2.5.3 Label in Name: voice control users can say what they see.
    await expect
      .element(trigger())
      .toHaveAccessibleName("Set 1 weight for Bench press: 70.25 kg");
    await expect.element(trigger()).toHaveTextContent("70.25");
    await expectNoAxeViolations(document.body);
  });

  describe("when the editor opens", () => {
    it("should move focus to the number editor", async () => {
      await openEditor();
      await expect.element(editor()).toHaveFocus();
    });

    it("should expose a labelled editor, keypad and suggestions", async () => {
      await openEditor();
      await expect.element(dialog()).toMatchAriaInlineSnapshot(`
        - dialog "Weight":
          - banner:
            - heading "Weight" [level=2]
            - paragraph: Set 1 weight for Bench press
            - button "Cancel"
          - region "Suggested values":
            - paragraph: Quick pick Tap to use
            - button "Use 62.5 kg": 62.5 kg
            - button "Use 65 kg": 65 kg
            - button "Use 67.5 kg": 67.5 kg
            - button "Use 70 kg": 70 kg
            - button "Use 72.5 kg": 72.5 kg
            - button "Use 75 kg": 75 kg
            - button "Use 77.5 kg": 77.5 kg
            - button "Use 80 kg": 80 kg
          - group "Number editor":
            - text: 70.25 kg
            - paragraph: Type a new value to replace this one.
          - group "Numeric keypad":
            - button "1"
            - button "2"
            - button "3"
            - button "4"
            - button "5"
            - button "6"
            - button "7"
            - button "8"
            - button "9"
            - button "Decimal point": .
            - button "0"
            - button "Backspace"
          - button "Use weight"
      `);
    });

    it("should have no axe violations", async () => {
      await openEditor();
      await expectNoAxeViolations(dialog().element());
    });
  });

  describe("when typing digits", () => {
    it("should replace the draft without changing the confirmed value", async () => {
      await openEditor();
      await userEvent.keyboard("55");
      await expect.element(draft().getByText("55", { exact: true })).toBeVisible();
      await expect.element(confirmed()).toHaveTextContent("70.25");
    });

    it("should not announce each keypress", async () => {
      await openEditor();
      await userEvent.keyboard("55");
      await expect.element(draft().getByText("55", { exact: true })).toBeVisible();
      expect(dialog().getByRole("status").query()).toBeNull();
      expect(document.querySelector('[role="status"]')).toBeNull();
    });
  });

  describe("when typing digits and pressing Enter", () => {
    it("should confirm the draft, close and return focus to the trigger", async () => {
      await openEditor();
      await userEvent.keyboard("55{Enter}");
      await expect.element(confirmed()).toHaveTextContent("55");
      await expect.element(dialog()).not.toBeInTheDocument();
      await expect.element(trigger()).toHaveFocus();
    });

    it("should announce the confirmed value", async () => {
      await openEditor();
      await userEvent.keyboard("55{Enter}");
      await expect.element(dialog()).not.toBeInTheDocument();
      await expect
        .element(announcement())
        .toHaveTextContent("Weight set to 55 kg");
    });

    it("should drop the announcement once focus leaves the trigger", async () => {
      await openEditor();
      await userEvent.keyboard("55{Enter}");
      await expect.element(announcement()).toBeInTheDocument();
      await userEvent.tab();
      await expect.element(announcement()).not.toBeInTheDocument();
    });
  });

  describe("when typing digits and pressing Escape", () => {
    it("should discard the draft and return focus to the trigger", async () => {
      await openEditor();
      await userEvent.keyboard("55{Escape}");
      await expect.element(dialog()).not.toBeInTheDocument();
      await expect.element(confirmed()).toHaveTextContent("70.25");
      await expect.element(trigger()).toHaveFocus();
    });
  });

  describe("when using the on-screen keypad", () => {
    it("should confirm only through the confirm button", async () => {
      await openEditor();
      await page.getByRole("button", { name: "4", exact: true }).click();
      await page.getByRole("button", { name: "Decimal point" }).click();
      await page.getByRole("button", { name: "5", exact: true }).click();
      await expect.element(confirmed()).toHaveTextContent("70.25");
      await confirm().click();
      await expect.element(confirmed()).toHaveTextContent("4.5");
    });
  });

  describe("when choosing a suggested value", () => {
    it("should confirm it immediately", async () => {
      await openEditor();
      const suggestions = page.getByRole("region", { name: "Suggested values" });
      const first = suggestions.getByRole("button").first();
      const label = first.element().getAttribute("aria-label") ?? "";
      await first.click();
      const value = label.replace(/^Use | kg$/g, "");
      await expect.element(confirmed()).toHaveTextContent(value);
      await expect
        .element(announcement())
        .toHaveTextContent(`Weight set to ${value} kg`);
    });
  });
});

describe("given a consumer-supplied aria-label", () => {
  it("should use it as the trigger's accessible name", async () => {
    await render(NumberInput, {
      props: { triggerLabel: "Bench press weight, 70.25 kg" },
    });
    await expect
      .element(page.getByRole("button", { name: "Bench press weight, 70.25 kg" }))
      .toBeVisible();
  });
});

describe("given an opening value more precise than allowed", () => {
  it("should disable confirmation and explain the precision", async () => {
    await render(NumberInput, { props: { initial: 2.345, decimals: 2 } });
    await trigger().click();
    await expect.element(confirm()).toBeDisabled();
    await expect
      .element(editor())
      .toHaveAccessibleDescription(
        "Enter a value with up to 2 decimal places from 0 to 1000 kg.",
      );
    await expectNoAxeViolations(dialog().element());
  });
});

describe("given a repetitions input with a minimum of one", () => {
  describe("when the draft is below the minimum", () => {
    it("should disable confirmation and explain the allowed range", async () => {
      await render(NumberInput, {
        props: {
          initial: 8,
          title: "Reps",
          label: "Set 1 repetitions",
          unit: "",
          min: 1,
          decimals: 0,
          presetStep: 1,
        },
      });
      await page.getByRole("button", { name: "Set 1 repetitions: 8" }).click();
      await userEvent.keyboard("0");
      await expect
        .element(page.getByRole("button", { name: "Use reps" }))
        .toBeDisabled();
      await expect
        .element(page.getByRole("group", { name: "Number editor" }))
        .toHaveAccessibleDescription("Enter a whole number from 1 to 1000.");
    });
  });
});

async function openCommaEditor() {
  await render(NumberInput, { props: { separator: "," } });
  await trigger().click();
  await expect.element(dialog()).toBeVisible();
}

describe("given a language with a decimal comma", () => {
  it("should show the comma on the trigger, the draft, the keypad and the suggestions", async () => {
    await render(NumberInput, { props: { separator: "," } });
    await expect.element(trigger()).toHaveTextContent("70,25");
    await trigger().click();
    await expect.element(draft().getByText("70,25", { exact: true })).toBeVisible();
    await expect
      .element(page.getByRole("button", { name: "Decimal point" }))
      .toHaveTextContent(",");
    await expect
      .element(page.getByRole("button", { name: "Use 62.5 kg" }))
      .toHaveTextContent("62,5kg");
  });

  it("should accept a comma or a point from the keyboard and store a number", async () => {
    await openCommaEditor();
    await userEvent.keyboard("42,5");
    await expect.element(draft().getByText("42,5", { exact: true })).toBeVisible();
    await userEvent.keyboard("{Backspace}{Backspace}.5");
    await expect.element(draft().getByText("42,5", { exact: true })).toBeVisible();
    await confirm().click();
    await expect.element(confirmed()).toHaveTextContent("42.5");
    await expect.element(trigger()).toHaveTextContent("42,5");
  });

  it("should press the decimal key as a comma", async () => {
    await openCommaEditor();
    await page.getByRole("button", { name: "4" }).click();
    await page.getByRole("button", { name: "Decimal point" }).click();
    await page.getByRole("button", { name: "5" }).click();
    await expect.element(draft().getByText("4,5", { exact: true })).toBeVisible();
  });
});
