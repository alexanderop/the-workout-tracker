import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import FileInput from "../fixtures/_BaseFileInput.vue";
import { expectNoAxeViolations } from "../support/axe";

const input = () => page.getByLabelText("Backup file");

describe("given a file input", () => {
  it("should be a labelled native file input outside the tab order", async () => {
    const { container } = await render(FileInput);
    const element = input().element();
    expect(element).toBeInstanceOf(HTMLInputElement);
    expect(element.getAttribute("type")).toBe("file");
    expect(element.getAttribute("accept")).toBe("application/json,.json");
    expect(element.tabIndex).toBe(-1);
    await expectNoAxeViolations(container);
  });

  describe("when a file is chosen", () => {
    it("should emit it and clear itself, so the same file fires again", async () => {
      await render(FileInput);
      const file = new File(["{}"], "backup.json", {
        type: "application/json",
      });
      await userEvent.upload(input(), file);
      await userEvent.upload(input(), file);
      await expect
        .element(page.getByTestId("names"))
        .toHaveTextContent("backup.json,backup.json");
      await expect.element(input()).toHaveValue("");
    });
  });

  describe("when the button calls open()", () => {
    it("should open the native picker through the input", async () => {
      await render(FileInput);
      let clicked = 0;
      input()
        .element()
        .addEventListener("click", (event) => {
          event.preventDefault();
          clicked += 1;
        });
      await page.getByRole("button", { name: "Choose file" }).click();
      expect(clicked).toBe(1);
    });
  });
});
