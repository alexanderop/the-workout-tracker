import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import Boundary from "../fixtures/_AppErrorBoundary.vue";
import { expectNoAxeViolations } from "../support/axe";

const openBrokenScreen = () =>
  page.getByRole("button", { name: "Open broken screen" });

describe("given a working screen", () => {
  it("should render it without recovery UI", async () => {
    await render(Boundary);
    await expect.element(page.getByText("Everything works")).toBeVisible();
    await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
  });
});

describe("given a screen that fails while rendering", () => {
  describe("when the failure reaches the boundary", () => {
    it("should offer reload and move focus to the heading", async () => {
      await render(Boundary);
      await openBrokenScreen().click();
      await expect
        .element(page.getByRole("heading", { name: "Something went wrong" }))
        .toHaveFocus();
      await expect
        .element(page.getByRole("button", { name: "Reload app" }))
        .toBeVisible();
      await expect
        .element(page.getByRole("button", { name: "Copy diagnostics" }))
        .toBeVisible();
    });

    it("should say that saved workouts stay and unsaved input may not", async () => {
      await render(Boundary);
      await openBrokenScreen().click();
      await expect
        .element(page.getByText(/Your saved workouts remain on this device/))
        .toBeVisible();
      await expect
        .element(page.getByText(/Anything you had not saved yet may be lost/))
        .toBeVisible();
    });

    it("should show diagnostics that name the build and nothing private", async () => {
      await render(Boundary);
      await openBrokenScreen().click();
      await page.getByText("Diagnostics", { exact: true }).click();
      const content = page.getByRole("alert").element().textContent;
      expect(content).toContain("The Workout Tracker");
      expect(content).toContain("test-build");
      expect(content).toContain("Unexpected interface error");
      expect(content).not.toContain("Bench press");
      expect(content).not.toContain("100 kg");
      expect(content).not.toContain("private");
    });

    it("should be accessible", async () => {
      const { container } = await render(Boundary);
      await openBrokenScreen().click();
      await expect
        .element(page.getByRole("heading", { name: "Something went wrong" }))
        .toBeVisible();
      await expectNoAxeViolations(container);
    });
  });
});
