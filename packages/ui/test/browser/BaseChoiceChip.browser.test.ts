import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import Chips from "../fixtures/_BaseChoiceChip.vue";
import { expectNoAxeViolations } from "../support/axe";
import { find } from "../support/dom";

const flat = () => page.getByRole("button", { name: "Flat bench" });
const radio = (name: string) => page.getByRole("radio", { name });

// The one selected look is the accent-soft surface with an accent border.
function look(element: Element) {
  const style = getComputedStyle(element);
  return { background: style.backgroundColor, border: style.borderTopColor };
}

describe("given a toggle chip", () => {
  it("should be a button that is not pressed", async () => {
    const { container } = await render(Chips);
    await expect.element(flat()).toHaveAttribute("aria-pressed", "false");
    await expectNoAxeViolations(container);
  });

  describe("when pressing it", () => {
    it("should toggle aria-pressed and the boolean model", async () => {
      await render(Chips);
      await flat().click();
      await expect.element(flat()).toHaveAttribute("aria-pressed", "true");
      await expect.element(page.getByTestId("flat")).toHaveTextContent("true");
      await userEvent.keyboard("{Enter}");
      await expect.element(flat()).toHaveAttribute("aria-pressed", "false");
    });

    it("should use the shared selected tokens", async () => {
      await render(Chips);
      await flat().click();
      const probe = document.createElement("div");
      probe.style.background = "var(--ui-selected-bg)";
      probe.style.borderTop = "1px solid var(--ui-selected-border)";
      document.body.append(probe);
      expect(look(flat().element())).toEqual(look(probe));
      probe.remove();
    });

    it("should switch to the accent-soft look shared with radio chips", async () => {
      await render(Chips);
      const before = look(flat().element());
      await flat().click();
      const pressed = look(flat().element());
      expect(pressed).not.toEqual(before);
      expect(pressed).toEqual(
        look(find(document.body, ".ui-choice-chip:has(input:checked)")),
      );
    });
  });

  it("should be at least 44px high", async () => {
    await render(Chips);
    expect(
      flat().element().getBoundingClientRect().height,
    ).toBeGreaterThanOrEqual(44);
  });
});

describe("given a radio group of card chips", () => {
  it("should expose native radios with the model checked and show the media", async () => {
    await render(Chips);
    await expect.element(radio("barbell art barbell")).toBeChecked();
    await expect.element(page.getByText("dumbbell art")).toBeVisible();
  });

  describe("when choosing a chip", () => {
    it("should select it alone and update the model", async () => {
      await render(Chips);
      await radio("cable art cable").click();
      await expect.element(radio("cable art cable")).toBeChecked();
      await expect.element(radio("barbell art barbell")).not.toBeChecked();
      await expect
        .element(page.getByTestId("equipment"))
        .toHaveTextContent("cable");
    });
  });

  describe("when using the arrow keys", () => {
    it("should move the selection like a native radio group", async () => {
      await render(Chips);
      radio("barbell art barbell").element().focus();
      await userEvent.keyboard("{ArrowRight}");
      await expect
        .element(page.getByTestId("equipment"))
        .toHaveTextContent("dumbbell");
    });
  });
});

describe("given a disabled chip", () => {
  it("should not toggle", async () => {
    await render(Chips);
    await expect
      .element(page.getByRole("button", { name: "Locked" }))
      .toBeDisabled();
  });
});
