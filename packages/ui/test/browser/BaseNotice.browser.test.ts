import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import Notice from "../fixtures/_BaseNotice.vue";
import { expectNoAxeViolations } from "../support/axe";

describe("given notices of each tone", () => {
  it("should announce danger as an alert and the others as status", async () => {
    await render(Notice);
    await expect
      .element(page.getByRole("alert"))
      .toHaveTextContent("Could not save the workout.");
    const statuses = document.querySelectorAll('.ui-notice[role="status"]');
    expect(statuses).toHaveLength(3);
    expect(statuses[0]?.textContent).toContain("New version");
  });

  it("should give each tone its own icon, so tone is not color alone", async () => {
    const { container } = await render(Notice);
    const icons = [...container.querySelectorAll(".ui-notice-icon")].map(
      (icon) => icon.getAttribute("class"),
    );
    expect(new Set(icons.slice(0, 3)).size).toBe(3);
  });

  it("should have no axe violations", async () => {
    const { container } = await render(Notice);
    await expectNoAxeViolations(container);
  });
});

describe("given a dismissible notice with an action", () => {
  it("should render the action slot", async () => {
    await render(Notice);
    await expect
      .element(page.getByRole("button", { name: "Reload" }))
      .toBeVisible();
  });

  describe("when dismissing it", () => {
    it("should emit dismiss from a 44px labelled button", async () => {
      await render(Notice);
      const dismiss = page.getByRole("button", {
        name: "Dismiss update notice",
      });
      expect(
        dismiss.element().getBoundingClientRect().height,
      ).toBeGreaterThanOrEqual(44);
      await dismiss.click();
      await expect
        .element(page.getByTestId("dismissals"))
        .toHaveTextContent("1");
      await expect.element(dismiss).not.toBeInTheDocument();
    });
  });

  it("should show no dismiss button unless a label is given", async () => {
    await render(Notice);
    expect(
      page.getByRole("button", { name: /dismiss/i }).elements(),
    ).toHaveLength(1);
  });
});
