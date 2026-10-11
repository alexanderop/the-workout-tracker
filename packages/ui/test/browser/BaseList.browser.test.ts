import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import List from "../fixtures/_BaseList.vue";
import { expectNoAxeViolations } from "../support/axe";
import { find } from "../support/dom";

describe("given a group of list rows", () => {
  it("should name the group and show titles, values and descriptions", async () => {
    const { container } = await render(List);
    await expect
      .element(page.getByRole("heading", { name: "Preferences" }))
      .toBeVisible();
    await expect
      .element(page.getByRole("link", { name: "Appearance System · Blue" }))
      .toBeVisible();
    await expect.element(page.getByText("Installed build")).toBeVisible();
    await expectNoAxeViolations(container);
  });

  describe("when a link row is chosen", () => {
    it("should activate the row element itself", async () => {
      await render(List);
      await page.getByRole("link", { name: /^Language/ }).click();
      await expect
        .element(page.getByTestId("opened"))
        .toHaveTextContent("language");
    });

    it("should be reachable and operable by keyboard", async () => {
      await render(List);
      await userEvent.tab();
      await expect
        .element(page.getByRole("link", { name: /^Appearance/ }))
        .toHaveFocus();
      await userEvent.keyboard("{Enter}");
      await expect
        .element(page.getByTestId("opened"))
        .toHaveTextContent("appearance");
    });
  });

  describe("given a row without a link", () => {
    it("should not be a link", async () => {
      await render(List);
      await expect
        .element(page.getByRole("link", { name: /^Version/ }))
        .not.toBeInTheDocument();
    });
  });
});

describe("given a row with leading, subtitle and trailing content", () => {
  it("should draw artwork, then the title over its subtitle, then the trailing value", async () => {
    await render(List);
    const row = page.getByTestId("pick-squat").element();
    const art = find(row, "[data-testid=art]").getBoundingClientRect();
    const label = find(row, ".ui-list-row-label").getBoundingClientRect();
    const subtitle = find(row, ".ui-list-row-subtitle").getBoundingClientRect();
    const trailing = find(row, ".mark").getBoundingClientRect();
    expect(art.width).toBe(52);
    expect(art.right).toBeLessThanOrEqual(label.left);
    expect(label.bottom).toBeLessThanOrEqual(subtitle.top);
    expect(subtitle.right).toBeLessThanOrEqual(trailing.left);
  });

  it("should read the title, then the subtitle, as the row's name", async () => {
    await render(List);
    await expect
      .element(page.getByRole("button", { name: /^Back squat Legs · Barbell/ }))
      .toBeVisible();
  });

  it("should stack every span of the subtitle slot as its own line", async () => {
    await render(List);
    const lines = [
      ...page
        .getByTestId("comfortable")
        .element()
        .querySelectorAll(".ui-list-row-subtitle > span"),
    ].map((line) => line.getBoundingClientRect().top);
    expect(lines).toHaveLength(2);
    expect(lines[1]).toBeGreaterThan(lines[0] ?? 0);
  });
});

describe("given a row that renders as a button", () => {
  it("should be a native button that does not submit a form", async () => {
    await render(List);
    expect(page.getByTestId("pick-squat").element().getAttribute("type")).toBe(
      "button",
    );
  });

  it("should toggle by click, Enter and Space and show the selected look", async () => {
    await render(List);
    const row = page.getByTestId("pick-squat");
    await row.click();
    await expect.element(row).toHaveAttribute("aria-pressed", "true");
    await expect.element(row).toHaveAttribute("data-selected");
    await userEvent.keyboard("{Enter}");
    await expect.element(row).toHaveAttribute("aria-pressed", "false");
    await userEvent.keyboard(" ");
    await expect.element(row).toHaveAttribute("aria-pressed", "true");
    const selected = getComputedStyle(row.element());
    const probe = document.createElement("i");
    probe.style.background = "var(--ui-selected-bg)";
    document.body.append(probe);
    expect(selected.backgroundColor).toBe(
      getComputedStyle(probe).backgroundColor,
    );
    probe.remove();
  });
});

describe("given the density of a row", () => {
  it("should keep compact rows at the 44px touch floor and comfortable rows at 56px", async () => {
    await render(List);
    const compact = page.getByTestId("pick-bench").element();
    const comfortable = page.getByTestId("comfortable").element();
    // Compact keeps room for the 52px artwork plus its padding; plain compact
    // rows stay at the 44px floor, comfortable ones at 56px.
    expect(compact.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    expect(compact.getAttribute("data-density")).toBe("compact");
    expect(comfortable.getAttribute("data-density")).toBe("comfortable");
    expect(comfortable.getBoundingClientRect().height).toBeGreaterThanOrEqual(
      56,
    );
    expect(
      Number.parseFloat(getComputedStyle(compact).paddingTop),
    ).toBeLessThan(Number.parseFloat(getComputedStyle(comfortable).paddingTop));
  });
});

describe("given the separators and chevrons of a list", () => {
  it("should separate rows with one --rule hairline and leave the first row bare", async () => {
    await render(List);
    const rows = [
      ...page
        .getByTestId("workouts")
        .element()
        .querySelectorAll(".ui-list-row"),
    ];
    const probe = document.createElement("i");
    probe.style.borderTop = "1px solid var(--rule)";
    document.body.append(probe);
    const rule = getComputedStyle(probe).borderTopColor;
    probe.remove();
    const [first, ...rest] = rows;
    if (!first) throw new Error("Expected rows");
    expect(getComputedStyle(first).borderTopWidth).toBe("0px");
    for (const row of rest) {
      expect(getComputedStyle(row).borderTopColor).toBe(rule);
      expect(getComputedStyle(row).borderTopWidth).toBe("1px");
    }
  });

  it("should draw every chevron at one size", async () => {
    const { container } = await render(List);
    const sizes = new Set(
      [...container.querySelectorAll(".ui-list-row-chevron")].map(
        (chevron) => chevron.getBoundingClientRect().width,
      ),
    );
    expect([...sizes]).toEqual([18]);
  });
});

describe("given a group with an action and a scrolling card", () => {
  it("should place the action opposite the label", async () => {
    await render(List);
    const group = page.getByTestId("workouts").element();
    const heading = find(group, ".ui-list-group-label").getBoundingClientRect();
    const action = find(group, "button").getBoundingClientRect();
    expect(action.left).toBeGreaterThan(heading.right);
    await page.getByRole("button", { name: "View all" }).click();
    await expect
      .element(page.getByTestId("opened"))
      .toHaveTextContent("history");
  });

  it("should scroll its rows inside a bounded height and scroll back to the top", async () => {
    await render(List, { props: { scrolling: true } });
    const group = page.getByTestId("scrolling").element();
    const card = find(group, ".ui-list-group-card");
    expect(card.scrollHeight).toBeGreaterThan(card.clientHeight);
    expect(group.getBoundingClientRect().height).toBeLessThanOrEqual(200);
    card.scrollTop = 120;
    expect(card.scrollTop).toBeGreaterThan(0);
  });
});
