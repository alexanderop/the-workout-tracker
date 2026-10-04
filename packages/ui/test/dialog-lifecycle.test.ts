import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import DialogHarness from "./fixtures/DialogHarness.vue";
import { expectAccessible } from "./helpers/accessibility";

for (const customPortal of [false, true]) {
  it(`wraps Tab in both directions and restores modal state on reopen (${customPortal ? "custom" : "body"} portal)`, async () => {
    await render(DialogHarness, { props: { customPortal } });
    const trigger = page.getByRole("button", { name: "Edit workout" });
    const input = page.getByRole("textbox", { name: "Workout title" });
    const done = page.getByRole("button", { name: "Done" });
    const close = page.getByRole("button", { name: "Close" });
    await trigger.click();
    await expect.element(input).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect.element(close).toHaveFocus();
    await userEvent.tab();
    await expect.element(input).toHaveFocus();
    await userEvent.tab();
    await expect.element(done).toHaveFocus();
    await userEvent.tab();
    await expect.element(close).toHaveFocus();
    await userEvent.tab();
    await expect.element(input).toHaveFocus();
    await close.click();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
    await expect
      .poll(() => trigger.element().closest('[aria-hidden="true"]'))
      .toBeNull();
    await expect
      .poll(() => getComputedStyle(document.body).pointerEvents)
      .not.toBe("none");
    await userEvent.keyboard(" ");
    await expect.element(input).toHaveFocus();
    await expectAccessible("reopened dialog");
    await done.click();
    await expect.element(trigger).toHaveFocus();
  });
}

it("removes modal restrictions when unmounted while open", async () => {
  const screen = await render(DialogHarness);
  await page.getByRole("button", { name: "Edit workout" }).click();
  await expect.element(page.getByRole("dialog")).toBeVisible();
  await screen.unmount();
  await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  await expect
    .poll(() => getComputedStyle(document.body).pointerEvents)
    .not.toBe("none");
  await render(DialogHarness);
  const trigger = page.getByRole("button", { name: "Edit workout" });
  await trigger.click();
  await expect
    .element(page.getByRole("textbox", { name: "Workout title" }))
    .toHaveFocus();
  await userEvent.keyboard("{Escape}");
  await expect.element(trigger).toHaveFocus();
});
