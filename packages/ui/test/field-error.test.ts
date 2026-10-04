import { expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { FieldError } from "@form/ui";

it("announces unique nonempty errors and removes the alert when resolved", async () => {
  const errors: NonNullable<
    InstanceType<typeof FieldError>["$props"]["errors"]
  > = [undefined, "", { message: undefined }];
  const screen = await render(FieldError, {
    props: { errors },
  });
  await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
  await screen.rerender({
    errors: ["Required", { message: "Required" }, { message: "Too short" }, ""],
  });
  await expect
    .element(page.getByRole("alert"))
    .toHaveTextContent("RequiredToo short");
  await expect.element(page.getByRole("alert")).toMatchAriaInlineSnapshot(`
    - alert:
      - list:
        - /children: deep-equal
        - listitem: Required
        - listitem: Too short
  `);
  await screen.rerender({ errors: ["Required"] });
  await expect.element(page.getByRole("alert")).toHaveTextContent("Required");
  await expect.element(page.getByRole("list")).not.toBeInTheDocument();
  await screen.rerender({ errors: [] });
  await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
});
