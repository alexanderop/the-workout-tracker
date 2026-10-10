import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import Header from "../fixtures/_BaseScreenHeader.vue";
import { expectNoAxeViolations } from "../support/axe";

const title = () => page.getByRole("heading", { level: 1, name: "Appearance" });

describe("given a screen header", () => {
  it("should show the back control and the title as the page heading", async () => {
    const { container } = await render(Header);
    await expect
      .element(page.getByRole("link", { name: "Settings" }))
      .toBeVisible();
    await expect.element(title()).toBeVisible();
    await expectNoAxeViolations(container);
  });

  describe("when the screen appears", () => {
    it("should move focus to the heading", async () => {
      await render(Header, { props: { open: false } });
      await page.getByRole("button", { name: "Open screen" }).click();
      await expect.element(title()).toHaveFocus();
    });
  });

  describe("when the page scrolls", () => {
    it("should stay pinned at the top", async () => {
      await render(Header);
      window.scrollTo(0, 600);
      await expect.poll(() => window.scrollY).toBeGreaterThan(0);
      const top = title().element().getBoundingClientRect().top;
      expect(top).toBeGreaterThanOrEqual(0);
      expect(top).toBeLessThan(60);
    });
  });
});
