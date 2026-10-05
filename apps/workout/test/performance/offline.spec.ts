import { expect, test } from "@playwright/test";
import { readdir } from "node:fs/promises";

test("previously unopened exercise artwork works after an offline restart", async ({
  page,
  context,
  baseURL,
}) => {
  if (!baseURL) throw new Error("Performance base URL is required");
  const artwork = (await readdir("dist/assets"))
    .filter((name) => name.endsWith(".webp"))
    .map((name) => new URL(`assets/${name}`, baseURL).href);
  expect(artwork.length).toBeGreaterThan(0);
  // Install from the empty workouts page, before opening the image catalog.
  await page.goto(`${baseURL}#/workouts`);
  await expect(
    page.getByRole("heading", { name: "Workouts", exact: true }),
  ).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  await context.setOffline(true);
  await page.close();
  const reopened = await context.newPage();
  await reopened.goto(`${baseURL}#/exercises`);
  await expect(
    reopened.getByRole("heading", { name: "Exercises", exact: true }),
  ).toBeVisible();
  // Inspect every emitted image, including artwork not currently visible.
  // Exercises without a matched illustration may legitimately use an icon.
  await reopened.evaluate(async (urls) => {
    for (const url of urls) {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Offline artwork failed: ${url}`);
      const bitmap = await createImageBitmap(await response.blob());
      bitmap.close();
    }
  }, artwork);
  const rows = reopened.locator(".catalog-row");
  await expect(rows.first()).toBeVisible();
  const images = rows.locator("img");
  await expect(images.first()).toBeVisible();
  const count = await images.count();
  // Decode every image, including ones below the viewport. An error fallback
  // must not make missing offline artwork silently pass this regression check.
  const decoded = await images.evaluateAll(async (elements) => {
    await Promise.all(
      elements.map(async (image) => {
        if (!(image instanceof HTMLImageElement))
          throw new Error("Expected exercise image");
        image.loading = "eager";
        await image.decode();
      }),
    );
    return elements.every(
      (image) => image instanceof HTMLImageElement && image.naturalWidth > 0,
    );
  });
  expect(decoded).toBe(true);
  await expect(images).toHaveCount(count);
});
