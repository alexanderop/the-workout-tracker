import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const baseURL = `http://127.0.0.1:4181${process.env.VITE_BASE_PATH ?? "/"}`;

export default defineConfig({
  testDir: defineBddConfig({
    features: "test/e2e/*.feature",
    steps: "test/e2e/*.steps.ts",
    outputDir: ".test-generated",
  }),
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        defaultBrowserType:
          process.env.WORKOUT_BROWSER === "webkit" ? "webkit" : "chromium",
      },
    },
  ],
  webServer: {
    command: "pnpm exec vite preview --host 127.0.0.1 --port 4181 --strictPort",
    url: baseURL,
    reuseExistingServer: false,
  },
});
