import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import Header from "../fixtures/_BasePageHeader.vue";
import { expectNoAxeViolations } from "../support/axe";

const detailTitle = () =>
  page.getByRole("heading", { level: 1, name: "Appearance" });
const rootTitle = () =>
  page.getByRole("heading", { level: 1, name: "Exercises" });

describe("given a detail header", () => {
  it("should show the back link, the title as the page heading and the action", async () => {
    const { container } = await render(Header);
    await expect
      .element(page.getByRole("link", { name: "Settings" }))
      .toBeVisible();
    await expect.element(detailTitle()).toBeVisible();
    await expect
      .element(page.getByRole("button", { name: "Create" }))
      .toBeVisible();
    await expectNoAxeViolations(container);
  });

  describe("when the screen appears", () => {
    it("should move focus to the heading", async () => {
      await render(Header, { props: { open: false } });
      await page.getByRole("button", { name: "Open screen" }).click();
      await expect.element(detailTitle()).toHaveFocus();
    });
  });

  describe("when the page scrolls", () => {
    it("should stay pinned at the top", async () => {
      await render(Header);
      window.scrollTo(0, 600);
      await expect.poll(() => window.scrollY).toBeGreaterThan(0);
      const top = detailTitle().element().getBoundingClientRect().top;
      expect(top).toBeGreaterThanOrEqual(0);
      expect(top).toBeLessThan(60);
    });
  });
});

describe("given a detail header with a very long title", () => {
  it("should stay a short bar of at most two lines", async () => {
    await render(Header, { props: { longTitle: true } });
    const title = page.getByRole("heading", { level: 1 }).element();
    const lineHeight = Number.parseFloat(getComputedStyle(title).lineHeight);
    expect(title.getBoundingClientRect().height).toBeLessThanOrEqual(
      lineHeight * 2 + 1,
    );
  });
});

describe("given two root headers, one with an action and one without", () => {
  it("should put the title at the same height", async () => {
    const withAction = await render(Header, { props: { variant: "root" } });
    const top = rootTitle().element().getBoundingClientRect().top;
    await withAction.unmount();
    await render(Header, { props: { variant: "root", withAction: false } });
    expect(rootTitle().element().getBoundingClientRect().top).toBe(top);
  });
});

describe("given a root header", () => {
  it("should show a large title and the action but no back link", async () => {
    const { container } = await render(Header, { props: { variant: "root" } });
    await expect.element(rootTitle()).toBeVisible();
    await expect
      .element(page.getByRole("link", { name: "Settings" }))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "Create" }))
      .toBeVisible();
    expect(
      Number.parseFloat(getComputedStyle(rootTitle().element()).fontSize),
    ).toBeGreaterThanOrEqual(32);
    await expectNoAxeViolations(container);
  });

  it("should leave focus to the shell and scroll away with the page", async () => {
    await render(Header, { props: { variant: "root" } });
    await expect.element(rootTitle()).not.toHaveFocus();
    window.scrollTo(0, 600);
    await expect.poll(() => window.scrollY).toBeGreaterThan(0);
    expect(rootTitle().element().getBoundingClientRect().bottom).toBeLessThan(
      0,
    );
  });
});
