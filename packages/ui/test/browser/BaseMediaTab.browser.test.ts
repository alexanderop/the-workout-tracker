import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import Tabs from "../fixtures/_BaseMediaTab.vue";
import { expectNoAxeViolations } from "../support/axe";
import { find } from "../support/dom";

const tab = (name: string) => page.getByRole("button", { name });

describe("given media tabs", () => {
  it("should be named after their caption and mark the current tab", async () => {
    const { container } = await render(Tabs);
    await expect.element(tab("squat")).toHaveAttribute("aria-current", "true");
    expect(tab("bench").element().hasAttribute("aria-current")).toBe(false);
    await expectNoAxeViolations(container);
  });

  describe("when choosing another tab", () => {
    it("should move aria-current and the selected look", async () => {
      await render(Tabs);
      const media = (name: string) =>
        getComputedStyle(find(tab(name).element(), ".ui-media-tab-media"));
      const before = media("bench").backgroundColor;
      await tab("bench").click();
      await expect
        .element(page.getByTestId("current"))
        .toHaveTextContent("bench");
      await expect
        .element(tab("bench"))
        .toHaveAttribute("aria-current", "true");
      expect(media("bench").backgroundColor).not.toBe(before);
      expect(media("bench").backgroundColor).toBe(
        (() => {
          const probe = document.createElement("div");
          probe.style.background = "var(--ui-selected-bg)";
          document.body.append(probe);
          const color = getComputedStyle(probe).backgroundColor;
          probe.remove();
          return color;
        })(),
      );
    });
  });

  it("should keep the tile, and so the badge, out of the accessible name", async () => {
    await render(Tabs);
    const media = find(tab("bench").element(), ".ui-media-tab-media");
    expect(media.getAttribute("aria-hidden")).toBe("true");
    expect(media.querySelector(".ui-media-tab-badge")).not.toBeNull();
  });

  it("should not activate while disabled and keep its explicit name", async () => {
    await render(Tabs);
    await expect.element(tab("Add exercises")).toBeDisabled();
  });

  describe("when focused with the keyboard", () => {
    it("should show the focus ring and activate with Enter", async () => {
      await render(Tabs);
      await userEvent.tab();
      await expect.element(tab("squat")).toHaveFocus();
      expect(getComputedStyle(tab("squat").element()).outlineStyle).toBe(
        "solid",
      );
      await userEvent.tab();
      await userEvent.keyboard("{Enter}");
      await expect
        .element(page.getByTestId("current"))
        .toHaveTextContent("bench");
    });
  });
});
