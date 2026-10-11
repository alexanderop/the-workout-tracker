import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import Stats from "../fixtures/_BaseStat.vue";
import { expectNoAxeViolations } from "../support/axe";
import { find } from "../support/dom";

describe("given a group of stats", () => {
  it("should be a named group that reads value, unit, then label", async () => {
    const { container } = await render(Stats);
    const group = page.getByRole("group", { name: "Workout totals" });
    await expect.element(group).toBeVisible();
    const text = group.element().textContent;
    expect(text).toMatch(/12\s*sets logged/);
    expect(text).toMatch(/3,450\s*kg\s*volume/);
    await expectNoAxeViolations(container);
  });

  it("should draw the value above the label with the unit after the value", async () => {
    await render(Stats);
    const value = page.getByText("3,450", { exact: false }).element();
    const label = page.getByText("volume", { exact: true }).element();
    const unit = page.getByText("kg", { exact: true }).element();
    expect(value.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      label.getBoundingClientRect().top,
    );
    expect(unit.getBoundingClientRect().left).toBeGreaterThan(
      value.getBoundingClientRect().left,
    );
    expect(Number.parseFloat(getComputedStyle(unit).fontSize)).toBeLessThan(
      Number.parseFloat(getComputedStyle(value).fontSize),
    );
  });

  it("should lay the stats out in one row between two hairlines", async () => {
    const { container } = await render(Stats);
    const tops = [...container.querySelectorAll(".ui-stat")].map(
      (stat) => stat.getBoundingClientRect().top,
    );
    expect(new Set(tops).size).toBe(1);
    const group = getComputedStyle(find(container, ".ui-stat-group"));
    expect(group.borderTopWidth).toBe("1px");
    expect(group.borderBottomWidth).toBe("1px");
  });
});
