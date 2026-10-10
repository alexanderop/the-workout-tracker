import { describe, expect, it } from "vitest";
import { createSSRApp, defineComponent, h, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { beginEditing, pasteHint } from "../src/numeric-input/editing";
import { useNumericText } from "../src/numeric-input/useNumericText";
import { defaultUiText, provideUiText, useUiText } from "../src/ui-text";
import type { UiText } from "../src/ui-text";

const range = { min: 0, max: 100, decimals: 2, unit: "kg" };
const { numeric, install, muscleMap } = defaultUiText;

describe("given the default English text", () => {
  it("should name sheets and dialogs", () => {
    expect(defaultUiText.close).toBe("Close");
    expect(defaultUiText.closeDialog).toBe("Close dialog");
    expect(defaultUiText.sheetOptions("Filters")).toBe("Filters options");
  });

  it("should phrase the numeric editor's names with and without a unit", () => {
    expect(numeric.confirm("Weight")).toBe("Use weight");
    expect(numeric.announce({ title: "Weight", value: 5, unit: "" })).toBe(
      "Weight set to 5",
    );
    expect(numeric.announce({ title: "Weight", value: 5, unit: "kg" })).toBe(
      "Weight set to 5 kg",
    );
    expect(numeric.trigger({ label: "Weight", value: "", unit: "kg" })).toBe(
      "Weight: empty kg",
    );
    expect(numeric.trigger({ label: "Reps", value: 8, unit: "" })).toBe(
      "Reps: 8",
    );
    expect(numeric.usePreset({ value: 5, unit: "kg" })).toBe("Use 5 kg");
    expect(numeric.usePreset({ value: 5, unit: "" })).toBe("Use 5");
  });

  it("should phrase hints with a unit and singular or plural places", () => {
    expect(numeric.wholeNumber({ ...range, unit: "" })).toBe(
      "Enter a whole number from 0 to 100.",
    );
    expect(numeric.value(range)).toBe("Enter a value from 0 to 100 kg.");
    expect(numeric.fewerDecimals({ ...range, decimals: 1 })).toBe(
      "Enter a value with up to 1 decimal place from 0 to 100 kg.",
    );
    expect(numeric.fewerDecimals(range)).toBe(
      "Enter a value with up to 2 decimal places from 0 to 100 kg.",
    );
    expect(numeric.pasteWhole(range)).toBe(
      "Paste a whole number from 0 to 100.",
    );
    expect(numeric.pasteDecimal(range)).toBe(
      "Paste a number with up to 2 decimal places from 0 to 100.",
    );
  });

  it("should list install steps and muscle names", () => {
    expect(install.ios).toHaveLength(3);
    expect(install.android).toHaveLength(3);
    expect(install.browser).toHaveLength(2);
    expect(muscleMap.regions.abs).toBe("Core");
  });
});

describe("given an app that translates the text", () => {
  const german: UiText = {
    ...defaultUiText,
    numeric: {
      ...numeric,
      replace: "ersetzen",
      ready: "bereit",
      pasteWhole: () => "einfügen",
    },
    closeDialog: "Dialog schließen",
  };
  const Probe = defineComponent({
    setup() {
      const { text, hint, pasteHint: paste } = useNumericText();
      const ui = useUiText();
      const limits = { min: 0, max: 9, decimals: 0, presetStep: 1 };
      return () =>
        h(
          "p",
          [
            ui.value.closeDialog,
            text.value.replace,
            hint.value(beginEditing("5"), limits, ""),
            paste(limits),
          ].join("|"),
        );
    },
  });

  it("should read the provided text in every component below", async () => {
    const Root = defineComponent({
      setup() {
        provideUiText(ref(german));
        return () => h(Probe);
      },
    });
    const html = await renderToString(createSSRApp(Root));
    expect(html).toBe("<p>Dialog schließen|ersetzen|ersetzen|einfügen</p>");
  });

  it("should fall back to English without a provider", async () => {
    const html = await renderToString(createSSRApp(Probe));
    expect(html).toContain(
      "Close dialog|Type a new value to replace this one.",
    );
  });

  it("should pass the text to the paste hint", () => {
    expect(
      pasteHint({ min: 1, max: 9, decimals: 0, presetStep: 1 }, german.numeric),
    ).toBe("einfügen");
  });
});
